const mongoose = require("mongoose");

// ==========================================================
// GAME TYPES
// ==========================================================

const TWO_DIGIT_GAME_TYPES = [
  "single",
  "jodi",
  "last-digit",
  "first-digit",
];

const THREE_DIGIT_GAME_TYPES = [
  "single",
  "single-Patti",
  "double-Patti",
  "triple-Patti",
  "jodi",
  "panna",
  "half-sangam",
  "full-sangam",
  "last-digit",
  "first-digit",
];

const GAME_TYPES = [
  ...new Set([
    ...TWO_DIGIT_GAME_TYPES,
    ...THREE_DIGIT_GAME_TYPES,
  ]),
];

// ==========================================================
// WINNING NUMBERS SCHEMA
// ==========================================================

const winningNumbersSchema = new mongoose.Schema(
  {
    single: {
      type: String,
      default: null,
      trim: true,
    },

    "single-Patti": {
      type: String,
      default: null,
      trim: true,
    },

    "double-Patti": {
      type: String,
      default: null,
      trim: true,
    },

    "triple-Patti": {
      type: String,
      default: null,
      trim: true,
    },

    jodi: {
      type: String,
      default: null,
      trim: true,
    },

    panna: {
      type: String,
      default: null,
      trim: true,
    },

    "half-sangam": {
      type: String,
      default: null,
      trim: true,
    },

    "full-sangam": {
      type: String,
      default: null,
      trim: true,
    },

    "last-digit": {
      type: String,
      default: null,
      trim: true,
    },

    "first-digit": {
      type: String,
      default: null,
      trim: true,
    },
  },
  {
    _id: false,
    strict: true,
  }
);

// ==========================================================
// RESULT SCHEMA
// ==========================================================

const resultSchema = new mongoose.Schema(
  {
    marketId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Market",
      required: true,
      index: true,
    },

    marketDayId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    marketDate: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    marketName: {
      type: String,
      required: true,
      trim: true,
    },

    digitType: {
      type: String,
      enum: ["2-digit", "3-digit"],
      required: true,
      index: true,
    },

    winningNumber: {
      type: winningNumbersSchema,
      default: () => ({}),
    },

    resultDate: {
      type: Date,
      required: true,
      index: true,
    },

    nextOpenDate: {
      type: Date,
      required: true,
      index: true,
    },

    declaredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },

    totalBids: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalWinningBids: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalPayout: {
      type: Number,
      default: 0,
      min: 0,
    },

    status: {
      type: String,
      enum: [
        "pending",
        "declared",
        "cancelled",
      ],
      default: "declared",
      index: true,
    },

    remarks: {
      type: String,
      default: null,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// ==========================================================
// INDEXES
// ==========================================================

resultSchema.index(
  {
    marketId: 1,
    marketDate: 1,
  },
  {
    unique: true,
  }
);

resultSchema.index({
  resultDate: -1,
});

resultSchema.index({
  nextOpenDate: -1,
});

resultSchema.index({
  marketId: 1,
  status: 1,
});

resultSchema.index({
  digitType: 1,
  resultDate: -1,
});

// ==========================================================
// GET GAME TYPES
// ==========================================================

resultSchema.statics.getGameTypesForDigitType =
  function (digitType) {
    if (digitType === "2-digit") {
      return [...TWO_DIGIT_GAME_TYPES];
    }

    if (digitType === "3-digit") {
      return [...THREE_DIGIT_GAME_TYPES];
    }

    return [];
  };

// ==========================================================
// CHECK GAME TYPE
// ==========================================================

resultSchema.statics.isGameTypeAllowed =
  function (digitType, gameType) {
    const gameTypes =
      this.getGameTypesForDigitType(
        digitType
      );

    return gameTypes.includes(gameType);
  };

// ==========================================================
// CLEAN DIGITS
// ==========================================================

const cleanDigits = (value) => {
  return String(value ?? "").replace(
    /[^0-9]/g,
    ""
  );
};

// ==========================================================
// SINGLE
//
// 123456
//
// 1 + 2 + 3 + 4 + 5 + 6
// = 21
// = 2 + 1
// = 3
//
// SINGLE = 3
// ==========================================================

const getSingleDigit = (value) => {
  const digits =
    cleanDigits(value);

  if (!digits) {
    return "";
  }

  let sum = 0;

  for (const digit of digits) {
    sum += Number(digit);
  }

  while (sum >= 10) {
    sum = String(sum)
      .split("")
      .reduce(
        (total, digit) =>
          total + Number(digit),
        0
      );
  }

  return String(sum);
};

// ==========================================================
// FIRST DIGIT
// ==========================================================

const getFirstDigit = (value) => {
  const digits =
    cleanDigits(value);

  if (!digits) {
    return "";
  }

  return digits.charAt(0);
};

// ==========================================================
// LAST DIGIT
// ==========================================================

const getLastDigit = (value) => {
  const digits =
    cleanDigits(value);

  if (!digits) {
    return "";
  }

  return digits.charAt(
    digits.length - 1
  );
};

// ==========================================================
// THREE DIGIT
// ==========================================================

const getThreeDigit = (value) => {
  const digits =
    cleanDigits(value);

  if (!digits) {
    return "";
  }

  if (digits.length >= 3) {
    return digits.substring(0, 3);
  }

  return digits.padStart(3, "0");
};

// ==========================================================
// SINGLE PATTI
//
// 123 = TRUE
// 456 = TRUE
// 112 = FALSE
// 111 = FALSE
// ==========================================================

const isSinglePatti = (value) => {
  const digits =
    getThreeDigit(value);

  if (digits.length !== 3) {
    return false;
  }

  return (
    new Set(
      digits.split("")
    ).size === 3
  );
};

// ==========================================================
// DOUBLE PATTI
//
// 112 = TRUE
// 121 = TRUE
// 211 = TRUE
//
// 123 = FALSE
// 111 = FALSE
// ==========================================================

const isDoublePatti = (value) => {
  const digits =
    getThreeDigit(value);

  if (digits.length !== 3) {
    return false;
  }

  const counts = {};

  for (const digit of digits) {
    counts[digit] =
      (counts[digit] || 0) + 1;
  }

  const values =
    Object.values(counts).sort();

  return (
    values.length === 2 &&
    values[0] === 1 &&
    values[1] === 2
  );
};

// ==========================================================
// TRIPLE PATTI
//
// 111 = TRUE
// 222 = TRUE
//
// 123 = FALSE
// ==========================================================

const isTriplePatti = (value) => {
  const digits =
    getThreeDigit(value);

  if (digits.length !== 3) {
    return false;
  }

  return (
    digits.charAt(0) ===
      digits.charAt(1) &&
    digits.charAt(1) ===
      digits.charAt(2)
  );
};

// ==========================================================
// GENERATE COMPLETE WINNING RESULT
//
// RAW INPUT:
//
// 123456
//
// OUTPUT:
//
// single       = 3
// open panna   = 123
// close panna  = 456
// jodi         = 36
// first digit  = 1
// last digit   = 6
// half sangam  = 123-6
// full sangam  = 123-456
// ==========================================================

resultSchema.statics.formatWinningNumbers =
  function (winningNumber) {
    const number =
      cleanDigits(winningNumber);

    if (!number) {
      throw new Error(
        "Winning number is required"
      );
    }

    if (number.length !== 6) {
      throw new Error(
        "Winning number must be exactly 6 digits"
      );
    }

    // --------------------------------------------------------
    // OPEN PANNA
    // --------------------------------------------------------

    const openPanna =
      number.substring(0, 3);

    // --------------------------------------------------------
    // CLOSE PANNA
    // --------------------------------------------------------

    const closePanna =
      number.substring(3, 6);

    // --------------------------------------------------------
    // JODI
    //
    // 123456 -> 36
    // --------------------------------------------------------

    const jodi =
      number.charAt(2) +
      number.charAt(5);

    // --------------------------------------------------------
    // CREATE RESULT
    // --------------------------------------------------------

    const result = {
      single:
        getSingleDigit(number),

      "single-Patti":
        null,

      "double-Patti":
        null,

      "triple-Patti":
        null,

      jodi,

      panna:
        openPanna,

      "half-sangam":
        `${openPanna}-${number.charAt(5)}`,

      "full-sangam":
        `${openPanna}-${closePanna}`,

      "last-digit":
        number.charAt(5),

      "first-digit":
        number.charAt(0),
    };

    // --------------------------------------------------------
    // OPEN PANNA PATTI TYPE
    // --------------------------------------------------------

    if (
      isSinglePatti(openPanna)
    ) {
      result["single-Patti"] =
        openPanna;
    }

    if (
      isDoublePatti(openPanna)
    ) {
      result["double-Patti"] =
        openPanna;
    }

    if (
      isTriplePatti(openPanna)
    ) {
      result["triple-Patti"] =
        openPanna;
    }

    return result;
  };

// ==========================================================
// FORMAT ONE GAME TYPE
// ==========================================================

resultSchema.statics.formatWinningNumber =
  function (value, gameType) {
    if (
      value === undefined ||
      value === null ||
      value === ""
    ) {
      return null;
    }

    const type =
      String(gameType).trim();

    const number =
      cleanDigits(value);

    if (!number) {
      throw new Error(
        "Invalid winning number"
      );
    }

    // --------------------------------------------------------
    // If raw 6 digit number is provided,
    // generate complete result.
    // --------------------------------------------------------

    if (number.length === 6) {
      const generated =
        this.formatWinningNumbers(
          number
        );

      if (
        generated[type] !== undefined
      ) {
        return generated[type];
      }

      throw new Error(
        `Invalid game type: ${type}`
      );
    }

    // --------------------------------------------------------
    // Individual values
    // --------------------------------------------------------

    switch (type) {
      case "single":
        return getSingleDigit(number);

      case "single-Patti":
        if (
          number.length === 3 &&
          isSinglePatti(number)
        ) {
          return number;
        }

        throw new Error(
          "Invalid Single Patti"
        );

      case "double-Patti":
        if (
          number.length === 3 &&
          isDoublePatti(number)
        ) {
          return number;
        }

        throw new Error(
          "Invalid Double Patti"
        );

      case "triple-Patti":
        if (
          number.length === 3 &&
          isTriplePatti(number)
        ) {
          return number;
        }

        throw new Error(
          "Invalid Triple Patti"
        );

      case "jodi":
        if (number.length === 2) {
          return number;
        }

        throw new Error(
          "Jodi must contain 2 digits"
        );

      case "panna":
        if (number.length === 3) {
          return number;
        }

        throw new Error(
          "Panna must contain 3 digits"
        );

      case "last-digit":
        return number.slice(-1);

      case "first-digit":
        return number.charAt(0);

      case "half-sangam":
        if (
          /^\d{3}-\d$/.test(
            String(value).trim()
          )
        ) {
          return String(value).trim();
        }

        if (number.length === 4) {
          return (
            `${number.substring(
              0,
              3
            )}-${number.substring(
              3,
              4
            )}`
          );
        }

        throw new Error(
          "Half Sangam must be Panna-Digit"
        );

      case "full-sangam":
        if (
          /^\d{3}-\d{3}$/.test(
            String(value).trim()
          )
        ) {
          return String(value).trim();
        }

        throw new Error(
          "Full Sangam must be Panna-Panna"
        );

      default:
        throw new Error(
          `Invalid game type: ${type}`
        );
    }
  };

// ==========================================================
// LATEST RESULT
// ==========================================================

resultSchema.statics.getLatestResult =
  async function (marketId) {
    return this.findOne({
      marketId,
      status: "declared",
    })
      .sort({
        resultDate: -1,
        createdAt: -1,
      })
      .exec();
  };

// ==========================================================
// DATE RANGE
// ==========================================================

resultSchema.statics.getResultsByDateRange =
  async function (
    startDate,
    endDate,
    marketId = null
  ) {
    const query = {
      resultDate: {
        $gte: startDate,
        $lte: endDate,
      },
      status: "declared",
    };

    if (marketId) {
      query.marketId =
        marketId;
    }

    return this.find(query)
      .sort({
        resultDate: -1,
      })
      .exec();
  };

// ==========================================================
// STATS
// ==========================================================

resultSchema.statics.getStats =
  async function (marketId) {
    const match = {
      marketId:
        new mongoose.Types.ObjectId(
          marketId
        ),
      status: "declared",
    };

    const stats =
      await this.aggregate([
        {
          $match: match,
        },
        {
          $group: {
            _id: null,

            totalResults: {
              $sum: 1,
            },

            totalPayout: {
              $sum: "$totalPayout",
            },

            totalWinners: {
              $sum: "$totalWinningBids",
            },

            totalBids: {
              $sum: "$totalBids",
            },

            avgPayout: {
              $avg: "$totalPayout",
            },
          },
        },
      ]);

    return (
      stats[0] || {
        totalResults: 0,
        totalPayout: 0,
        totalWinners: 0,
        totalBids: 0,
        avgPayout: 0,
      }
    );
  };

// ==========================================================
// SUMMARY
// ==========================================================

resultSchema.virtual(
  "summary"
).get(function () {
  return {
    marketId:
      this.marketId,

    marketName:
      this.marketName,

    digitType:
      this.digitType,

    winningNumber:
      this.winningNumber,

    resultDate:
      this.resultDate,

    nextOpenDate:
      this.nextOpenDate,

    totalBids:
      this.totalBids,

    totalWinningBids:
      this.totalWinningBids,

    totalPayout:
      this.totalPayout,

    status:
      this.status,
  };
});

// ==========================================================
// GET WINNING NUMBER
// ==========================================================

resultSchema.methods.getWinningNumber =
  function (gameType) {
    const type =
      String(
        gameType ?? ""
      ).trim();

    const normalizedType =
      type === "single-patti"
        ? "single-Patti"
        : type === "double-patti"
        ? "double-Patti"
        : type === "triple-patti"
        ? "triple-Patti"
        : type;

    return (
      this.winningNumber?.[
        normalizedType
      ] ?? null
    );
  };

// ==========================================================
// CHECK BID WIN
// ==========================================================

resultSchema.methods.checkBidWin =
  function (
    bidNumber,
    bidGameType
  ) {
    const winning =
      this.winningNumber || {};

    const rawGameType =
      String(
        bidGameType ?? ""
      ).trim();

    const gameType =
      rawGameType === "single-patti"
        ? "single-Patti"
        : rawGameType === "double-patti"
        ? "double-Patti"
        : rawGameType === "triple-patti"
        ? "triple-Patti"
        : rawGameType;

    const bidText =
      String(
        bidNumber ?? ""
      ).trim();

    const bidDigits =
      cleanDigits(
        bidText
      );

    if (!bidDigits) {
      return false;
    }

    const openPanna =
      String(
        winning.panna ?? ""
      );

    const fullSangam =
      String(
        winning[
          "full-sangam"
        ] ?? ""
      );

    const fullParts =
      fullSangam.split("-");

    const closePanna =
      fullParts.length === 2
        ? fullParts[1]
        : "";

    // ========================================================
    // SINGLE
    //
    // Winning 123456
    // => Single 3
    //
    // Bid 3 => WIN
    // ========================================================

    if (
      gameType === "single"
    ) {
      return (
        getSingleDigit(
          bidDigits
        ) ===
        String(
          winning.single ?? ""
        )
      );
    }

    // ========================================================
    // SINGLE PATTI
    //
    // Check OPEN + CLOSE
    // ========================================================

    if (
      gameType ===
      "single-Patti"
    ) {
      if (
        bidDigits.length !== 3 ||
        !isSinglePatti(
          bidDigits
        )
      ) {
        return false;
      }

      return (
        bidDigits ===
          openPanna ||
        bidDigits ===
          closePanna
      );
    }

    // ========================================================
    // DOUBLE PATTI
    // ========================================================

    if (
      gameType ===
      "double-Patti"
    ) {
      if (
        bidDigits.length !== 3 ||
        !isDoublePatti(
          bidDigits
        )
      ) {
        return false;
      }

      return (
        bidDigits ===
          openPanna ||
        bidDigits ===
          closePanna
      );
    }

    // ========================================================
    // TRIPLE PATTI
    // ========================================================

    if (
      gameType ===
      "triple-Patti"
    ) {
      if (
        bidDigits.length !== 3 ||
        !isTriplePatti(
          bidDigits
        )
      ) {
        return false;
      }

      return (
        bidDigits ===
          openPanna ||
        bidDigits ===
          closePanna
      );
    }

    // ========================================================
    // JODI
    // ========================================================

    if (
      gameType === "jodi"
    ) {
      const bidJodi =
        bidDigits
          .padStart(2, "0")
          .slice(-2);

      return (
        bidJodi ===
        String(
          winning.jodi ?? ""
        )
      );
    }

    // ========================================================
    // PANNA
    // ========================================================

    if (
      gameType === "panna"
    ) {
      if (
        bidDigits.length !== 3
      ) {
        return false;
      }

      return (
        bidDigits ===
          openPanna ||
        bidDigits ===
          closePanna
      );
    }

    // ========================================================
    // HALF SANGAM
    // ========================================================

    if (
      gameType ===
      "half-sangam"
    ) {
      const winningHalf =
        String(
          winning[
            "half-sangam"
          ] ?? ""
        );

      const winningParts =
        winningHalf.split("-");

      if (
        winningParts.length !== 2
      ) {
        return false;
      }

      const bidParts =
        bidText.split("-");

      if (
        bidParts.length === 2
      ) {
        return (
          cleanDigits(
            bidParts[0]
          ) ===
            winningParts[0] &&
          cleanDigits(
            bidParts[1]
          ) ===
            winningParts[1]
        );
      }

      if (
        bidDigits.length === 4
      ) {
        return (
          bidDigits.substring(
            0,
            3
          ) ===
            winningParts[0] &&
          bidDigits.substring(
            3,
            4
          ) ===
            winningParts[1]
        );
      }

      return false;
    }

    // ========================================================
    // FULL SANGAM
    // ========================================================

    if (
      gameType ===
      "full-sangam"
    ) {
      const winningFull =
        String(
          winning[
            "full-sangam"
          ] ?? ""
        );

      let bidFull =
        bidText;

      if (
        !bidText.includes("-") &&
        bidDigits.length === 6
      ) {
        bidFull =
          `${bidDigits.substring(
            0,
            3
          )}-${bidDigits.substring(
            3,
            6
          )}`;
      }

      return (
        bidFull ===
        winningFull
      );
    }

    // ========================================================
    // LAST DIGIT
    // ========================================================

    if (
      gameType ===
      "last-digit"
    ) {
      return (
        bidDigits.slice(-1) ===
        String(
          winning[
            "last-digit"
          ] ?? ""
        )
      );
    }

    // ========================================================
    // FIRST DIGIT
    // ========================================================

    if (
      gameType ===
      "first-digit"
    ) {
      return (
        bidDigits.charAt(0) ===
        String(
          winning[
            "first-digit"
          ] ?? ""
        )
      );
    }

    return false;
  };

// ==========================================================
// JSON
// ==========================================================

resultSchema.set(
  "toJSON",
  {
    virtuals: true,
  }
);

resultSchema.set(
  "toObject",
  {
    virtuals: true,
  }
);

// ==========================================================
// MODEL
// ==========================================================

module.exports =
  mongoose.models.results ||
  mongoose.model(
    "results",
    resultSchema
  );