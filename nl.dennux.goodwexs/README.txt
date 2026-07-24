# GoodWe XS

Connect your GoodWe XS inverter to Homey using Modbus TCP and the GoodWe WiFi/LAN Kit 2.0.

Monitor your inverter locally in Homey without requiring an external cloud connection.

## Supported hardware

- GoodWe XS series (validated with GoodWe 2500-XS)
- GoodWe WiFi/LAN Kit 2.0

## Features

### Live monitoring

Monitor important inverter data:

- Current power production
- Daily and total energy yield
- Grid voltage, current and frequency
- Temperature
- Operating hours
- Efficiency
- Fault information

### Device information

The app retrieves inverter information:

- Model
- Serial number
- Firmware version

### Connection monitoring

The app monitors communication with the inverter:

- Shows connection status
- Detects communication failures
- Automatically restores the connection when communication returns

## Configuration

During pairing configure:

- IP address
- Modbus TCP port
- Modbus Unit ID

Optional settings:

- Polling interval
- Debug logging

Default Modbus settings:

- Port: 502
- Unit ID: 247

## Requirements

- Homey Pro
- GoodWe XS inverter
- GoodWe WiFi/LAN Kit 2.0
- Local network connection

## Limitations

- Officially validated with GoodWe 2500-XS
- Battery systems are not supported
- Other GoodWe models require separate validation
- Automatic network discovery is not supported

## License

MIT License