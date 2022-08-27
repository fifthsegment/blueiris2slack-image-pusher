## BlueIris 2 Slack image pusher

This app allows you to push images whenever an alert is generated on BlueIris to your Slack.
This can be run on any platform, but since BlueIris mostly supports windows, Im shipping this a windows binary.

### Running this on Windows

- Create a config file using the template below and place it in the directory which has the pusher binary
- Ask BlueIris to run the binary on alerts.


### config.json
```

{
    "directoryToRead": "BlueIris-Image-Containing directory path",
    "applicationKeyId" : "Backblaze B2 applicationKeyId",
    "applicationKey": "Backblaze B2 applicationKey",
    "slackWebhook" : "Slack webhook url"
}

```
