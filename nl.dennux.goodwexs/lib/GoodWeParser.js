'use strict';

const CONSTANTS = require('./Constants');

/*
 * =============================================================================
 * GoodWe Parser
 * =============================================================================
 *
 * Converts raw Modbus register data into meaningful JavaScript objects.
 *
 * Verified hardware:
 *   ✔ GoodWe 2500-XS
 *
 * Notes:
 *   - Identification block starts at Modbus register 30004.
 *   - Serial number is stored as 8 Modbus registers (16 ASCII characters).
 *   - Firmware register offsets have been verified on real hardware.
 *
 * Future support for additional GoodWe models should only be added after
 * validation on the corresponding hardware.
 * =============================================================================
 */

class GoodWeParser {

    /**
     * Parses the complete identification block.
     *
     * @param {number[]} registers Raw identification registers.
     * @returns {Object}
     */
    static parseIdentification(registers) {

        const serialNumber = this.registersToAscii(
            registers.slice(
                CONSTANTS.MODBUS.IDENTIFICATION.OFFSET.SERIAL_START,
                CONSTANTS.MODBUS.IDENTIFICATION.OFFSET.SERIAL_START +
                CONSTANTS.MODBUS.IDENTIFICATION.OFFSET.SERIAL_LENGTH
            )
        );

        const dsp1 = registers[
            CONSTANTS.MODBUS.IDENTIFICATION.OFFSET.DSP1_VERSION
        ];

        const dsp2 = registers[
            CONSTANTS.MODBUS.IDENTIFICATION.OFFSET.DSP2_VERSION
        ];

        const arm = registers[
            CONSTANTS.MODBUS.IDENTIFICATION.OFFSET.ARM_VERSION
        ];

        const firmwareVersion =
            `${dsp1}.${dsp2}.${arm.toString(16).toUpperCase().padStart(2, '0')}`;

        return {

            serialNumber,

            /*
             * This parser is currently validated only for the
             * GoodWe 2500-XS driver.
             *
             * Future versions may derive the model automatically
             * from the serial number after validation on additional
             * GoodWe inverter models.
             */
            model: 'GoodWe 2500-XS',

            firmware: {

                version: firmwareVersion,

                dsp1,

                dsp2,

                arm

            }

        };

    }

    /**
     * Converts Modbus registers containing ASCII characters to text.
     *
     * Every Modbus register contains two ASCII characters:
     *
     * High byte -> first character
     * Low byte  -> second character
     *
     * Bytes with value 0x00 or 0xFF are ignored.
     *
     * @param {number[]} registers
     * @returns {string}
     */
    static registersToAscii(registers) {

        let text = '';

        for (const value of registers) {

            const high = (value >> 8) & 0xFF;
            const low = value & 0xFF;

            if (high !== 0x00 && high !== 0xFF) {
                text += String.fromCharCode(high);
            }

            if (low !== 0x00 && low !== 0xFF) {
                text += String.fromCharCode(low);
            }

        }

        return text.trim();

    }

}

module.exports = GoodWeParser;