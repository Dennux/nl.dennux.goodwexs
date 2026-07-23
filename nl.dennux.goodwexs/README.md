# GoodWe XS Homey App

Connect your GoodWe XS inverter to Homey using Modbus TCP and the GoodWe
WiFi/LAN Kit 2.0.

Monitor solar production, inverter status and important device
information locally without cloud dependencies.

## Overview

The app communicates directly with the inverter using Modbus TCP over
the local network.

Supported hardware: - GoodWe 2500-XS - GoodWe WiFi/LAN Kit 2.0

## Features

### Live monitoring

-   AC output power
-   DC input power
-   Daily energy yield
-   Total energy yield
-   Grid voltage and current
-   Grid frequency
-   Temperature
-   Operating hours
-   Power factor
-   Efficiency
-   Fault information

### Device information

-   Model
-   Serial number
-   Firmware version
-   Last identification update

Identification checks are limited to once every 24 hours to avoid
unnecessary Modbus traffic.

## Configuration

Connection: - IP address - Modbus TCP port - Modbus Unit ID

Defaults: - Port: 502 - Unit ID: 247

Communication: - 10 seconds - 30 seconds - 60 seconds - 2 minutes - 5
minutes

Diagnostics: - Debug logging

## Technical details

Built with: - Homey Apps SDK v3 - Node.js - Modbus TCP

Architecture:

    lib/
     ├── Constants.js
     └── ParserUtils.js

    drivers/
     └── goodwe-xs/
          ├── device.js
          ├── driver.js
          ├── GW2500XS_WL20.js
          └── GoodWeParser.js

## Limitations

-   Officially supported: GoodWe 2500-XS
-   Battery systems are not supported
-   Other GoodWe models require separate validation

# Changelog

## 1.0.2

### Added

-   Automatic inverter identification check
-   Identification storage
-   Last identification update timestamp
-   Display of model, serial number and firmware

### Improved

-   24-hour refresh logic
-   Debug logging
-   Homey timezone aware date formatting

## 1.0.1

### Added

-   Inverter identification reading
-   Firmware detection
-   Serial number detection
-   Identification register parsing

## 1.0.0

### Initial release

-   GoodWe 2500-XS Modbus TCP support
-   Live monitoring
-   Energy monitoring
-   Fault monitoring
-   Debug logging

## License

MIT License
