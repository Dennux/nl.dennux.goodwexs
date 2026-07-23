'use strict';

/*
 * =============================================================================
 * GoodWe 2500-XS with WiFi/LAN Kit 2.0
 * Modbus Register Map
 * =============================================================================
 *
 * Verified hardware:
 *   GoodWe 2500-XS
 *   WiFi/LAN Kit 2.0
 *
 * Communication:
 *   Modbus TCP
 *
 * Notes:
 *
 *   - This file describes the hardware register layout.
 *   - Offsets are relative to the start address of the read block.
 *   - The parser uses offsets.
 *   - Real Modbus addresses are documented in comments.
 *
 *   - 32-bit values are stored as:
 *       HIGH register
 *       LOW register
 *
 *     Calculation:
 *       (HIGH << 16) + LOW
 *
 *   - The live data block contains 111 registers.
 *     This stays below the Modbus maximum read size of 125 registers.
 *
 * Addressing example:
 *
 *   START  : 30100
 *   OFFSET : 18
 *
 *   Modbus register:
 *       30100 + 18 + 1 = 30119
 *
 * =============================================================================
 */


module.exports = {


     /*
 * -------------------------------------------------------------------------
 * Identification block
 * -------------------------------------------------------------------------
 *
 * Documentation of the GoodWe identification register block.
 *
 * The current pairing implementation uses the Modbus settings
 * from:
 *
 *   lib/Constants.js
 *
 * This section is kept here as part of the complete hardware register map.
 *
 * Contains:
 *   - serial number
 *   - firmware information
 *   - inverter identification data
 *
 * Modbus registers:
 *   30004 - 30038
 *
 * Length:
 *   35 registers
 *
 */
    IDENTIFICATION: {

        START: 30004,

        COUNT: 35

    },


    /*
     * -------------------------------------------------------------------------
     * Live data block
     * -------------------------------------------------------------------------
     *
     * Read range:
     *   30101 - 30211
     *
     * Length:
     *   111 registers
     *
     */
    LIVE_DATA: {

        START: 30100,

        COUNT: 111,


        OFFSET: {


            /*
             * Timestamp
             *
             * Registers:
             *   30101 - 30103
             *
             * Offset:
             *   0 - 2
             *
             * Length:
             *   3 registers
             *   6 bytes
             */
            TIMESTAMP_START: 0,


            /*
             * MPPT 1 voltage
             *
             * Register:
             *   30104
             *
             * Offset:
             *   3
             */
            VMPPT1: 3,


            /*
             * MPPT 1 current
             *
             * Register:
             *   30105
             *
             * Offset:
             *   4
             */
            IMPPT1: 4,


            /*
             * Grid voltage L1
             *
             * Register:
             *   30119
             *
             * Offset:
             *   18
             *
             * Scale:
             *   /10 = Volt
             */
            VGRID1: 18,


            /*
             * Grid current L1
             *
             * Register:
             *   30122
             *
             * Offset:
             *   21
             *
             * Scale:
             *   /10 = Ampere
             */
            IGRID1: 21,


            /*
             * Grid frequency L1
             *
             * Register:
             *   30125
             *
             * Offset:
             *   24
             *
             * Scale:
             *   /100 = Hertz
             */
            FGRID1: 24,


            /*
             * AC output power
             *
             * Registers:
             *   30128 HIGH
             *   30129 LOW
             *
             * Offset:
             *   27 - 28
             *
             * Data type:
             *   UInt32
             */
            PAC_HIGH: 27,
            PAC_LOW: 28,


            /*
             * Working mode
             *
             * Register:
             *   30130
             *
             * Offset:
             *   29
             */
            WORK_MODE: 29,


            /*
             * Error code
             *
             * Registers:
             *   30131 HIGH
             *   30132 LOW
             *
             * Offset:
             *   30 - 31
             *
             * Data type:
             *   UInt32
             */
            ERROR_CODES_HIGH: 30,
            ERROR_CODES_LOW: 31,


            /*
             * Apparent power
             *
             * Registers:
             *   30134 HIGH
             *   30135 LOW
             *
             * Offset:
             *   33 - 34
             *
             * Unit:
             *   VA
             */
            APPARENT_POWER_HIGH: 33,
            APPARENT_POWER_LOW: 34,


            /*
             * Total input power
             *
             * Registers:
             *   30138 HIGH
             *   30139 LOW
             *
             * Offset:
             *   37 - 38
             *
             * Data type:
             *   UInt32
             */
            TOTAL_INPUT_POWER_HIGH: 37,
            TOTAL_INPUT_POWER_LOW: 38,


            /*
             * Power factor
             *
             * Register:
             *   30140
             *
             * Offset:
             *   39
             *
             * Scale:
             *   /1000
             *
             * Signed value
             */
            POWER_FACTOR: 39,


            /*
             * Temperature
             *
             * Register:
             *   30142
             *
             * Offset:
             *   41
             */
            TEMPERATURE: 41,


            /*
             * Daily energy yield
             *
             * Register:
             *   30145
             *
             * Offset:
             *   44
             */
            DAILY_YIELD: 44,


            /*
             * Total energy yield
             *
             * Registers:
             *   30146 HIGH
             *   30147 LOW
             *
             * Offset:
             *   45 - 46
             *
             * Data type:
             *   UInt32
             */
            TOTAL_YIELD_HIGH: 45,
            TOTAL_YIELD_LOW: 46,


            /*
             * Total operating hours
             *
             * Registers:
             *   30148 HIGH
             *   30149 LOW
             *
             * Offset:
             *   47 - 48
             *
             * Data type:
             *   UInt32
             */
            H_TOTAL_HIGH: 47,
            H_TOTAL_LOW: 48,


            /*
             * WiFi signal strength
             *
             * Register:
             *   30173
             *
             * Offset:
             *   72
             */
            RSSI: 72,


            /*
             * Ground leakage current
             *
             * Register:
             *   30211
             *
             * Offset:
             *   110
             *
             * Scale:
             *   Not verified
             */
            LEAKAGE_CURRENT: 110

        }

    }

};