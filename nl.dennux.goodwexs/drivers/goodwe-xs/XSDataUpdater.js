'use strict';

/**
 * Updates Homey device capabilities with parsed GoodWe XS data.
 *
 * This class is responsible only for the translation between
 * inverter data and Homey capabilities.
 *
 * It does not:
 * - communicate with the inverter;
 * - read Modbus registers;
 * - parse inverter data;
 * - manage polling.
 *
 * Data flow:
 *
 * ModbusClient
 *      |
 *      v
 * XSRuntime
 *      |
 *      v
 * XSParser
 *      |
 *      v
 * XSDataUpdater
 *      |
 *      v
 * Homey capabilities
 *
 */

class XSDataUpdater {

  /**
       * @param {Homey.Device} device Homey device instance
       * @param {Logger} logger Shared application logger
       */
  constructor(device, logger) {

    this.device = device;
    this.logger = logger;

  }

  /**
       * Update all Homey capabilities based on parsed inverter data.
       *
       * @param {object} data Parsed XS inverter data
       */
  async update(data) {

    await this.device.setCapabilityValue(
      'measure_power',
      data.power,
    );

    await this.device.setCapabilityValue(
      'measure_power.total_input',
      data.dcInputPower,
    );

    await this.device.setCapabilityValue(
      'measure_power.apparent',
      data.apparentPower,
    );

    await this.device.setCapabilityValue(
      'meter_power',
      data.totalYield,
    );

    await this.device.setCapabilityValue(
      'meter_power.daily',
      data.dailyYield,
    );

    await this.device.setCapabilityValue(
      'measure_voltage',
      data.mpptVoltage,
    );

    await this.device.setCapabilityValue(
      'measure_voltage.grid',
      data.gridVoltage,
    );

    await this.device.setCapabilityValue(
      'measure_current',
      data.mpptCurrent,
    );

    await this.device.setCapabilityValue(
      'measure_current.grid',
      data.gridCurrent,
    );

    await this.device.setCapabilityValue(
      'measure_current.leakage',
      data.leakageCurrent,
    );

    await this.device.setCapabilityValue(
      'measure_temperature',
      data.temperature,
    );

    await this.device.setCapabilityValue(
      'inverter_timestamp',
      data.inverterTimestamp,
    );

    await this.device.setCapabilityValue(
      'inverter_efficiency',
      data.efficiency,
    );

    await this.device.setCapabilityValue(
      'inverter_grid_frequency',
      data.gridFrequency,
    );

    await this.device.setCapabilityValue(
      'inverter_power_factor',
      data.powerFactor,
    );

    await this.device.setCapabilityValue(
      'inverter_fault_code',
      data.faultCode,
    );

    await this.device.setCapabilityValue(
      'inverter_operating_hours',
      data.operatingHours,
    );

    await this.device.setCapabilityValue(
      'inverter_rssi',
      data.rssi,
    );

    // Translate inverter work mode code to the Homey language.
    const workMode = this.device.homey.__(
      `work_mode.${data.workModeCode}`,
    );

    await this.device.setCapabilityValue(
      'inverter_work_mode',
      workMode,
    );

    // Fault state is based on inverter work mode and fault code.
    const inverterFault = data.workModeCode === 2
            || data.faultCode !== '0x00000000';

    await this.device.setCapabilityValue(
      'alarm_generic',
      inverterFault,
    );

  }

  /**
   * Update Homey connection status capabilities.
   *
   * This is called by XSRuntime when the communication state
   * with the inverter changes.
   *
   * @param {boolean} connected Current inverter connection state
   */
  async updateConnectionStatus(connected) {

    const status = connected
      ? this.device.homey.__(
        'connection_status.connected',
      )
      : this.device.homey.__(
        'connection_status.disconnected',
      );

    await this.device.setCapabilityValue(
      'connection_status',
      status,
    );

    await this.device.setCapabilityValue(
      'alarm_generic',
      !connected,
    );

    if (connected) {

      await this.device.setAvailable();

    } else {

      await this.device.setUnavailable(
        'GoodWe inverter is not reachable',
      );

    }

  }

}

module.exports = XSDataUpdater;
