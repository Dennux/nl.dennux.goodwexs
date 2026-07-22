'use strict';
const IPV4_REGEX =
    /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;

/*
 * GoodWe 2500-XS Register Map
 *
 * Source:
 * - GoodWe Modbus Protocol Documentation
 *
 * Notes:
 * - Verified on physical GoodWe 2500-XS inverter.
 * - Identification block starts at address 30004 when using modbus-serial.
 */
module.exports = {

    IPV4_REGEX,

    DEFAULTS: {
        PORT: 502
    },

    PAIR_EVENTS: {
        TEST_CONNECTION: 'testConnection'
    },

    /*
    * GoodWe register addressing.
    *
    * Although the GoodWe documentation refers to the identification block
    * starting at register 30005, the modbus-serial library requires the
    * address 30004 to correctly read the expected data on the GoodWe 2500-XS.
    *
    * This has been verified against a physical inverter.
    * Do not change this without validating on hardware.
    */
    MODBUS: {
        DEFAULT_UNIT_ID: 247,
        DEFAULT_TIMEOUT: 5000,
        IDENTIFICATION: {

            START: 30004,
            COUNT: 35,

            OFFSET: {

                SERIAL_START: 0,
                SERIAL_LENGTH: 8,

                DSP1_VERSION: 30,
                DSP2_VERSION: 31,
                ARM_VERSION: 32

            }
        }
    }

};