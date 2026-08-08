'use strict';

const DEVICE = require('./GW_XS_WL20');
const ParserUtils = require('../../lib/ParserUtils');

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
 * The parser is device specific.
 * Register locations are defined in GW_XS_WL20.js.
 *
 * =============================================================================
 */

class XSParser {

  /**
     * Parses the complete identification block.
     *
     * @param {number[]} registers Raw identification registers.
     * @returns {Object}
     */
  static parseIdentification(registers) {

    const serialNumber = ParserUtils.registersToAscii(
      registers.slice(
        DEVICE.IDENTIFICATION.OFFSET.SERIAL_START,
        DEVICE.IDENTIFICATION.OFFSET.SERIAL_START
                + DEVICE.IDENTIFICATION.OFFSET.SERIAL_LENGTH,
      ),
    );

    const dsp1 = registers[
      DEVICE.IDENTIFICATION.OFFSET.DSP1_VERSION
    ];

    const dsp2 = registers[
      DEVICE.IDENTIFICATION.OFFSET.DSP2_VERSION
    ];

    const arm = registers[
      DEVICE.IDENTIFICATION.OFFSET.ARM_VERSION
    ];

    return {

      serialNumber,

      model: 'GoodWe XS series',

      firmware: {

        version:
                    `${dsp1}.${dsp2}.${arm.toString(16).toUpperCase().padStart(2, '0')}`,

        dsp1,
        dsp2,
        arm,

      },

    };

  }

  /**
 * Parses live data block.
 *
 * Register range:
 * 30100-30210
 *
 * Data is read in one Modbus request.
 */
  static parseLiveData(registers) {

    return {

      // GoodWe inverter timestamp
      // Registers 30101-30103
      // 3 registers = 6 bytes
      // Format handled by ParserUtils.parseTimestamp()
      inverterTimestamp:
                ParserUtils.parseTimestamp(
                  registers.slice(
                    DEVICE.LIVE_DATA.OFFSET.TIMESTAMP_START,
                    DEVICE.LIVE_DATA.OFFSET.TIMESTAMP_START + 3,
                  ),
                ),

      // MPPT-1
      // Register 30104
      // Scale: /10 V
      mpptVoltage:
                registers[
                  DEVICE.LIVE_DATA.OFFSET.VMPPT1
                ] / 10,

      // Register 30105
      // Scale: /10 A
      mpptCurrent:
                registers[
                  DEVICE.LIVE_DATA.OFFSET.IMPPT1
                ] / 10,

      // Grid voltage
      // Register 30119
      // Scale: /10 V
      gridVoltage:
                registers[
                  DEVICE.LIVE_DATA.OFFSET.VGRID1
                ] / 10,

      // Grid current
      // Register 30122
      // Scale: /10 A
      gridCurrent:
                registers[
                  DEVICE.LIVE_DATA.OFFSET.IGRID1
                ] / 10,

      // Grid frequency
      // Register 30125
      // Scale: /100 Hz
      gridFrequency:
                registers[
                  DEVICE.LIVE_DATA.OFFSET.FGRID1
                ] / 100,

      // AC output power
      // Registers 30128-30129
      // UInt32 high word + low word
      power:
                ParserUtils.toUInt32(
                  registers[
                    DEVICE.LIVE_DATA.OFFSET.PAC_HIGH
                  ],
                  registers[
                    DEVICE.LIVE_DATA.OFFSET.PAC_LOW
                  ],
                ),

      // Work mode
      // Register 30130
      workModeCode:
                registers[
                  DEVICE.LIVE_DATA.OFFSET.WORK_MODE
                ],

      // Fault code
      // Registers 30131-30132
      faultCode:
                `0x${ParserUtils.toUInt32(
                  registers[
                    DEVICE.LIVE_DATA.OFFSET.ERROR_CODES_HIGH
                  ],
                  registers[
                    DEVICE.LIVE_DATA.OFFSET.ERROR_CODES_LOW
                  ],
                ).toString(16).padStart(8, '0')}`,

      // Apparent power
      // Registers 30134-30135
      apparentPower:
                ParserUtils.toUInt32(
                  registers[
                    DEVICE.LIVE_DATA.OFFSET.APPARENT_POWER_HIGH
                  ],
                  registers[
                    DEVICE.LIVE_DATA.OFFSET.APPARENT_POWER_LOW
                  ],
                ),

      // Total DC input power
      // Registers 30138-30139
      dcInputPower:
                ParserUtils.toUInt32(
                  registers[
                    DEVICE.LIVE_DATA.OFFSET.TOTAL_INPUT_POWER_HIGH
                  ],
                  registers[
                    DEVICE.LIVE_DATA.OFFSET.TOTAL_INPUT_POWER_LOW
                  ],
                ),

      // Power factor
      // Register 30140
      // Signed value /1000
      powerFactor:
                ParserUtils.toInt16(
                  registers[
                    DEVICE.LIVE_DATA.OFFSET.POWER_FACTOR
                  ],
                ) / 1000,

      // Temperature
      // Register 30142
      temperature:
                ParserUtils.toInt16(
                  registers[
                    DEVICE.LIVE_DATA.OFFSET.TEMPERATURE
                  ],
                ) / 10,

      // Daily yield
      // Register 30145
      // kWh /10
      dailyYield:
                registers[
                  DEVICE.LIVE_DATA.OFFSET.DAILY_YIELD
                ] / 10,

      // Total yield
      // Registers 30146-30147
      // kWh /10
      totalYield:
                ParserUtils.toUInt32(
                  registers[
                    DEVICE.LIVE_DATA.OFFSET.TOTAL_YIELD_HIGH
                  ],
                  registers[
                    DEVICE.LIVE_DATA.OFFSET.TOTAL_YIELD_LOW
                  ],
                ) / 10,

      // Operating hours
      // Registers 30148-30149
      operatingHours:
                ParserUtils.toUInt32(
                  registers[
                    DEVICE.LIVE_DATA.OFFSET.H_TOTAL_HIGH
                  ],
                  registers[
                    DEVICE.LIVE_DATA.OFFSET.H_TOTAL_LOW
                  ],
                ),

      // WiFi signal strength
      // Register 30173
      rssi:
               ParserUtils.toInt16(   registers[
                  DEVICE.LIVE_DATA.OFFSET.RSSI
                ],),

      // Leakage current
      // Register 30211
      // Scale /10 mA
      leakageCurrent:
                ParserUtils.toInt16(
            registers[
              DEVICE.LIVE_DATA.OFFSET.LEAKAGE_CURRENT
            ],
          ) / 10,

      // Calculated efficiency
      efficiency:
                this.calculateEfficiency(
                  registers,
                ),

    };

  }

  static calculateEfficiency(registers) {

    const dcInputPower = ParserUtils.toUInt32(
      registers[
        DEVICE.LIVE_DATA.OFFSET.TOTAL_INPUT_POWER_HIGH
      ],
      registers[
        DEVICE.LIVE_DATA.OFFSET.TOTAL_INPUT_POWER_LOW
      ],
    );

    const acOutputPower = ParserUtils.toUInt32(
      registers[
        DEVICE.LIVE_DATA.OFFSET.PAC_HIGH
      ],
      registers[
        DEVICE.LIVE_DATA.OFFSET.PAC_LOW
      ],
    );

    if (dcInputPower <= 0) {
      return 0;
    }

    return Number(
      ((acOutputPower / dcInputPower) * 100)
        .toFixed(2),
    );

  }

}

module.exports = XSParser;
