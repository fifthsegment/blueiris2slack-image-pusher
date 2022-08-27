## BlueIris 2 Slack image pusher

This app allows you to push CCTV camera images to Slack via Backblaze, whenever an alert is generated on BlueIris.
This can be run on any platform, but since BlueIris mostly supports windows, Im shipping this with a windows binary.

**Pre-requisite: You must have a Backblaze B2 account with a public bucket and an API Key that ONLY allows access to that bucket.**

### Running this on Windows

- Download the [pusher binary](https://github.com/fifthsegment/blueiris2slack-image-pusher/blob/main/blueiris2Slack.pusher.app.exe) from this repo and place it anywhere on your PC (as long as you remember the path)
- Create a config file using the template below and place it in the directory which has the pusher binary
- Ask BlueIris to run the binary on alerts.

![blueiris-setup](https://user-images.githubusercontent.com/5513549/187025589-368368d5-18d5-45ed-b1c0-082e11848d12.PNG)


### config.json
```

{
    "directoryToRead": "BlueIris-Image-Containing directory path",
    "applicationKeyId" : "Backblaze B2 applicationKeyId",
    "applicationKey": "Backblaze B2 applicationKey",
    "slackWebhook" : "Slack webhook url"
}

```

