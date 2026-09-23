const mongoose = require("mongoose");

const {
  getCountryModels,
  normalizeCountry,
} = require("../../config/usercontryConfig");

const TicketType = require("../../models/TicketType");
const User = require("../../models/authmodel");
const Transaction = require("../../models/Transaction");

// ============================================================
// GET COUNTRY MODELS
// ============================================================

const getModelsForRequest = (req) => {
  const country =
    req.params?.country ||
    req.body?.country ||
    req.query?.country ||
    req.country ||
    req.user?.country;

  const context = getCountryModels(country);

  return {
    country: normalizeCountry(country),
    GameCount: context.gameCount,
    GamePool: context.gamePool,
  };
};

// ============================================================
// COUNTRY CURRENCY
// ============================================================

const countryCurrencyMap = {
  india: "INR",
  nepal: "NPR",
  pakistan: "PKR",
  uae: "AED",
  australia: "AUD",
  bangladesh: "BDT",
};

// ============================================================
// GET PLAYER/BET BY ID
// ============================================================

const findPlayerByBetId = (pool, userId, betId = null) => {
  if (!pool || !Array.isArray(pool.players)) {
    return {
      player: null,
      index: -1,
    };
  }

  // ----------------------------------------------------------
  // SPECIFIC BET
  // ----------------------------------------------------------

  if (betId) {
    if (!mongoose.Types.ObjectId.isValid(betId)) {
      return {
        player: null,
        index: -1,
      };
    }

    const index = pool.players.findIndex(
      (player) =>
        player._id &&
        player._id.toString() === betId.toString() &&
        player.user &&
        player.user.toString() === userId.toString()
    );

    return {
      player:
        index !== -1
          ? pool.players[index]
          : null,
      index,
    };
  }

  // ----------------------------------------------------------
  // BACKWARD COMPATIBILITY
  // FIRST BET OF USER
  // ----------------------------------------------------------

  const index = pool.players.findIndex(
    (player) =>
      player.user &&
      player.user.toString() === userId.toString()
  );

  return {
    player:
      index !== -1
        ? pool.players[index]
        : null,
    index,
  };
};

// ============================================================
// FORMAT RESULT
// ============================================================

const buildResultInfo = (pool, player) => {
  const resultInfo = {
    status:
      player?.status ||
      "Pending",

    division:
      player?.result?.division ||
      null,

    prize:
      Number(player?.result?.prize || 0),

    isWinner:
      Number(player?.result?.prize || 0) > 0,

    winningNumbers:
      pool?.winningNumbers ||
      null,

    resultDeclared:
      pool?.resultDeclared ||
      false,
  };

  // ----------------------------------------------------------
  // MATCH DETAILS
  // ----------------------------------------------------------

  if (
    pool?.resultDeclared &&
    pool?.winningNumbers &&
    Array.isArray(
      pool.winningNumbers.numbers
    ) &&
    Array.isArray(player?.games)
  ) {
    resultInfo.matchDetails =
      player.games.map((game) => {
        const matchedNumbers =
          Array.isArray(game.numbers)
            ? game.numbers.filter((num) =>
                pool.winningNumbers.numbers.includes(
                  num
                )
              )
            : [];

        const powerballMatch =
          Number(game.powerball) ===
          Number(
            pool.winningNumbers.powerball
          );

        return {
          gameNo:
            game.gameNo,

          matchedNumbers,

          matchedCount:
            matchedNumbers.length,

          powerballMatch,

          numbers:
            game.numbers,

          powerball:
            game.powerball,
        };
      });

    resultInfo.hasWinningGame =
      resultInfo.matchDetails.some(
        (match) =>
          (
            match.matchedCount >= 3 &&
            match.powerballMatch
          ) ||
          match.matchedCount >= 6
      );
  }

  return resultInfo;
};

// ============================================================
// CREATE GAME POOL / MULTIPLE BET ENABLED
// ============================================================

exports.createGamePool = async (req, res) => {
  const {
    country,
    GameCount,
    GamePool,
  } = getModelsForRequest(req);

  const session =
    await mongoose.startSession();

  try {
    session.startTransaction();

    const {
      ticketType,
      gameType,
      gameCount,
      games,
      autoPlay = false,
      drawCount = 1,
      totalPrice = 0,
    } = req.body;

    // ========================================================
    // BASIC VALIDATION
    // ========================================================

    if (!ticketType) {
      throw new Error(
        "Ticket Type is required."
      );
    }

    if (!gameCount) {
      throw new Error(
        "Game Count is required."
      );
    }

    if (
      !Array.isArray(games) ||
      games.length === 0
    ) {
      throw new Error(
        "Please select at least one game."
      );
    }

    if (
      !mongoose.Types.ObjectId.isValid(
        ticketType
      )
    ) {
      throw new Error(
        "Invalid Ticket Type ID."
      );
    }

    if (
      !mongoose.Types.ObjectId.isValid(
        gameCount
      )
    ) {
      throw new Error(
        "Invalid Game Count ID."
      );
    }

    // ========================================================
    // COUNTRY CURRENCY
    // ========================================================

    const localCurrency =
      countryCurrencyMap[country];

    if (!localCurrency) {
      throw new Error(
        `Unsupported country: ${country}`
      );
    }

    // ========================================================
    // TICKET
    // ========================================================

    const ticket =
      await TicketType.findById(
        ticketType
      ).session(session);

    if (!ticket) {
      throw new Error(
        "Ticket Type not found."
      );
    }

    // ========================================================
    // GAME COUNT
    // ========================================================

    const gameCountData =
      await GameCount.findById(
        gameCount
      ).session(session);

    if (!gameCountData) {
      throw new Error(
        "Game Count not found."
      );
    }

    const actualGameCount =
      Number(
        gameCountData.totalGames || 0
      );

    if (actualGameCount <= 0) {
      throw new Error(
        "Invalid total games configured."
      );
    }

    // ========================================================
    // GAME COUNT MATCH
    // ========================================================

    if (
      actualGameCount !==
      games.length
    ) {
      throw new Error(
        `Game count (${actualGameCount}) does not match selected games (${games.length}).`
      );
    }

    // ========================================================
    // CALCULATE PRICE
    // ========================================================

    let calculatedTotalPrice =
      Number(totalPrice) || 0;

    if (
      calculatedTotalPrice <= 0
    ) {
      calculatedTotalPrice =
        Number(
          gameCountData.price || 0
        ) *
        actualGameCount;

      if (autoPlay) {
        calculatedTotalPrice *=
          Number(drawCount || 1);
      }
    }

    if (
      !Number.isFinite(
        calculatedTotalPrice
      ) ||
      calculatedTotalPrice <= 0
    ) {
      throw new Error(
        "Invalid game amount."
      );
    }

    const amountToDeduct =
      Number(calculatedTotalPrice);

    const currencyToUse =
      localCurrency;

    // ========================================================
    // USER
    // ========================================================

    if (!req.user?.id) {
      throw new Error(
        "Authentication required."
      );
    }

    const user =
      await User.findById(
        req.user.id
      ).session(session);

    if (!user) {
      throw new Error(
        "User not found."
      );
    }

    // ========================================================
    // COUNTRY CHECK
    // ========================================================

    const userCountry =
      normalizeCountry(
        user.country
      );

    if (
      userCountry &&
      userCountry !== country
    ) {
      throw new Error(
        `User country (${user.country}) does not match selected country (${country}).`
      );
    }

    // ========================================================
    // credit CHECK
    // ========================================================

    if (
      Number(user.credit || 0) <
      amountToDeduct
    ) {
      await session.abortTransaction();

      return res.status(400).json({
        success: false,

        message:
          "Insufficient credit.",

        credit: {
          amount:
            Number(
              user.credit || 0
            ),

          currency:
            currencyToUse,
        },

        required: {
          amount:
            amountToDeduct,

          currency:
            currencyToUse,
        },
      });
    }

    // ========================================================
    // GAME TYPE
    // ========================================================

    const isStandardTicket =
      !Array.isArray(
        ticket.gameTypes
      ) ||
      ticket.gameTypes.length === 0;

    let selectedGameType = null;

    if (!isStandardTicket) {
      if (!gameType) {
        throw new Error(
          "Game Type is required for this ticket."
        );
      }

      if (
        !mongoose.Types.ObjectId.isValid(
          gameType
        )
      ) {
        throw new Error(
          "Invalid Game Type ID."
        );
      }

      selectedGameType =
        ticket.gameTypes.find(
          (gt) =>
            gt._id.toString() ===
            gameType.toString()
        );

      if (!selectedGameType) {
        throw new Error(
          "Game Type not found in this ticket."
        );
      }
    }

    // ========================================================
    // VALIDATE GAMES
    // ========================================================

    const formattedGames = [];
    const numberSets = new Set();

    for (
      let i = 0;
      i < games.length;
      i++
    ) {
      const game = games[i];

      if (
        !Array.isArray(
          game.numbers
        )
      ) {
        throw new Error(
          `Game ${i + 1}: Numbers must be array.`
        );
      }

      if (
        game.numbers.length !== 7
      ) {
        throw new Error(
          `Game ${i + 1}: Exactly 7 numbers required.`
        );
      }

      // ======================================================
      // NUMBERS
      // ======================================================

      const numbers =
        game.numbers.map(Number);

      if (
        numbers.some(
          (num) =>
            !Number.isInteger(num) ||
            num < 1 ||
            num > 69
        )
      ) {
        throw new Error(
          `Game ${i + 1}: Numbers must be integers between 1-69.`
        );
      }

      // ======================================================
      // DUPLICATE NUMBERS
      // ======================================================

      const uniqueNumbers =
        new Set(numbers);

      if (
        uniqueNumbers.size !==
        numbers.length
      ) {
        throw new Error(
          `Game ${i + 1}: Duplicate numbers not allowed.`
        );
      }

      // ======================================================
      // POWERBALL
      // ======================================================

      if (
        game.powerball ===
          undefined ||
        game.powerball === null ||
        game.powerball === ""
      ) {
        throw new Error(
          `Game ${i + 1}: Powerball required.`
        );
      }

      const powerball =
        Number(game.powerball);

      if (
        !Number.isInteger(
          powerball
        ) ||
        powerball < 1 ||
        powerball > 20
      ) {
        throw new Error(
          `Game ${i + 1}: Powerball must be an integer between 1-20.`
        );
      }

      // ======================================================
      // DUPLICATE COMBINATION
      // SAME BET ONLY
      // ======================================================

      const gameKey =
        [...numbers]
          .sort(
            (a, b) => a - b
          )
          .join(",") +
        "|" +
        powerball;

      if (
        numberSets.has(gameKey)
      ) {
        throw new Error(
          `Game ${i + 1}: Duplicate combination found.`
        );
      }

      numberSets.add(gameKey);

      // ======================================================
      // GAME
      // ======================================================

      formattedGames.push({
        gameNo:
          i + 1,

        numbers,

        powerball,
      });
    }

    // ========================================================
    // FIND EXISTING OPEN POOL
    // ========================================================

    const poolQuery = {
      ticketType,

      gameCount,

      country:
        country.toUpperCase(),

      status:
        "Open",
    };

    if (
      !isStandardTicket &&
      gameType
    ) {
      poolQuery.gameType =
        gameType;
    }

    let pool =
      await GamePool.findOne(
        poolQuery
      ).session(session);

    // ========================================================
    // PLAYER DATA / NEW BET
    // ========================================================

    const playerData = {
      user:
        req.user.id,

      games:
        formattedGames,

      bidAmount:
        amountToDeduct,

      currencyDetails: {
        amount:
          amountToDeduct,

        currency:
          currencyToUse,

        convertedAmount:
          amountToDeduct,

        convertedCurrency:
          currencyToUse,

        usdAmount:
          null,

        localAmount:
          amountToDeduct,

        localCurrency:
          currencyToUse,

        exchangeRate:
          1,

        userCountry:
          country,
      },

      status:
        "Pending",
    };

    // ========================================================
    // EXISTING POOL
    // MULTIPLE BET ALLOWED
    // ========================================================

    if (pool) {
      // IMPORTANT:
      // NO DUPLICATE USER CHECK HERE
      // Same user can add multiple bets.

      pool.players.push(
        playerData
      );

      pool.totalPlayers =
        pool.players.length;

      pool.totalAmount =
        Number(
          pool.totalAmount || 0
        ) +
        amountToDeduct;

      await pool.save({
        session,
      });
    }

    // ========================================================
    // CREATE NEW POOL
    // ========================================================

    else {
      const lastPool =
        await GamePool.findOne({
          country:
            country.toUpperCase(),
        })
          .sort({
            drawNo: -1,
          })
          .select("drawNo")
          .session(session);

      const nextDrawNo =
        lastPool
          ? Number(
              lastPool.drawNo || 0
            ) + 1
          : 1;

      const poolData = {
        ticketType,

        gameCount,

        country:
          country.toUpperCase(),

        drawNo:
          nextDrawNo,

        players: [
          playerData,
        ],

        totalPlayers:
          1,

        totalAmount:
          amountToDeduct,

        status:
          "Open",

        resultDeclared:
          false,
      };

      if (
        !isStandardTicket
      ) {
        if (!gameType) {
          throw new Error(
            "Game Type is required to create a new pool."
          );
        }

        poolData.gameType =
          gameType;
      }

      const newPool =
        await GamePool.create(
          [poolData],
          {
            session,
          }
        );

      pool =
        newPool[0];
    }

    // ========================================================
    // GET NEW BET ID
    // ========================================================

    const addedPlayer =
      pool.players[
        pool.players.length - 1
      ];

    const betId =
      addedPlayer?._id || null;

    // ========================================================
    // DEDUCT credit
    // ========================================================

    const updatedUser =
      await User.findByIdAndUpdate(
        req.user.id,
        {
          $inc: {
            credit:
              -amountToDeduct,
          },
        },
        {
          new: true,
          session,
        }
      );

    if (!updatedUser) {
      throw new Error(
        "User not found during credit update."
      );
    }

    // ========================================================
    // TRANSACTION
    // ========================================================

    await Transaction.create(
      [
        {
          user:
            req.user.id,

          amount:
            amountToDeduct,

          currency:
            currencyToUse,

          usdAmount:
            null,

          type:
            "DEBIT",

          category:
            "GAME_ENTRY",

          description:
            `Game Pool Bet - ${actualGameCount} Games${
              !isStandardTicket
                ? ` - ${
                    selectedGameType?.name ||
                    ""
                  }`
                : ""
            }`,

          reference:
            pool._id,

          referenceModel:
            "GamePool",

          status:
            "completed",

          creditAfter:
            updateduser.credit,

          exchangeRate:
            1,
        },
      ],
      {
        session,
      }
    );

    // ========================================================
    // COMMIT
    // ========================================================

    await session.commitTransaction();

    const formattedcredit =
      `${updateduser.credit} ${currencyToUse}`;

    // ========================================================
    // RESPONSE
    // ========================================================

    return res.status(201).json({
      success:
        true,

      message:
        "Game Pool bet placed successfully.",

      data: {
        pool,

        betId,

        country,

        currency:
          currencyToUse,

        amount:
          amountToDeduct,

        ticketType:
          isStandardTicket
            ? "standard"
            : "premium",

        gameType:
          !isStandardTicket
            ? selectedGameType?.name ||
              null
            : null,
      },

      credit: {
        amount:
          updateduser.credit,

        currency:
          currencyToUse,

        formatted:
          formattedcredit,
      },
    });
  } catch (error) {
    if (
      session.inTransaction()
    ) {
      await session.abortTransaction();
    }

    console.error(
      "Create Game Pool Error:",
      error
    );

    if (
      error.name ===
      "ValidationError"
    ) {
      return res.status(400).json({
        success:
          false,

        message:
          "Validation error",

        details:
          error.message,
      });
    }

    if (
      error.code === 11000
    ) {
      return res.status(409).json({
        success:
          false,

        message:
          "Duplicate entry detected.",

        details:
          error.message,
      });
    }

    return res.status(
      error.statusCode ||
        500
    ).json({
      success:
        false,

      message:
        error.message ||
        "Internal Server Error",
    });
  } finally {
    await session.endSession();
  }
};

// ============================================================
// GET MY GAME ENTRIES
// EACH BET AS SEPARATE ENTRY
// ============================================================

exports.getMyGameEntries = async (
  req,
  res
) => {
  try {
    const {
      GamePool,
    } = getModelsForRequest(req);

    const {
      page = 1,
      limit = 10,
      status,
    } = req.query;

    const pageNumber =
      Math.max(
        Number(page),
        1
      );

    const limitNumber =
      Math.max(
        Number(limit),
        1
      );

    // --------------------------------------------------------
    // FIND POOLS CONTAINING USER
    // --------------------------------------------------------

    const query = {
      "players.user":
        req.user.id,
    };

    if (status) {
      query.status =
        status;
    }

    const pools =
      await GamePool.find(
        query
      )
        .populate(
          "ticketType",
          "name price description"
        )
        .populate(
          "gameCount",
          "totalGames price label gameType"
        )
        .sort({
          createdAt:
            -1,
        });

    // --------------------------------------------------------
    // FLATTEN USER BETS
    // --------------------------------------------------------

    const allBets = [];

    for (
      const pool of pools
    ) {
      const userPlayers =
        pool.players.filter(
          (player) =>
            player.user &&
            player.user.toString() ===
              req.user.id.toString()
        );

      for (
        const player of userPlayers
      ) {
        const resultInfo =
          buildResultInfo(
            pool,
            player
          );

        allBets.push({
          betId:
            player._id,

          poolId:
            pool._id,

          ticketType:
            pool.ticketType,

          gameCount:
            pool.gameCount,

          gameType:
            pool.gameType ||
            null,

          drawNo:
            pool.drawNo,

          poolStatus:
            pool.status,

          playerStatus:
            player.status ||
            null,

          games:
            player.games ||
            [],

          bidAmount:
            Number(
              player.bidAmount ||
                0
            ),

          currencyDetails:
            player.currencyDetails ||
            {},

          result:
            resultInfo,

          winningNumbers:
            pool.winningNumbers ||
            null,

          resultDeclared:
            pool.resultDeclared ||
            false,

          totalPlayers:
            pool.totalPlayers,

          totalAmount:
            pool.totalAmount,

          createdAt:
            player.createdAt ||
            pool.createdAt,

          updatedAt:
            player.updatedAt ||
            pool.updatedAt,
        });
      }
    }

    // --------------------------------------------------------
    // SORT ALL BETS
    // --------------------------------------------------------

    allBets.sort(
      (a, b) =>
        new Date(
          b.createdAt
        ) -
        new Date(
          a.createdAt
        )
    );

    // --------------------------------------------------------
    // PAGINATION
    // --------------------------------------------------------

    const total =
      allBets.length;

    const startIndex =
      (pageNumber - 1) *
      limitNumber;

    const paginatedBets =
      allBets.slice(
        startIndex,
        startIndex +
          limitNumber
      );

    return res.status(200).json({
      success:
        true,

      data:
        paginatedBets,

      pagination: {
        total,

        page:
          pageNumber,

        limit:
          limitNumber,

        pages:
          Math.ceil(
            total /
              limitNumber
          ),
      },
    });
  } catch (error) {
    console.error(
      "Get Game Entries Error:",
      error
    );

    return res.status(500).json({
      success:
        false,

      message:
        error.message ||
        "Internal Server Error",
    });
  }
};

// ============================================================
// GET SINGLE GAME BET
//
// URL:
// GET /game-entry/:id?betId=BET_ID
//
// :id = poolId
// betId = specific player/bet id
// ============================================================

exports.getSingleGameEntry = async (
  req,
  res
) => {
  try {
    const {
      GamePool,
    } = getModelsForRequest(req);

    const pool =
      await GamePool.findOne({
        _id:
          req.params.id,

        "players.user":
          req.user.id,
      })
        .populate(
          "ticketType",
          "name price description"
        )
        .populate(
          "gameCount",
          "totalGames price label gameType"
        );

    if (!pool) {
      return res.status(404).json({
        success:
          false,

        message:
          "Game Entry not found or you don't have access.",
      });
    }

    const betId =
      req.query.betId ||
      req.params.betId ||
      null;

    const {
      player,
    } =
      findPlayerByBetId(
        pool,
        req.user.id,
        betId
      );

    if (!player) {
      return res.status(404).json({
        success:
          false,

        message:
          betId
            ? "Specific bet not found."
            : "Player data not found.",
      });
    }

    const resultInfo =
      buildResultInfo(
        pool,
        player
      );

    return res.status(200).json({
      success:
        true,

      data: {
        betId:
          player._id,

        poolId:
          pool._id,

        ticketType:
          pool.ticketType,

        gameCount:
          pool.gameCount,

        gameType:
          pool.gameType ||
          null,

        drawNo:
          pool.drawNo,

        poolStatus:
          pool.status,

        playerStatus:
          player.status,

        games:
          player.games,

        bidAmount:
          player.bidAmount,

        currencyDetails:
          player.currencyDetails,

        result:
          resultInfo,

        totalPlayers:
          pool.totalPlayers,

        totalAmount:
          pool.totalAmount,

        winningNumbers:
          pool.winningNumbers,

        resultDeclared:
          pool.resultDeclared,

        createdAt:
          player.createdAt ||
          pool.createdAt,

        updatedAt:
          player.updatedAt ||
          pool.updatedAt,
      },
    });
  } catch (error) {
    console.error(
      "Get Single Game Entry Error:",
      error
    );

    return res.status(500).json({
      success:
        false,

      message:
        error.message ||
        "Internal Server Error",
    });
  }
};

// ============================================================
// DELETE SPECIFIC GAME BET
//
// DELETE /game-entry/:id?betId=BET_ID
// ============================================================

exports.deleteGameEntry = async (
  req,
  res
) => {
  const session =
    await mongoose.startSession();

  try {
    session.startTransaction();

    const {
      GamePool,
    } = getModelsForRequest(req);

    const pool =
      await GamePool.findOne({
        _id:
          req.params.id,

        "players.user":
          req.user.id,
      }).session(
        session
      );

    if (!pool) {
      throw new Error(
        "Game Entry not found."
      );
    }

    if (
      pool.status !==
      "Open"
    ) {
      throw new Error(
        `Cannot delete entry. Pool is ${pool.status}.`
      );
    }

    const betId =
      req.query.betId ||
      req.params.betId ||
      null;

    const {
      player,
      index:
        playerIndex,
    } =
      findPlayerByBetId(
        pool,
        req.user.id,
        betId
      );

    if (
      !player ||
      playerIndex === -1
    ) {
      throw new Error(
        betId
          ? "Specific bet not found."
          : "Player not found in this pool."
      );
    }

    // ========================================================
    // REMOVE ONLY THIS BET
    // ========================================================

    pool.players.splice(
      playerIndex,
      1
    );

    pool.totalPlayers =
      pool.players.length;

    pool.totalAmount =
      Math.max(
        0,
        Number(
          pool.totalAmount ||
            0
        ) -
          Number(
            player.bidAmount ||
              0
          )
      );

    // ========================================================
    // DELETE EMPTY POOL
    // ========================================================

    if (
      pool.players.length ===
      0
    ) {
      await pool.deleteOne({
        session,
      });
    } else {
      await pool.save({
        session,
      });
    }

    await session.commitTransaction();

    return res.status(200).json({
      success:
        true,

      message:
        "Specific game bet deleted successfully.",

      betId:
        player._id,

      poolId:
        pool._id,
    });
  } catch (error) {
    if (
      session.inTransaction()
    ) {
      await session.abortTransaction();
    }

    console.error(
      "Delete Game Entry Error:",
      error
    );

    return res.status(
      error.statusCode ||
        500
    ).json({
      success:
        false,

      message:
        error.message ||
        "Internal Server Error",
    });
  } finally {
    await session.endSession();
  }
};

// ============================================================
// CANCEL SPECIFIC GAME BET + REFUND
//
// POST /game-entry/:id/cancel?betId=BET_ID
// ============================================================

exports.cancelGameEntry = async (
  req,
  res
) => {
  const session =
    await mongoose.startSession();

  try {
    session.startTransaction();

    const {
      GamePool,
      country,
    } =
      getModelsForRequest(req);

    const pool =
      await GamePool.findOne({
        _id:
          req.params.id,

        "players.user":
          req.user.id,
      }).session(
        session
      );

    if (!pool) {
      throw new Error(
        "Game Entry not found."
      );
    }

    if (
      pool.status !==
      "Open"
    ) {
      throw new Error(
        `Cannot cancel entry. Pool is ${pool.status}.`
      );
    }

    const betId =
      req.query.betId ||
      req.params.betId ||
      null;

    const {
      player,
      index:
        playerIndex,
    } =
      findPlayerByBetId(
        pool,
        req.user.id,
        betId
      );

    if (
      !player ||
      playerIndex === -1
    ) {
      throw new Error(
        betId
          ? "Specific bet not found."
          : "Player not found in this pool."
      );
    }

    // ========================================================
    // REFUND AMOUNT
    // ========================================================

    const refundAmount =
      Number(
        player
          ?.currencyDetails
          ?.amount
      ) ||
      Number(
        player
          ?.currencyDetails
          ?.localAmount
      ) ||
      Number(
        player?.bidAmount
      ) ||
      0;

    const refundCurrency =
      player
        ?.currencyDetails
        ?.currency ||
      player
        ?.currencyDetails
        ?.localCurrency ||
      countryCurrencyMap[
        country
      ];

    if (
      !Number.isFinite(
        refundAmount
      ) ||
      refundAmount <= 0
    ) {
      throw new Error(
        "Invalid refund amount."
      );
    }

    // ========================================================
    // REMOVE SPECIFIC BET
    // ========================================================

    pool.players.splice(
      playerIndex,
      1
    );

    pool.totalPlayers =
      pool.players.length;

    pool.totalAmount =
      Math.max(
        0,
        Number(
          pool.totalAmount ||
            0
        ) -
          Number(
            player.bidAmount ||
              0
          )
      );

    // ========================================================
    // DELETE EMPTY POOL
    // ========================================================

    if (
      pool.players.length ===
      0
    ) {
      await pool.deleteOne({
        session,
      });
    } else {
      await pool.save({
        session,
      });
    }

    // ========================================================
    // REFUND USER
    // ========================================================

    const updatedUser =
      await User.findByIdAndUpdate(
        req.user.id,
        {
          $inc: {
            credit:
              refundAmount,
          },
        },
        {
          new: true,
          session,
        }
      );

    if (!updatedUser) {
      throw new Error(
        "User not found during refund."
      );
    }

    // ========================================================
    // REFUND TRANSACTION
    // ========================================================

    await Transaction.create(
      [
        {
          user:
            req.user.id,

          amount:
            refundAmount,

          currency:
            refundCurrency,

          usdAmount:
            null,

          type:
            "CREDIT",

          category:
            "GAME_ENTRY_REFUND",

          description:
            "Game Entry Cancellation Refund",

          reference:
            pool._id ||
            req.params.id,

          referenceModel:
            "GamePool",

          status:
            "completed",

          creditAfter:
            updateduser.credit,

          exchangeRate:
            1,
        },
      ],
      {
        session,
      }
    );

    await session.commitTransaction();

    const formattedcredit =
      `${updateduser.credit} ${refundCurrency}`;

    return res.status(200).json({
      success:
        true,

      message:
        "Specific game bet cancelled successfully. Amount refunded.",

      betId:
        player._id,

      refund: {
        amount:
          refundAmount,

        currency:
          refundCurrency,
      },

      credit: {
        amount:
          updateduser.credit,

        currency:
          refundCurrency,

        formatted:
          formattedcredit,
      },
    });
  } catch (error) {
    if (
      session.inTransaction()
    ) {
      await session.abortTransaction();
    }

    console.error(
      "Cancel Game Entry Error:",
      error
    );

    return res.status(
      error.statusCode ||
        500
    ).json({
      success:
        false,

      message:
        error.message ||
        "Internal Server Error",
    });
  } finally {
    await session.endSession();
  }
};

// ============================================================
// GET USER credit
// ============================================================

exports.getUsercredit = async (
  req,
  res
) => {
  try {
    const {
      country,
    } =
      getModelsForRequest(req);

    const user =
      await User.findById(
        req.user.id
      ).select(
        "credit country"
      );

    if (!user) {
      return res.status(404).json({
        success:
          false,

        message:
          "User not found.",
      });
    }

    const currency =
      countryCurrencyMap[
        country
      ];

    return res.status(200).json({
      success:
        true,

      credit:
        Number(
          user.credit || 0
        ),

      currency,

      country,
    });
  } catch (error) {
    console.error(
      "Get credit Error:",
      error
    );

    return res.status(
      error.statusCode ||
        500
    ).json({
      success:
        false,

      message:
        error.message ||
        "Internal Server Error",
    });
  }
};