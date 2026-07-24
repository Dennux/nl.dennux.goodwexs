'use strict';

const ModbusRTU = require('modbus-serial');

class ModbusClient {

  constructor(ip, port, unitId, timeout = 5000) {

    this.ip = ip;
    this.port = port;
    this.unitId = unitId;
    this.timeout = timeout;

    this.client = new ModbusRTU();

  }

  async connect() {

    await this.client.connectTCP(this.ip, {
      port: this.port,
    });

    this.client.setID(this.unitId);

    this.client.setTimeout(this.timeout);

  }

  async disconnect() {

    if (!this.client.isOpen) {
      return;
    }

    await this.client.close();

  }

  async readHoldingRegisters(start, length) {

    const result = await this.client.readHoldingRegisters(
      start,
      length,
    );

    return result.data;

  }

}

module.exports = ModbusClient;
