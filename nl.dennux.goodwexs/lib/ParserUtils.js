'use strict';


/*
 * =============================================================================
 * Parser Utilities
 * =============================================================================
 *
 * Generic helper functions used to convert raw Modbus register values
 * into usable JavaScript values.
 *
 * This file contains no device-specific register mappings.
 *
 * =============================================================================
 */


class ParserUtils {


    /**
     * Converts two Modbus registers into an unsigned 32-bit value.
     *
     * Modbus registers are 16-bit values.
     * Some devices store larger values as two consecutive registers:
     *
     * High word -> first register
     * Low word  -> second register
     *
     * Example:
     * Register 30128 + 30129 = 32-bit power value
     *
     * @param {number} high High word
     * @param {number} low Low word
     * @returns {number}
     */
    static toUInt32(high, low) {

        return (
            (high << 16) +
            low
        );

    }


    /**
     * Converts a Modbus 16-bit value into a signed integer.
     *
     * Modbus registers are unsigned by default.
     * Values above 0x7FFF represent negative numbers.
     *
     * Example:
     * Temperature registers can contain signed values.
     *
     * @param {number} value Raw 16-bit register value
     * @returns {number}
     */
    static toInt16(value) {

        return value > 0x7FFF
            ? value - 0x10000
            : value;

    }


    /**
     * Converts Modbus registers containing ASCII characters into text.
     *
     * Each Modbus register contains two bytes:
     *
     * High byte -> first character
     * Low byte  -> second character
     *
     * Empty bytes (0x00) and unused bytes (0xFF) are ignored.
     *
     * Used for values such as device serial numbers.
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



    /**
     * Converts a 3-register Modbus timestamp into a readable date/time.
     *
     * Input:
     *   3 registers = 6 bytes
     *
     * Byte layout:
     *   Byte 0: year - 2000
     *   Byte 1: month
     *   Byte 2: day
     *   Byte 3: hour
     *   Byte 4: minute
     *   Byte 5: second
     *
     * Example:
     *   [26, 7, 23, 10, 30, 15]
     *   becomes:
     *   23-07-2026 10:30:15
     *
     * @param {number[]} registers Three Modbus registers
     * @returns {string|null}
     */
    static parseTimestamp(registers) {

        if (registers.length < 3) {
            return null;
        }


        const bytes = [];


        for (const value of registers) {

            bytes.push(
                (value >> 8) & 0xFF,
                value & 0xFF
            );

        }


        const [
            yearOffset,
            month,
            day,
            hour,
            minute,
            second
        ] = bytes;


        const year = 2000 + yearOffset;


        if (
            month < 1 ||
            month > 12 ||
            day < 1 ||
            day > 31
        ) {
            return null;
        }


        const pad = (value) =>
            String(value).padStart(2, '0');


        return (
            `${pad(day)}-${pad(month)}-${year} ` +
            `${pad(hour)}:${pad(minute)}:${pad(second)}`
        );

    }


}


module.exports = ParserUtils;