const B2 = require('backblaze-b2');
const fs = require('fs');
const axios = require('axios');
const imageExts = ["jpg", "jpeg"];
let b2 = null;
const bucketId = process.env.bucketId;

const buildB2 = (config) => {
    return new B2({
        applicationKeyId: config.applicationKeyId, // or accountId: 'accountId'
        applicationKey: config.applicationKey // or masterApplicationKey
      });
}

const getConfig = async (configPath="./config.json") => {
    try {
        console.log("Reading config file from " + configPath)
        const config = fs.readFileSync(configPath,{encoding:'utf8', flag:'r'});
        return JSON.parse(config);
    }
    catch(e) {
        console.log("Unable to read config file at " + configPath);
        console.log("Error", e);
        return undefined;
    }
}

const getPublicUrl = (b, fileName) => {
    const {data} = b;
    return `${data.downloadUrl}/file/${data.allowed.bucketName}/${fileName}`
}

async function readDirectory(dir) {
    return fs.readdirSync(dir).filter(function(file){
        const fileName = file.toLocaleLowerCase();
        return imageExts.some(ext => fileName.includes(`.${ext}`))
    }).sort(function(a, b) {
        return fs.statSync(dir + b).mtime.getTime() - 
               fs.statSync(dir + a).mtime.getTime();
    });
}

async function UploadFile(config, bucketId, fileName) {
  try {
    
    const b = await b2.authorize(); // must authorize first (authorization lasts 24 hrs)
    //const buckets = await b2.listBuckets();
    let response = await b2.getUploadUrl({
        bucketId: bucketId
        // ...common arguments (optional)
    });
    console.log("Got upload url")
    const filePath = `${config.directoryToRead}/${fileName}`;
    console.log("Reading File", filePath)
    const fileData = fs.readFileSync(filePath);
    console.log("Starting upload")
    const file = await b2.uploadFile({
        uploadUrl: response.data.uploadUrl,
        uploadAuthToken: response.data.authorizationToken,
        fileName: fileName,
        data: fileData,
        onUploadProgress: (event) => {
            console.log("Progress", event);
        } 
    });
    console.log("Upload complete")
    const url = getPublicUrl(b, file.data.fileName);
    console.log("File url : " + url );
    return url;
  } catch (err) {
    console.log('Error: ', err);
  }
  return ''
}

async function pushToSlack  (config, url, text =  "Motion Detection Alert" ) {
    console.log("Pushing image to slack")
    try {
        const payload = {
            "attachments": [
                {
                    "fallback": text,
                    "text": text,
                    "image_url": url,
                }
            ]
        };
        const options = {
          method: 'post',
          baseURL: config.slackWebhook,
          headers: {
            'Content-Type': 'application/json'
          },
          data: payload
        };
        await axios.request(options);
      } catch (e) {
        const status = e;
        console.error(`There was an error while pushing to Slack: ${status}`);
      }
}


async function main() {
    try {
        const config = await getConfig(process.argv.length> 2 ? process.argv[2].toString(): undefined);
        if (config) {
            b2 = buildB2(config);
            const backblaze = await b2.authorize();
            const bucketId = backblaze.data.allowed.bucketId;
            if (bucketId) {
                const files = await readDirectory(config.directoryToRead);
                files.map(async (fileName) => {
                    const url = await UploadFile(config, bucketId, fileName);
                    if (url) {
                        await pushToSlack(config, url)
                    }
                })
                if (files.length === 0) {
                    console.log("No image files in the directory")
                }
            }
        }
    }
    catch(e) {
        console.log("Error", e)
    }
}

main();