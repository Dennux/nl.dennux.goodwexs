'use strict';

const ModbusRTU = require('modbus-serial');
const CONSTANTS = require('./Constants');

class GoodWeConnection {

    constructor(ip, port, unitId) {

        this.ip = ip;
        this.port = port;
        this.unitId = unitId;

        this.client = new ModbusRTU();

    }

    async connect() {

        await this.client.connectTCP(this.ip, {
            port: this.port
        });

        this.client.setID(this.unitId);

    }

    async disconnect() {

        if (!this.client.isOpen) {
            return;
        }

        await this.client.close();

    }

    async readIdentification() {

    const result = await this.client.readHoldingRegisters(
        CONSTANTS.MODBUS.IDENTIFICATION.START,
        CONSTANTS.MODBUS.IDENTIFICATION.COUNT
    );

    return result.data;

}

}

module.exports = GoodWeConnection;