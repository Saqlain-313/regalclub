const GamePool = require("../models/GameEntry");
const TicketType = require("../models/TicketType");
const mongoose = require("mongoose");
const User = require("../models/authmodel");
const Transaction = require("../models/Transaction");
const GameCount = require("../models/IndiaGameCount");
const { convertUSDtoLocal, formatCurrency } = require("../utils/currencyConverter");

// =========================
// CREATE GAME POOL
// =========================
exports.createGamePool = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      ticketType,
      gameType,
      gameCount,
      games,
      autoPlay = false,
      drawCount = 1,
      totalPrice = 0
    } = req.body;

    console.log(req.body);

    // =========================
    // Required Validation
    // =========================
    if (!ticketType) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "Ticket Type is required."
      });
    }

    if (!gameCount) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "Game Count is required."
      });
    }

    if (!games || !Array.isArray(games) || games.length === 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "Please select at least one game."
      });
    }

    // =========================
    // ObjectId Validation
    // =========================
    if (!mongoose.Types.ObjectId.isValid(ticketType)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "Invalid Ticket Type ID."
      });
    }

    if (!mongoose.Types.ObjectId.isValid(gameCount)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "Invalid Game Count ID."
      });
    }

    // =========================
    // Find Ticket Type
    // =========================
    const ticket = await TicketType.findById(ticketType).session(session);

    if (!ticket) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: "Ticket Type not found."
      });
    }

    // =========================
    // Game Count
    // =========================
    const gameCountData = await GameCount.findById(gameCount).session(session);

    if (!gameCountData) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: "Game Count not found."
      });
    }

    const actualGameCount = gameCountData.totalGames;

    if (actualGameCount !== games.length) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: `Game count (${actualGameCount}) does not match selected games (${games.length})`
      });
    }

    // =========================
    // Calculate Price
    // =========================
    let calculatedTotalPriceUSD = totalPrice;

    if (calculatedTotalPriceUSD === 0) {
      calculatedTotalPriceUSD = gameCountData.price * actualGameCount;

      if (autoPlay) {
        calculatedTotalPriceUSD = calculatedTotalPriceUSD * drawCount;
      }
    }

    // =========================
    // User
    // =========================
    const user = await User.findById(req.user.id).session(session);

    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: "User not found."
      });
    }

    // =========================
    // Currency Conversion
    // =========================
    let localCurrencyAmount;

    try {
      if (!user.country) {
        localCurrencyAmount = {
          convertedAmount: calculatedTotalPriceUSD,
          convertedCurrency: "USD",
          exchangeRate: 1
        };
      } else {
        localCurrencyAmount = convertUSDtoLocal(
          calculatedTotalPriceUSD,
          user.country
        );
      }
    } catch (error) {
      console.error("Currency conversion error:", error);
      localCurrencyAmount = {
        convertedAmount: calculatedTotalPriceUSD,
        convertedCurrency: "USD",
        exchangeRate: 1
      };
    }

    // =========================
    // credit Check
    // =========================
    if (user.credit < localCurrencyAmount.convertedAmount) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "Insufficient credit.",
        credit: {
          amount: user.credit,
          currency: localCurrencyAmount.convertedCurrency
        },
        required: {
          amount: localCurrencyAmount.convertedAmount,
          currency: localCurrencyAmount.convertedCurrency
        }
      });
    }

    // =========================
    // Game Type Validation - FIXED
    // =========================
    let selectedGameType = null;
    const isStandardTicket = !ticket.gameTypes || ticket.gameTypes.length === 0;

    // Only validate gameType if ticket has gameTypes defined
    if (!isStandardTicket) {
      if (!gameType) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          message: "Game Type is required for this ticket."
        });
      }

      if (!mongoose.Types.ObjectId.isValid(gameType)) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          message: "Invalid Game Type ID."
        });
      }

      selectedGameType = ticket.gameTypes.find(
        gt => gt._id.toString() === gameType.toString()
      );

      if (!selectedGameType) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({
          success: false,
          message: "Game Type not found in this ticket."
        });
      }
    } else {
      // For standard tickets, gameType is optional
      if (gameType) {
        console.log(`Standard ticket with gameType: ${gameType} - gameType will be ignored`);
        // Optionally validate gameType exists in global collection if needed
      }
    }

    // =========================
    // Validate Games
    // =========================
    const formattedGames = [];
    const numberSets = new Set();

    for (let i = 0; i < games.length; i++) {
      const game = games[i];

      if (!Array.isArray(game.numbers)) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          message: `Game ${i + 1}: Numbers must be array.`
        });
      }

      if (game.numbers.length !== 7) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          message: `Game ${i + 1}: Exactly 7 numbers required.`
        });
      }

      const invalidNumbers = game.numbers.filter(num => num < 1 || num > 69);

      if (invalidNumbers.length > 0) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          message: `Game ${i + 1}: Numbers must be between 1-69.`
        });
      }

      const uniqueNumbers = new Set(game.numbers);

      if (uniqueNumbers.size !== game.numbers.length) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          message: `Game ${i + 1}: Duplicate numbers not allowed.`
        });
      }

      if (game.powerball === undefined || game.powerball === null || game.powerball === "") {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          message: `Game ${i + 1}: Powerball required.`
        });
      }

      if (game.powerball < 1 || game.powerball > 20) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          message: `Game ${i + 1}: Powerball must be 1-20.`
        });
      }

      const gameKey = [...game.numbers].sort((a, b) => a - b).join(",") + "|" + game.powerball;

      if (numberSets.has(gameKey)) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          message: `Game ${i + 1}: Duplicate combination found.`
        });
      }

      numberSets.add(gameKey);

      formattedGames.push({
        gameNo: i + 1,
        numbers: game.numbers,
        powerball: game.powerball
      });
    }

    // =========================
    // Find Existing Pool - FIXED
    // =========================
    const poolQuery = {
      ticketType,
      gameCount,
      status: "Open"
    };

    // Only add gameType to query if ticket has gameTypes and gameType is provided
    if (!isStandardTicket && gameType) {
      poolQuery.gameType = gameType;
    }

    let pool = await GamePool.findOne(poolQuery).session(session);

    const playerData = {
      user: req.user.id,
      games: formattedGames,
      bidAmount: calculatedTotalPriceUSD,
      currencyDetails: {
        usdAmount: calculatedTotalPriceUSD,
        localAmount: localCurrencyAmount.convertedAmount,
        localCurrency: localCurrencyAmount.convertedCurrency,
        exchangeRate: localCurrencyAmount.exchangeRate,
        userCountry: user.country || "US"
      },
      status: "Pending"
    };

    // =========================
    // Add Player In Pool - FIXED
    // =========================
    if (pool) {
      // Check if user already in this pool
      const existingPlayer = pool.players.find(
        p => p.user.toString() === req.user.id.toString()
      );

      if (existingPlayer) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          message: "You already joined this pool."
        });
      }

      pool.players.push(playerData);
      pool.totalPlayers = pool.players.length;
      pool.totalAmount += calculatedTotalPriceUSD;
      await pool.save({ session });
    } else {
      // Get next draw number only when creating a new pool
      const lastPool = await GamePool.findOne({})
        .sort({ drawNo: -1 })
        .select("drawNo")
        .session(session);

      const nextDrawNo = lastPool ? lastPool.drawNo + 1 : 1;

      // Prepare pool data
      const poolData = {
        ticketType,
        gameCount,
        drawNo: nextDrawNo,
        players: [playerData],
        totalPlayers: 1,
        totalAmount: calculatedTotalPriceUSD,
        status: "Open"
      };

      // Only add gameType if ticket has gameTypes
      if (!isStandardTicket) {
        if (!gameType) {
          await session.abortTransaction();
          session.endSession();
          return res.status(400).json({
            success: false,
            message: "Game Type is required to create a new pool for this ticket."
          });
        }
        poolData.gameType = gameType;
      }

      const newPool = await GamePool.create([poolData], { session });
      pool = newPool[0];
    }

    // =========================
    // Deduct credit
    // =========================
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        $inc: {
          credit: -localCurrencyAmount.convertedAmount
        }
      },
      {
        new: true,
        session
      }
    );

    if (!updatedUser) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: "User not found during credit update."
      });
    }

    // =========================
    // Create Transaction
    // =========================
    await Transaction.create([{
      user: req.user.id,
      amount: localCurrencyAmount.convertedAmount,
      currency: localCurrencyAmount.convertedCurrency,
      usdAmount: calculatedTotalPriceUSD,
      type: "DEBIT",
      category: "GAME_ENTRY",
      description: `Game Pool Entry - ${actualGameCount} Games${!isStandardTicket ? ` - ${selectedGameType?.name || ''}` : ''}`,
      reference: pool._id,
      referenceModel: "GamePool",
      status: "completed",
      creditAfter: updateduser.credit,
      exchangeRate: localCurrencyAmount.exchangeRate
    }], { session });

    // =========================
    // Commit
    // =========================
    await session.commitTransaction();
    session.endSession();

    // Format credit
    let formattedcredit = updateduser.credit;
    try {
      if (typeof formatCurrency === 'function') {
        formattedcredit = formatCurrency(
          updateduser.credit,
          user.country || "US"
        );
      } else {
        formattedcredit = `${updateduser.credit} ${localCurrencyAmount.convertedCurrency}`;
      }
    } catch (error) {
      formattedcredit = `${updateduser.credit} ${localCurrencyAmount.convertedCurrency}`;
    }

    return res.status(201).json({
      success: true,
      message: "Game Pool joined successfully.",
      data: {
        pool,
        ticketType: isStandardTicket ? 'standard' : 'premium',
        gameType: !isStandardTicket ? selectedGameType?.name : null
      },
      credit: {
        amount: updateduser.credit,
        currency: localCurrencyAmount.convertedCurrency,
        formatted: formattedcredit
      }
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Create Game Pool Error:", error);

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        details: error.message
      });
    }

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Duplicate entry detected.",
        details: error.message
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error"
    });
  }
};

// =========================
// GET MY GAME ENTRIES
// =========================
// =========================
// GET MY GAME ENTRIES
// =========================
exports.getMyGameEntries = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    const query = {
      "players.user": req.user.id
    };

    if (status) {
      query.status = status;
    }

    const entries = await GamePool.find(query)
      .populate("ticketType", "name price")
      .populate("gameCount", "totalGames price")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const formattedEntries = entries.map(pool => {
      const player = pool.players.find(
        p => p.user.toString() === req.user.id.toString()
      );

      // Enhanced result processing
      let resultInfo = {
        status: player?.status || 'Pending',
        division: player?.result?.division || null,
        prize: player?.result?.prize || 0,
        isWinner: player?.result?.prize > 0,
        winningNumbers: pool.winningNumbers || null,
        resultDeclared: pool.resultDeclared || false
      };

      // Calculate match details if result is declared
      if (pool.resultDeclared && pool.winningNumbers && player?.games) {
        const matchDetails = player.games.map(game => {
          const matchedNumbers = game.numbers.filter(num =>
            pool.winningNumbers.numbers.includes(num)
          );
          const powerballMatch = game.powerball === pool.winningNumbers.powerball;

          return {
            gameNo: game.gameNo,
            matchedNumbers: matchedNumbers,
            matchedCount: matchedNumbers.length,
            powerballMatch: powerballMatch,
            numbers: game.numbers,
            powerball: game.powerball
          };
        });

        resultInfo.matchDetails = matchDetails;
      }

      return {
        poolId: pool._id,
        ticketType: pool.ticketType,
        gameCount: pool.gameCount,
        gameType: pool.gameType,
        drawNo: pool.drawNo,
        poolStatus: pool.status,
        playerStatus: player ? player.status : null,
        games: player ? player.games : [],
        bidAmount: player ? player.bidAmount : 0,
        currencyDetails: player ? player.currencyDetails : {},
        result: resultInfo,
        createdAt: pool.createdAt,
        updatedAt: pool.updatedAt,
        totalPlayers: pool.totalPlayers,
        totalAmount: pool.totalAmount,
        winningNumbers: pool.winningNumbers,
        resultDeclared: pool.resultDeclared
      };
    });

    const total = await GamePool.countDocuments(query);

    res.status(200).json({
      success: true,
      data: formattedEntries,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Get Game Entries Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =========================
// GET SINGLE GAME ENTRY
// =========================
exports.getSingleGameEntry = async (req, res) => {
  try {
    const pool = await GamePool.findOne({
      _id: req.params.id,
      "players.user": req.user.id
    })
      .populate("ticketType", "name price description")
      .populate("gameCount", "totalGames price");

    if (!pool) {
      return res.status(404).json({
        success: false,
        message: "Game Entry not found or you don't have access.",
      });
    }

    const player = pool.players.find(
      p => p.user.toString() === req.user.id.toString()
    );

    if (!player) {
      return res.status(404).json({
        success: false,
        message: "Player data not found.",
      });
    }

    // Enhanced result processing
    let resultInfo = {
      status: player.status || 'Pending',
      division: player.result?.division || null,
      prize: player.result?.prize || 0,
      isWinner: player.result?.prize > 0,
      winningNumbers: pool.winningNumbers || null,
      resultDeclared: pool.resultDeclared || false
    };

    // Calculate match details if result is declared
    if (pool.resultDeclared && pool.winningNumbers && player.games) {
      const matchDetails = player.games.map(game => {
        const matchedNumbers = game.numbers.filter(num =>
          pool.winningNumbers.numbers.includes(num)
        );
        const powerballMatch = game.powerball === pool.winningNumbers.powerball;

        return {
          gameNo: game.gameNo,
          matchedNumbers: matchedNumbers,
          matchedCount: matchedNumbers.length,
          powerballMatch: powerballMatch,
          numbers: game.numbers,
          powerball: game.powerball
        };
      });

      resultInfo.matchDetails = matchDetails;

      // Check if any game won
      const anyWin = matchDetails.some(m =>
        (m.matchedCount >= 3 && m.powerballMatch) ||
        m.matchedCount >= 6
      );
      resultInfo.hasWinningGame = anyWin;
    }

    const response = {
      poolId: pool._id,
      ticketType: pool.ticketType,
      gameCount: pool.gameCount,
      gameType: pool.gameType,
      drawNo: pool.drawNo,
      poolStatus: pool.status,
      playerStatus: player.status,
      games: player.games,
      bidAmount: player.bidAmount,
      currencyDetails: player.currencyDetails,
      result: resultInfo,
      totalPlayers: pool.totalPlayers,
      totalAmount: pool.totalAmount,
      winningNumbers: pool.winningNumbers,
      resultDeclared: pool.resultDeclared,
      createdAt: pool.createdAt,
      updatedAt: pool.updatedAt
    };

    res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error("Get Single Game Entry Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =========================
// DELETE GAME ENTRY
// =========================
exports.deleteGameEntry = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const pool = await GamePool.findOne({
      _id: req.params.id,
      "players.user": req.user.id
    }).session(session);

    if (!pool) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: "Game Entry not found.",
      });
    }

    if (pool.status !== 'Open') {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: `Cannot delete entry. Pool is ${pool.status}.`,
      });
    }

    const playerIndex = pool.players.findIndex(
      p => p.user.toString() === req.user.id.toString()
    );

    if (playerIndex === -1) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: "Player not found in this pool.",
      });
    }

    const removedPlayer = pool.players[playerIndex];
    pool.players.splice(playerIndex, 1);
    pool.totalPlayers = pool.players.length;
    pool.totalAmount -= removedPlayer.bidAmount;

    if (pool.players.length === 0) {
      await pool.deleteOne({ session });
    } else {
      await pool.save({ session });
    }

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      success: true,
      message: "Game Entry deleted successfully.",
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Delete Game Entry Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =========================
// CANCEL GAME ENTRY (WITH REFUND)
// =========================
exports.cancelGameEntry = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const pool = await GamePool.findOne({
      _id: req.params.id,
      "players.user": req.user.id
    }).session(session);

    if (!pool) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: "Game Entry not found.",
      });
    }

    if (pool.status !== 'Open') {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: `Cannot cancel entry. Pool is ${pool.status}.`,
      });
    }

    const playerIndex = pool.players.findIndex(
      p => p.user.toString() === req.user.id.toString()
    );

    if (playerIndex === -1) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: "Player not found in this pool.",
      });
    }

    const removedPlayer = pool.players[playerIndex];
    const refundAmount = removedPlayer.currencyDetails.localAmount;

    pool.players.splice(playerIndex, 1);
    pool.totalPlayers = pool.players.length;
    pool.totalAmount -= removedPlayer.bidAmount;

    if (pool.players.length === 0) {
      await pool.deleteOne({ session });
    } else {
      await pool.save({ session });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $inc: { credit: refundAmount } },
      { new: true, session }
    );

    await Transaction.create([{
      user: req.user.id,
      amount: refundAmount,
      currency: removedPlayer.currencyDetails.localCurrency,
      usdAmount: removedPlayer.bidAmount,
      type: "CREDIT",
      category: "GAME_ENTRY_REFUND",
      description: "Game Entry Cancellation Refund",
      reference: pool._id || req.params.id,
      referenceModel: "GamePool",
      status: "completed",
      creditAfter: updateduser.credit,
      exchangeRate: removedPlayer.currencyDetails.exchangeRate
    }], { session });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      success: true,
      message: "Game Entry cancelled successfully. Amount refunded.",
      credit: {
        amount: updateduser.credit,
        currency: removedPlayer.currencyDetails.localCurrency,
        formatted: formatCurrency(
          updateduser.credit,
          removedPlayer.currencyDetails.userCountry || "US"
        )
      }
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Cancel Game Entry Error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// =========================
// GET USER credit
// =========================
exports.getUsercredit = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('credit');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found."
      });
    }

    res.status(200).json({
      success: true,
      credit: user.credit
    });
  } catch (error) {
    console.error("Get credit Error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};