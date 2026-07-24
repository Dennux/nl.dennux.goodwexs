# GoodWe XS Homey App

Connect your GoodWe XS inverter to Homey using Modbus TCP and the GoodWe WiFi/LAN Kit 2.0.

Monitor solar production, inverter status and important device information locally without cloud dependencies.

## Overview

The app communicates directly with the inverter using Modbus TCP over the local network.

Supported hardware:

- GoodWe XS series (validated with GoodWe 2500-XS)
- GoodWe WiFi/LAN Kit 2.0

The app does not use cloud services. All communication is handled locally between Homey and the inverter.

## Features

### Live monitoring

Monitor the most important inverter values:

- AC output power
- DC input power
- Daily energy yield
- Total energy yield
- Grid voltage and current
- Grid frequency
- Temperature
- Operating hours
- Power factor
- Efficiency
- Fault information

### Device information

The app retrieves and stores inverter information:

- Model
- Serial number
- Firmware version
- Last identification update

Identification checks are limited to once every 24 hours to reduce unnecessary Modbus traffic.

### Connection monitoring

The app monitors the communication with the inverter:

- Detects communication failures
- Shows connection status
- Marks the device unavailable when communication is lost
- Automatically restores the device when communication returns

## Configuration

During pairing configure:

Connection:

- IP address
- Modbus TCP port
- Modbus Unit ID

Defaults:

- Port: 502
- Unit ID: 247

Polling interval:

- 10 seconds
- 30 seconds
- 60 seconds
- 2 minutes
- 5 minutes

Diagnostics:

- Debug logging

## Requirements

- Homey Pro
- GoodWe XS inverter
- GoodWe WiFi/LAN Kit 2.0
- Local network connection between Homey and inverter

## Technical details

Built with:

- Homey Apps SDK v3
- Node.js
- Modbus TCP

Architecture:

lib/
├── Constants.js
├── ParserUtils.js
└── Logger.js

drivers/
└── goodwe-xs/
├── device.js
├── driver.js
├── GW_XS_WL20.js
├── XSParser.js
├── XSRuntime.js
└── XSDataUpdater.js


The application separates:

- Homey device lifecycle handling
- Runtime communication management
- Modbus data parsing
- Capability updates

This keeps the application maintainable and allows future GoodWe XS series extensions.

## Limitations

- Officially validated with GoodWe 2500-XS
- Battery systems are not supported
- Other GoodWe models require separate validation
- Automatic network discovery is not supported

## License

MIT License