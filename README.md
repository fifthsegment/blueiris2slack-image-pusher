## BlueIris 2 Slack image pusher

This app allows you to push CCTV camera images to Slack via Backblaze, whenever an alert is generated on BlueIris.
This can be run on any platform, but since BlueIris mostly supports windows, Im shipping this with a windows binary.

### Running this on Windows

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

