'use strict';

const Homey = require('homey');

const GoodWeConnection = require('../../lib/GoodWeConnection');


class GoodWeXSDevice extends Homey.Device {


    async onInit() {

        this.log(
            `GoodWe 2500-XS "${this.getName()}" initialized`
        );


        this.settings = this.getSettings();


        if (this.settings.debug) {

            this.log(
                '[DEBUG] Device settings:',
                this.settings
            );

        }


        this.connection = new GoodWeConnection(
            this.settings.ip,
            Number(this.settings.port),
            Number(this.settings.unitId)
        );


        if (this.settings.debug) {

            this.log(
                '[DEBUG] Modbus connection created'
            );

        }

    }


}


module.exports = GoodWeXSDevice;