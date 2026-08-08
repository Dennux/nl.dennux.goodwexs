
# Changelog

All notable changes to this project will be documented in this file.


## [1.2.0] - 2026-07-27

### Added

- Added GoodWe inverter identification support.
  - Reads and stores:
    - inverter model
    - serial number
    - firmware version
  - Identification data is refreshed periodically.

- Added dedicated XS runtime architecture.
  - Separated Modbus communication, polling logic and Homey updates.
  - Improved maintainability and preparation for future XS models.

- Added GoodWe XS data updater component.
  - Centralized Homey capability updates.
  - Reduced coupling between device logic and inverter data processing.

- Added inverter work mode flow support.
  - Added translated work mode values.
  - Supports:
    - Waiting
    - Normal operation
    - Fault
    - Self check
    - Firmware update

- Added improved connection status handling.
  - Connection failures are tracked.
  - Connection recovery is detected automatically.

- Added daily yield history storage.
  - Used for historical energy calculations.
  - Maintains inverter production history inside Homey.

- Added improved debug logging.
  - Raw Modbus register output can be inspected.
  - Parsed inverter data can be traced during development.

---

### Changed

- Updated register handling for GoodWe XS series with WiFi/LAN Kit 2.0.
- Improved Modbus polling stability.
- Improved settings change handling.
  - IP address changes
  - Port changes
  - Unit ID changes
  - Timeout changes
  - Poll interval changes

- Improved identification handling.
  - Identification reads no longer interfere with normal polling.

- Updated internal naming from model-specific GoodWe 2500-XS references towards XS series support.

---

### Fixed

- Fixed incorrect runtime lifecycle handling.
  - Runtime now manages its own polling lifecycle.
  - Prevented duplicate polling timers.

- Fixed Modbus connection recovery issues.
  - Failed connections are handled without crashing the device.
  - Connection status is restored after recovery.

- Fixed incorrect handling of changed device settings.
  - Runtime now recreates Modbus connections when required.

- Fixed pairing and initialization issues.
  - Improved startup reliability.

- Fixed work mode flow handling.
  - Flow triggers now use consistent inverter status values.

- Fixed identification data persistence.
  - Serial number and firmware information are stored correctly.

- Fixed inconsistent Homey capability updates.
  - Capability updates are now centralized through XSDataUpdater.

---

### Technical notes

- Modbus TCP communication intentionally uses:
  - connect
  - read registers
  - disconnect

  This is a deliberate design choice to avoid keeping the Modbus interface occupied and to allow external diagnostic tools to access the inverter.

- Tested hardware:
  - GoodWe XS series
  - WiFi/LAN Kit 2.0
  - GoodWe 2500-XS


## [1.1.1] - 2026-07-24

### Fixed

- Fixed UInt32 Modbus parsing for values where the high register uses the sign bit.
- Improved reliability of large numeric values such as operating hours and fault codes.

## [1.1.0] - 2026-07-24

### Improved

- Improved overall application stability for production use.
- Improved Modbus TCP communication handling.
- Improved handling of connection loss and automatic recovery.
- Improved device availability handling when the inverter cannot be reached.
- Improved handling of device settings changes.
- Improved polling interval updates without unnecessary restarts.
- Improved debug logging and diagnostics.

### Improved

- Added inverter identification handling:
  - Model information
  - Serial number
  - Firmware information
- Added connection status monitoring.
- Added improved runtime management for the inverter communication.

### Fixed

- Fixed issues with runtime settings updates.
- Fixed issues where changed settings were not immediately applied.
- Fixed cleanup of communication resources when devices are removed or the app stops.
- Fixed internal separation between inverter register definitions and communication logic.

### Technical

- Moved GoodWe XS register definitions into a dedicated hardware definition file.
- Improved internal architecture separation:
  - Device lifecycle handling
  - Runtime communication
  - Register parsing
  - Capability updates
- Prepared the application for future GoodWe XS series extensions.

------------------------------------------------------------------------

## [1.0.3] - 2026-07-24

### Added

- Added dedicated XS runtime architecture.
- Added XSDataUpdater for centralized capability updates.
- Added custom Logger implementation with configurable debug logging.

### Improved

- Refactored GoodWe XS device handling into separate responsibilities:
    - device lifecycle handling
    - runtime communication handling
    - Modbus parsing
    - capability updates
- Renamed GoodWe parser to XSParser.
- Improved settings update handling.
- Improved polling configuration handling.
- Improved connection monitoring and recovery handling.

### Fixed

- Fixed runtime settings updates after device configuration changes.
- Fixed dynamic poll interval updates.
- Improved debug logging state updates.

### Technical

- Improved maintainability for future GoodWe XS series support.
- Kept Modbus TCP communication using connect/read/disconnect flow.

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

-   GoodWe XS Modbus TCP support.
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
