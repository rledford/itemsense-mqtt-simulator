## Configuration

Place a configuration file named `config.json` in the root of the application directory.

### Example Configuration File Content

```json
{
  "zones": ["Zone A", "Zone B"],
  "thresholds": ["Threshold A", "Threshold B"],
  "mqtt": {
    "host": "localhost",
    "port": 1883,
    "prefix": "",
    "suffix": "",
    "auth": true,
    "username": "username",
    "password": "password"
  },
  "reportingInterval": 1000,
  "tagHeartbeatDuration": 1000,
  "epcs": {
    "use": ["F0000000000000000000000000"],
    "total": 100
  }
}
```

| Parameter            | Description                                                                                                                                                                                                                                                                                                             |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| zones                | A list of zone names.                                                                                                                                                                                                                                                                                                   |
| thresholds           | A list of threshold names.                                                                                                                                                                                                                                                                                              |
| mqtt                 | The MQTT broker connection information. If `auth` is true, then the `username` and `password` are used when connecting to the broker. If provided, the `prefix` and `suffix` are joined with a topic using a `/` so that the full message topic will be `prefix/topic/suffix`. The topic will be `item` or `threshold`. |
| reportingInterval    | How often EPC tag activity data should be published to the MQTT broker.                                                                                                                                                                                                                                                 |
| tagHeartbeatDuration | How often an event will be generated for EPC tags.                                                                                                                                                                                                                                                                      |
| epcs                 | Specify EPC tags in the `use` property, and the `total` number of epcs to simulate with. If the `total` is greater than the number of EPC tags specified in the `use` property, then random EPC tags are generated until the `total` is reached.                                                                        |

NOTE: When the application is first started, it will set the next heartbeart for each EPC tag to some time in the future based on the `tagHeartbeatDuration` value. This helps simulate real-world environments where EPC tags are observed at slightly different times even when they are all within range of RFID readers.
