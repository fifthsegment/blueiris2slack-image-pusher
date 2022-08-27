const B2 = require("backblaze-b2");
const fs = require("fs");
const axios = require("axios");
require("log-node")();
const log = require("log");

const imageExts = ["jpg", "jpeg"];
let b2 = null;

const buildB2 = (config) => {
  return new B2({
    applicationKeyId: config.applicationKeyId, // or accountId: 'accountId'
    applicationKey: config.applicationKey, // or masterApplicationKey
  });
};

const getConfig = async (configPath = "./config.json") => {
  try {
    log.info("Reading config file from " + configPath);
    const config = fs.readFileSync(configPath, { encoding: "utf8", flag: "r" });
    return JSON.parse(config);
  } catch (e) {
    log.error("Unable to read config file at " + configPath);
    log.error("Error", e);
    return undefined;
  }
};

const getPublicUrl = (b, fileName) => {
  const { data } = b;
  return `${data.downloadUrl}/file/${data.allowed.bucketName}/${fileName}`;
};

async function readDirectory(dir) {
  return fs
    .readdirSync(dir)
    .filter(function (file) {
      const fileName = file.toLocaleLowerCase();
      return imageExts.some((ext) => fileName.includes(`.${ext}`));
    })
    .sort(function (a, b) {
      return (
        fs.statSync(dir + b).mtime.getTime() -
        fs.statSync(dir + a).mtime.getTime()
      );
    });
}

async function UploadFile(config, bucketId, fileName) {
  try {
    const b = await b2.authorize(); // must authorize first (authorization lasts 24 hrs)
    let response = await b2.getUploadUrl({ bucketId: bucketId });
    log.info("Got upload url");
    const filePath = `${config.directoryToRead}/${fileName}`;
    log.info("Reading File", filePath);
    const fileData = fs.readFileSync(filePath);
    log.info("Starting upload");
    const file = await b2.uploadFile({
      uploadUrl: response.data.uploadUrl,
      uploadAuthToken: response.data.authorizationToken,
      fileName: fileName,
      data: fileData,
      onUploadProgress: (event) => {
        log.info("Progress", event);
      },
    });
    log.info("Upload complete");
    const url = getPublicUrl(b, file.data.fileName);
    log.info("File url : " + url);
    return url;
  } catch (err) {
    log.error("Error: ", err);
  }
  return "";
}

async function pushToSlack(config, url, text = "Motion Detection Alert") {
  log.info("Pushing image to slack");
  try {
    const payload = {
      attachments: [
        {
          fallback: text,
          text: text,
          image_url: url,
        },
      ],
    };
    const options = {
      method: "post",
      baseURL: config.slackWebhook,
      headers: {
        "Content-Type": "application/json",
      },
      data: payload,
    };
    await axios.request(options);
  } catch (e) {
    const status = e;
    log.error(`There was an error while pushing to Slack: ${status}`);
  }
}

async function main() {
  try {
    const config = await getConfig(
      process.argv.length > 2 ? process.argv[2].toString() : undefined
    );
    if (config) {
      b2 = buildB2(config);
      const backblaze = await b2.authorize();
      const bucketId = backblaze.data.allowed.bucketId;
      if (bucketId) {
        const files = await readDirectory(config.directoryToRead);
        files.map(async (fileName) => {
          const url = await UploadFile(config, bucketId, fileName);
          if (url) {
            await pushToSlack(config, url);
          }
        });
        if (files.length === 0) {
          log.info("No image files in the directory");
        }
      }
    }
  } catch (e) {
    log.error("Error", e);
  }
}

main();
