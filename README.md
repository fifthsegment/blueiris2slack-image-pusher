## BlueIris 2 Slack image pusher

This app allows you to push CCTV camera images to Slack via Backblaze, whenever an alert is generated on BlueIris.
This can be run on any platform, but since BlueIris mostly supports windows, Im shipping this with a windows binary.

![Example-Notification](https://user-images.githubusercontent.com/5513549/187032118-98e76e7c-23d7-45b0-9d75-0717154672a5.PNG)

**Pre-requisite: You must have a [Slack app/Webhook](https://slack.com/help/articles/115005265063-Incoming-webhooks-for-Slack) and a Backblaze B2 account with a public bucket and an API Key that ONLY allows access to that bucket.**

### Running this on Windows

- Download the [pusher binary](https://github.com/fifthsegment/blueiris2slack-image-pusher/blob/main/build/blueiris2Slack.pusher.app.exe) from this repo and place it anywhere on your PC (as long as you remember the path)
- Create a **config.json** file using the template below and place it in the directory which has the pusher binary
- _NOTE: The first argument to the pusher binary is the location of the config.json file, without that agument, it assumes the config is in the current directory._
- Ask BlueIris to run the binary on alerts. Example setup:

![blueiris-setup](https://user-images.githubusercontent.com/5513549/187025589-368368d5-18d5-45ed-b1c0-082e11848d12.PNG)

### config.json

```

{
    "directoryToRead": "BlueIris-Image-Containing directory path",
    "applicationKeyId" : "Backblaze B2 applicationKeyId",
    "applicationKey": "Backblaze B2 applicationKey",
    "slackWebhook" : "Slack webhook url : string",
    "deleteAfterPush" : "true or false (delete image after push or not)"
}

```

### Running with the logger on

```
LOG_LEVEL=info yarn start
```

### Build for Windows x64

```
# clone this repo
yarn install
yarn build:win
# find the blueiris2Slack.pusher.app.exe file in the root directory
```
