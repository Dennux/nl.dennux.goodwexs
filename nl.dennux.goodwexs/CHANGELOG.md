# Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog principles.

------------------------------------------------------------------------

## \[1.0.2\] - 2026-07-23

### Added

-   Added automatic inverter identification checks.
-   Added storage of identification check timestamps.
-   Added display of:
    -   inverter model
    -   serial number
    -   firmware version
    -   last identification update time

### Improved

-   Identification data is checked automatically during normal polling.
-   Identification Modbus reads are limited to once every 24 hours.
-   Added debug logging for identification checks.
-   Added Homey timezone aware formatting for displayed dates.

### Technical

-   Identification timestamps are stored internally in UTC.
-   Display timestamps use the Homey configured timezone.
-   Reduced unnecessary Modbus communication.

------------------------------------------------------------------------

## \[1.0.1\] - 2026-07-23

### Added

-   Added GoodWe inverter identification reading.
-   Added serial number detection.
-   Added firmware version detection.
-   Added identification register parsing.

### Improved

-   Improved device startup sequence.
-   Identification information is read during device initialization.

------------------------------------------------------------------------

## \[1.0.0\] - 2026-07-23

### Initial release

First stable development release.

### Added

-   GoodWe 2500-XS Modbus TCP support.
-   Local communication through GoodWe WiFi/LAN Kit 2.0.
-   Live inverter monitoring.
-   Energy yield monitoring.
-   Power measurements.
-   Temperature monitoring.
-   Fault monitoring.
-   Configurable polling interval.
-   Debug logging support.

------------------------------------------------------------------------

## Future plans

Planned for future releases:

-   Connection lost and connection restored flow triggers.
-   Identification change detection flow trigger.
-   Additional GoodWe model support after validation.
-   Additional widgets and user interface improvements.
