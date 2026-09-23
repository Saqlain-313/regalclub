const { getCountryContext } = require("../../config/countryConfig");
const User = require("../../models/authmodel");
const BettingBonus = require("../../models/BettingBonus");
const mongoose = require("mongoose");

// ==========================================================
// ADD REFERRAL BETTING BONUS
// ==========================================================

const addReferralBettingBonus = async (
  winner,
  winAmount
) => {
  try {
    if (
      !winner ||
      !winAmount ||
      Number(winAmount) <= 0
    ) {
      return {
        success: false,
        bonus: 0,
        message:
          "Invalid winner or prize amount",
      };
    }

    // ======================================================
    // GET ACTIVE BETTING BONUS
    // ======================================================

    const bettingBonus =
      await BettingBonus.findOne({
        isActive: true,
      });

    if (!bettingBonus) {
      return {
        success: false,
        bonus: 0,
        message:
          "Betting bonus is inactive",
      };
    }

    const percentage =
      Number(
        bettingBonus.percentage
      ) || 0;

    if (
      percentage <= 0 ||
      percentage > 100
    ) {
      return {
        success: false,
        bonus: 0,
        message:
          "Invalid betting bonus percentage",
      };
    }

    // ======================================================
    // FIND REFERRER
    // ======================================================

    let referrer = null;

    // ------------------------------------------------------
    // 1. referredByUser
    // ------------------------------------------------------

    if (
      winner.referredByUser
    ) {
      if (
        mongoose.Types.ObjectId.isValid(
          winner.referredByUser
        )
      ) {
        referrer =
          await User.findById(
            winner.referredByUser
          );
      }
    }

    // ------------------------------------------------------
    // 2. referredBy as ObjectId
    // ------------------------------------------------------

    if (
      !referrer &&
      winner.referredBy
    ) {
      if (
        mongoose.Types.ObjectId.isValid(
          winner.referredBy
        )
      ) {
        referrer =
          await User.findById(
            winner.referredBy
          );
      }
    }

    // ------------------------------------------------------
    // 3. referredBy as referral code
    // ------------------------------------------------------

    if (
      !referrer &&
      winner.referredBy
    ) {
      referrer =
        await User.findOne({
          referralCode:
            String(
              winner.referredBy
            ).trim(),
        });
    }

    // ======================================================
    // NO REFERRER
    // ======================================================

    if (!referrer) {
      return {
        success: false,
        bonus: 0,
        message:
          "No referrer found",
      };
    }

    // ======================================================
    // SELF REFERRAL PROTECTION
    // ======================================================

    if (
      String(referrer._id) ===
      String(winner._id)
    ) {
      return {
        success: false,
        bonus: 0,
        message:
          "Self referral is not allowed",
      };
    }

    // ======================================================
    // CALCULATE BONUS
    // ======================================================

    const referralBonus =
      Number(
        (
          (
            Number(winAmount) *
            percentage
          ) / 100
        ).toFixed(2)
      );

    if (
      referralBonus <= 0
    ) {
      return {
        success: false,
        bonus: 0,
        message:
          "Referral bonus is zero",
      };
    }

    // ======================================================
    // ADD BONUS TO REFERRER
    // ======================================================

    await User.updateOne(
      {
        _id:
          referrer._id,
      },
      {
        $inc: {
          credit:
            referralBonus,

          referralEarning:
            referralBonus,
        },
      }
    );

    console.log(
      "=========================================="
    );

    console.log(
      "POWERBALL REFERRAL BONUS"
    );

    console.log(
      "Winner:",
      winner.name
    );

    console.log(
      "Winner ID:",
      winner._id
    );

    console.log(
      "Winning Amount:",
      winAmount
    );

    console.log(
      "Bonus Percentage:",
      percentage
    );

    console.log(
      "Referrer:",
      referrer.name
    );

    console.log(
      "Referrer ID:",
      referrer._id
    );

    console.log(
      "Referral Bonus:",
      referralBonus
    );

    console.log(
      "=========================================="
    );

    return {
      success: true,

      bonus:
        referralBonus,

      percentage,

      referrerId:
        referrer._id,

      referrerName:
        referrer.name,
    };
  } catch (error) {
    console.error(
      "Referral Betting Bonus Error:",
      error
    );

    return {
      success: false,
      bonus: 0,
      message:
        error.message,
    };
  }
};

// ==========================================================
// CREATE POWERBALL RESULT
// ==========================================================

exports.createPowerballResult =
  async (
    req,
    res
  ) => {
    try {
      const { PowerballResult, GamePool, PowerballDivision } = getCountryContext(req);
      const {
        gamePoolId,
        numbers,
        powerball,
      } = req.body;

      // ====================================================
      // VALIDATION
      // ====================================================

      if (!gamePoolId) {
        return res.status(400).json({
          success: false,
          message:
            "Game Pool ID is required.",
        });
      }

      if (
        !numbers ||
        !Array.isArray(numbers) ||
        numbers.length !== 7
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Exactly 7 winning numbers are required.",
        });
      }

      if (
        powerball ===
          undefined ||
        powerball ===
          null ||
        powerball ===
          ""
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Powerball is required.",
        });
      }

      const normalizedNumbers = numbers.map(Number);
      if (normalizedNumbers.some((n) => !Number.isInteger(n) || n < 1 || n > 69)) {
        return res.status(400).json({
          success: false,
          message: "Winning numbers must be integers between 1 and 69.",
        });
      }

      if (new Set(normalizedNumbers).size !== normalizedNumbers.length) {
        return res.status(400).json({
          success: false,
          message: "Winning numbers cannot contain duplicates.",
        });
      }

      const normalizedPowerball = Number(powerball);
      if (!Number.isInteger(normalizedPowerball) || normalizedPowerball < 1 || normalizedPowerball > 20) {
        return res.status(400).json({
          success: false,
          message: "Powerball must be an integer between 1 and 20.",
        });
      }

      // ====================================================
      // FIND GAME POOL
      // ====================================================

      const gamePool =
        await GamePool.findById(
          gamePoolId
        );

      if (!gamePool) {
        return res.status(404).json({
          success: false,
          message:
            "Game pool not found.",
        });
      }

      if (
        gamePool.status !==
        "Open"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Game pool is already processed or closed.",
        });
      }

      // ====================================================
      // CHECK EXISTING RESULT
      // ====================================================

      const exists =
        await PowerballResult.findOne({
          gamePoolId,
        });

      if (exists) {
        return res.status(400).json({
          success: false,
          message:
            "Result already declared for this game pool.",
        });
      }

      // ====================================================
      // CREATE RESULT
      // ====================================================

      const result =
        await PowerballResult.create({
          gamePoolId,

          drawNo:
            gamePool.drawNo,

          numbers: normalizedNumbers,

          powerball: normalizedPowerball,

          createdBy:
            req.user.id,
        });

      // ====================================================
      // LOAD ACTIVE PRIZE DIVISIONS
      // ====================================================
      let divisions = await PowerballDivision.find({ isActive: true })
        .sort({ division: 1 })
        .lean();

      // Keep the system usable on a fresh DB before divisions are configured.
      if (!divisions.length) {
        divisions = [
          { division: 1, main: 7, powerball: true, prize: 40000000 },
          { division: 2, main: 7, powerball: false, prize: 32769.7 },
          { division: 3, main: 6, powerball: true, prize: 10874.15 },
          { division: 4, main: 6, powerball: false, prize: 538.3 },
          { division: 5, main: 5, powerball: true, prize: 206.7 },
          { division: 6, main: 5, powerball: false, prize: 87.5 },
          { division: 7, main: 4, powerball: true, prize: 49.5 },
          { division: 8, main: 3, powerball: true, prize: 23.6 },
          { division: 9, main: 2, powerball: true, prize: 14.4 },
        ];
      }

      // ====================================================
      // PROCESS PLAYERS
      // ====================================================

      let poolWinners = 0;

      let totalPrizeAmount = 0;

      const userUpdates = [];

      const referralBonusUpdates = [];

      let totalReferralBonus = 0;

      let totalReferralBonusCount = 0;

      // ====================================================
      // PROCESS EVERY PLAYER
      // ====================================================

      for (
        const player of
          gamePool.players
      ) {
        if (
          player.status !==
          "Pending"
        ) {
          continue;
        }

        let bestDivision =
          null;

        let bestGameNo =
          null;

        // ==================================================
        // CHECK EVERY GAME
        // ==================================================

        for (
          const game of
            player.games
        ) {
          const matchedMain =
            game.numbers.filter(
              (num) =>
                normalizedNumbers.includes(
                  num
                )
            ).length;

          const matchedPowerball =
            game.powerball ===
            normalizedPowerball;

          const division =
            divisions.find(
              (d) =>
                d.main ===
                  matchedMain &&
                d.powerball ===
                  matchedPowerball
            );

          if (
            division &&
            (
              !bestDivision ||
              division.division <
                bestDivision.division
            )
          ) {
            bestDivision = {
              division:
                division.division,

              prize:
                division.prize,

              matchedMain,

              matchedPowerball,

              gameNo:
                game.gameNo,
            };

            bestGameNo =
              game.gameNo;
          }
        }

        // ==================================================
        // WINNER
        // ==================================================

        if (
          bestDivision
        ) {
          player.status =
            "Won";

          player.result = {
            division:
              bestDivision.division,

            prize:
              bestDivision.prize,

            gameNo:
              bestGameNo,

            referralBonus:
              0,

            referralPercentage:
              0,

            referrerId:
              null,
          };

          poolWinners++;

          totalPrizeAmount +=
            bestDivision.prize;

          if (
            player.user
          ) {
            userUpdates.push({
              userId:
                player.user,

              amount:
                bestDivision.prize,

              playerId:
                player._id,

              division:
                bestDivision.division,

              gameNo:
                bestGameNo,
            });
          }
        }

        // ==================================================
        // LOSER
        // ==================================================

        else {
          player.status =
            "Lost";

          player.result = {
            division:
              null,

            prize:
              0,

            referralBonus:
              0,

            referralPercentage:
              0,

            referrerId:
              null,
          };
        }
      }

      // ====================================================
      // UPDATE GAME POOL
      // ====================================================

      gamePool.status =
        "Completed";

      gamePool.resultDeclared =
        true;

      gamePool.winningNumbers = {
        numbers: normalizedNumbers,
        powerball: normalizedPowerball,
      };

      await gamePool.save();

      // ====================================================
      // UPDATE WINNER creditS
      // ====================================================

      const updatedUsers = [];

      for (
        const update of
          userUpdates
      ) {
        try {
          const user =
            await User.findById(
              update.userId
            );

          if (!user) {
            continue;
          }

          // ================================================
          // ADD WINNING PRIZE
          // ================================================

          const oldcredit =
            Number(
              user.credit
            ) || 0;

          const prizeAmount =
            Number(
              update.amount
            ) || 0;

          user.credit =
            oldcredit +
            prizeAmount;

          await user.save();

          // ================================================
          // ADD REFERRAL BETTING BONUS
          // ================================================

          const referralResult =
            await addReferralBettingBonus(
              user,
              prizeAmount
            );

          // ================================================
          // STORE REFERRAL DATA
          // ================================================

          const player =
            gamePool.players.id(
              update.playerId
            );

          if (
            player
          ) {
            player.result =
              player.result ||
              {};

            if (
              referralResult.success
            ) {
              player.result.referralBonus =
                referralResult.bonus;

              player.result.referralPercentage =
                referralResult.percentage;

              player.result.referrerId =
                referralResult.referrerId;
            }
          }

          // ================================================
          // RESPONSE DATA
          // ================================================

          let referralBonus =
            0;

          let referralPercentage =
            0;

          let referrerId =
            null;

          let referrerName =
            null;

          if (
            referralResult.success
          ) {
            referralBonus =
              referralResult.bonus;

            referralPercentage =
              referralResult.percentage;

            referrerId =
              referralResult.referrerId;

            referrerName =
              referralResult.referrerName;

            totalReferralBonus +=
              referralBonus;

            totalReferralBonusCount++;

            referralBonusUpdates.push({
              winnerId:
                user._id,

              winnerName:
                user.name,

              prizeAmount,

              percentage:
                referralPercentage,

              referrerId,

              referrerName,

              bonus:
                referralBonus,
            });
          }

          updatedUsers.push({
            userId:
              user._id,

            userName:
              user.name,

            email:
              user.email,

            oldcredit,

            newcredit:
              user.credit,

            amountAdded:
              prizeAmount,

            division:
              update.division,

            gameNo:
              update.gameNo,

            referralBonus,

            referralPercentage,

            referrerId,

            referrerName,
          });
        } catch (error) {
          console.error(
            `Error updating user ${update.userId}:`,
            error
          );
        }
      }

      // ====================================================
      // SAVE REFERRAL DATA
      // ====================================================

      await gamePool.save();

      // ====================================================
      // RESPONSE
      // ====================================================

      return res.status(201).json({
        success: true,

        message:
          "Powerball result declared successfully. Winners and referral bonuses have been credited.",

        result,

        poolProcessed: {
          id:
            gamePool._id,

          drawNo:
            gamePool.drawNo,

          totalPlayers:
            gamePool.totalPlayers,

          totalWinners:
            poolWinners,

          totalPrizeAmount:
            totalPrizeAmount,

          totalReferralBonus:
            Number(
              totalReferralBonus.toFixed(
                2
              )
            ),

          totalReferralBonusCount,
        },

        winnersUpdated:
          updatedUsers,

        referralBonuses:
          referralBonusUpdates,
      });
    } catch (error) {
      console.error(
        "Create Powerball Result Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message,
      });
    }
  };

// ==========================================================
// GET ALL RESULTS
// ==========================================================

exports.getAllPowerballResults =
  async (
    req,
    res
  ) => {
    try {
      const { PowerballResult, GamePool, PowerballDivision } = getCountryContext(req);
      const results =
        await PowerballResult.find()
          .populate(
            "createdBy",
            "name email"
          )
          .populate(
            "gamePoolId",
            "ticketType gameType gameCount totalPlayers"
          )
          .sort({
            createdAt: -1,
          });

      return res.json({
        success: true,

        total:
          results.length,

        results,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message:
          error.message,
      });
    }
  };

// ==========================================================
// GET RESULT BY ID
// ==========================================================

exports.getPowerballResultById =
  async (
    req,
    res
  ) => {
    try {
      const { PowerballResult, GamePool, PowerballDivision } = getCountryContext(req);
      const result =
        await PowerballResult.findById(
          req.params.id
        )
          .populate(
            "createdBy",
            "name email"
          )
          .populate(
            "gamePoolId",
            "ticketType gameType gameCount totalPlayers players"
          );

      if (!result) {
        return res.status(404).json({
          success: false,
          message:
            "Result not found.",
        });
      }

      const gamePool =
        await GamePool.findById(
          result.gamePoolId
        )
          .populate(
            "players.user",
            "name email credit username"
          );

      const winnerDetails =
        gamePool?.players
          .filter(
            (p) =>
              p.status ===
              "Won"
          )
          .map(
            (p) => ({
              userId:
                p.user?._id,

              userName:
                p.user?.name,

              email:
                p.user?.email,

              username:
                p.user?.username,

              credit:
                p.user?.credit,

              prize:
                p.result?.prize,

              division:
                p.result?.division,

              gameNo:
                p.result?.gameNo,

              referralBonus:
                p.result?.referralBonus ||
                0,

              referralPercentage:
                p.result
                  ?.referralPercentage ||
                0,

              referrerId:
                p.result?.referrerId ||
                null,
            })
          ) || [];

      const totalWinners =
        winnerDetails.length;

      const totalPrize =
        winnerDetails.reduce(
          (
            sum,
            winner
          ) =>
            sum +
            (
              Number(
                winner.prize
              ) || 0
            ),
          0
        );

      const totalReferralBonus =
        winnerDetails.reduce(
          (
            sum,
            winner
          ) =>
            sum +
            (
              Number(
                winner.referralBonus
              ) || 0
            ),
          0
        );

      return res.json({
        success: true,

        result,

        winnerDetails,

        totalWinners,

        totalPrize,

        totalReferralBonus,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message:
          error.message,
      });
    }
  };

// ==========================================================
// DELETE RESULT
// ==========================================================

exports.deletePowerballResult =
  async (
    req,
    res
  ) => {
    try {
      const { PowerballResult, GamePool, PowerballDivision } = getCountryContext(req);
      const result =
        await PowerballResult.findById(
          req.params.id
        );

      if (!result) {
        return res.status(404).json({
          success: false,
          message:
            "Result not found.",
        });
      }

      const gamePool =
        await GamePool.findById(
          result.gamePoolId
        );

      if (gamePool) {
        const winningPlayers =
          gamePool.players.filter(
            (player) =>
              player.status ===
                "Won" &&
              player.result &&
              Number(
                player.result.prize
              ) > 0
          );

        const reversedUsers =
          [];

        let totalReferralReversed =
          0;

        // ==================================================
        // REVERSE WINNERS
        // ==================================================

        for (
          const player of
            winningPlayers
        ) {
          try {
            if (
              !player.user
            ) {
              continue;
            }

            const user =
              await User.findById(
                player.user
              );

            if (!user) {
              continue;
            }

            // ==============================================
            // REVERSE WINNING PRIZE
            // ==============================================

            const oldcredit =
              Number(
                user.credit
              ) || 0;

            const prizeAmount =
              Number(
                player.result.prize
              ) || 0;

            user.credit =
              Math.max(
                0,
                oldcredit -
                  prizeAmount
              );

            // ==============================================
            // REVERSE REFERRAL BONUS
            // ==============================================

            const referralBonus =
              Number(
                player.result
                  .referralBonus
              ) || 0;

            let referrer =
              null;

            if (
              referralBonus > 0
            ) {
              // --------------------------------------------
              // STORED REFERRER ID
              // --------------------------------------------

              if (
                player.result
                  .referrerId
              ) {
                if (
                  mongoose.Types.ObjectId.isValid(
                    player.result
                      .referrerId
                  )
                ) {
                  referrer =
                    await User.findById(
                      player.result
                        .referrerId
                    );
                }
              }

              // --------------------------------------------
              // referredByUser
              // --------------------------------------------

              if (
                !referrer &&
                user.referredByUser
              ) {
                if (
                  mongoose.Types.ObjectId.isValid(
                    user.referredByUser
                  )
                ) {
                  referrer =
                    await User.findById(
                      user.referredByUser
                    );
                }
              }

              // --------------------------------------------
              // referredBy ObjectId
              // --------------------------------------------

              if (
                !referrer &&
                user.referredBy
              ) {
                if (
                  mongoose.Types.ObjectId.isValid(
                    user.referredBy
                  )
                ) {
                  referrer =
                    await User.findById(
                      user.referredBy
                    );
                }
              }

              // --------------------------------------------
              // referredBy referral code
              // --------------------------------------------

              if (
                !referrer &&
                user.referredBy
              ) {
                referrer =
                  await User.findOne({
                    referralCode:
                      String(
                        user.referredBy
                      ).trim(),
                  });
              }

              // --------------------------------------------
              // DEDUCT REFERRAL BONUS
              // --------------------------------------------

              if (
                referrer
              ) {
                await User.updateOne(
                  {
                    _id:
                      referrer._id,
                  },
                  {
                    $inc: {
                      credit:
                        -referralBonus,

                      referralEarning:
                        -referralBonus,
                    },
                  }
                );

                totalReferralReversed +=
                  referralBonus;
              }
            }

            await user.save();

            reversedUsers.push({
              userId:
                user._id,

              userName:
                user.name,

              email:
                user.email,

              oldcredit,

              newcredit:
                user.credit,

              amountDeducted:
                prizeAmount,

              division:
                player.result
                  .division,

              referralBonusReversed:
                referralBonus,

              referrerId:
                referrer
                  ? referrer._id
                  : null,

              referrerName:
                referrer
                  ? referrer.name
                  : null,
            });
          } catch (error) {
            console.error(
              `Error reversing credit for user ${player.user}:`,
              error
            );
          }
        }

        // ==================================================
        // RESET GAME POOL
        // ==================================================

        gamePool.status =
          "Open";

        gamePool.resultDeclared =
          false;

        gamePool.winningNumbers =
          null;

        for (
          const player of
            gamePool.players
        ) {
          player.status =
            "Pending";

          player.result = {
            division:
              null,

            prize:
              0,

            referralBonus:
              0,

            referralPercentage:
              0,

            referrerId:
              null,
          };
        }

        await gamePool.save();

        await result.deleteOne();

        return res.json({
          success: true,

          message:
            "Result deleted successfully. Game pool reset and winner/referral credits reversed.",

          reversedUsers,

          totalReversed:
            reversedUsers.length,

          totalReferralReversed:
            Number(
              totalReferralReversed.toFixed(
                2
              )
            ),
        });
      }

      await result.deleteOne();

      return res.json({
        success: true,

        message:
          "Result deleted successfully.",
      });
    } catch (error) {
      console.error(
        "Delete Powerball Result Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message,
      });
    }
  };

// ==========================================================
// GET RESULTS BY GAME POOL
// ==========================================================

exports.getResultsByGamePool =
  async (
    req,
    res
  ) => {
    try {
      const { PowerballResult, GamePool, PowerballDivision } = getCountryContext(req);
      const {
        gamePoolId,
      } = req.params;

      const result =
        await PowerballResult.findOne({
          gamePoolId,
        })
          .populate(
            "createdBy",
            "name email"
          )
          .populate(
            "gamePoolId",
            "ticketType gameType gameCount totalPlayers"
          );

      if (!result) {
        return res.status(404).json({
          success: false,
          message:
            "No result found for this game pool.",
        });
      }

      const gamePool =
        await GamePool.findById(
          gamePoolId
        )
          .populate(
            "ticketType",
            "name price"
          )
          .populate(
            "gameCount",
            "name count"
          )
          .populate(
            "players.user",
            "name email username credit"
          );

      const winners =
        gamePool?.players
          .filter(
            (p) =>
              p.status ===
              "Won"
          )
          .map(
            (p) => ({
              userId:
                p.user?._id,

              userName:
                p.user?.name,

              email:
                p.user?.email,

              credit:
                p.user?.credit,

              prize:
                p.result?.prize,

              division:
                p.result?.division,

              referralBonus:
                p.result?.referralBonus ||
                0,

              referralPercentage:
                p.result
                  ?.referralPercentage ||
                0,

              referrerId:
                p.result?.referrerId ||
                null,
            })
          ) || [];

      const totalReferralBonus =
        winners.reduce(
          (
            sum,
            winner
          ) =>
            sum +
            (
              Number(
                winner.referralBonus
              ) || 0
            ),
          0
        );

      return res.json({
        success: true,

        result,

        poolDetails:
          gamePool,

        winners,

        totalWinners:
          winners.length,

        totalReferralBonus,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message:
          error.message,
      });
    }
  };

// ==========================================================
// GET PENDING GAME BY PLAYER ID
// ==========================================================

exports.getPendingGameByPlayerId =
  async (
    req,
    res
  ) => {
    try {
      const { PowerballResult, GamePool, PowerballDivision } = getCountryContext(req);
      const {
        playerId,
      } = req.params;

      if (!playerId) {
        return res.status(400).json({
          success: false,
          message:
            "Player ID is required.",
        });
      }

      const gamePool =
        await GamePool.findOne({
          "players._id":
            playerId,

          status:
            "Open",
        })
          .populate(
            "ticketType",
            "name price description"
          )
          .populate(
            "gameCount",
            "name count"
          )
          .populate(
            "players.user",
            "name email username"
          )
          .lean();

      if (!gamePool) {
        return res.status(404).json({
          success: false,
          message:
            "Pending game not found or already processed.",
        });
      }

      const player =
        gamePool.players.find(
          (p) =>
            p._id.toString() ===
            playerId.toString()
        );

      if (!player) {
        return res.status(404).json({
          success: false,
          message:
            "Player not found in this game pool.",
        });
      }

      const pendingGame = {
        poolId:
          gamePool._id,

        playerId:
          player._id,

        userId:
          player.user,

        games:
          player.games.map(
            (game) => ({
              gameNo:
                game.gameNo,

              numbers:
                game.numbers,

              powerball:
                game.powerball,
            })
          ),

        bidAmount:
          player.bidAmount,

        currencyDetails:
          player.currencyDetails,

        drawNo:
          gamePool.drawNo,

        ticketType:
          gamePool.ticketType,

        gameCount:
          gamePool.gameCount,

        playerStatus:
          player.status,

        poolStatus:
          gamePool.status,

        poolTotalPlayers:
          gamePool.totalPlayers,

        poolTotalAmount:
          gamePool.totalAmount,

        createdAt:
          gamePool.createdAt,
      };

      return res.json({
        success: true,
        game:
          pendingGame,
      });
    } catch (error) {
      console.error(
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message,
      });
    }
  };

// ==========================================================
// GET ALL PENDING GAMES
// ==========================================================

exports.getAllPendingGames =
  async (
    req,
    res
  ) => {
    try {
      const { PowerballResult, GamePool, PowerballDivision } = getCountryContext(req);
      const gamePools =
        await GamePool.find({
          status:
            "Open",
        })
          .populate(
            "ticketType",
            "name price description"
          )
          .populate(
            "gameCount",
            "name totalGames price"
          )
          .populate(
            "players.user",
            "name email username"
          );

      const pendingGames =
        [];

      gamePools.forEach(
        (pool) => {
          pool.players.forEach(
            (player) => {
              if (
                player.status ===
                "Pending"
              ) {
                pendingGames.push({
                  poolId:
                    pool._id,

                  drawNo:
                    pool.drawNo,

                  playerId:
                    player._id,

                  userId:
                    player.user?._id,

                  userName:
                    player.user?.name,

                  userEmail:
                    player.user?.email,

                  userUsername:
                    player.user?.username,

                  bidAmount:
                    player.bidAmount,

                  currencyDetails:
                    player.currencyDetails,

                  games:
                    player.games,

                  playerStatus:
                    player.status,

                  poolStatus:
                    pool.status,

                  createdAt:
                    pool.createdAt,
                });
              }
            }
          );
        }
      );

      return res.json({
        success: true,

        total:
          pendingGames.length,

        games:
          pendingGames,
      });
    } catch (error) {
      console.error(
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message,
      });
    }
  };

// ==========================================================
// GET GAME POOL DETAILS
// ==========================================================

exports.getGamePoolDetails =
  async (
    req,
    res
  ) => {
    try {
      const { PowerballResult, GamePool, PowerballDivision } = getCountryContext(req);
      const {
        poolId,
      } = req.params;

      const gamePool =
        await GamePool.findById(
          poolId
        )
          .populate(
            "ticketType",
            "name price description"
          )
          .populate(
            "gameCount",
            "name totalGames price"
          )
          .populate(
            "players.user",
            "name email username credit"
          );

      if (!gamePool) {
        return res.status(404).json({
          success: false,
          message:
            "Game pool not found.",
        });
      }

      const totalPlayers =
        gamePool.players.length;

      const pendingPlayers =
        gamePool.players.filter(
          (p) =>
            p.status ===
            "Pending"
        ).length;

      const wonPlayers =
        gamePool.players.filter(
          (p) =>
            p.status ===
            "Won"
        ).length;

      const lostPlayers =
        gamePool.players.filter(
          (p) =>
            p.status ===
            "Lost"
        ).length;

      const totalPrize =
        gamePool.players
          .filter(
            (p) =>
              p.status ===
              "Won"
          )
          .reduce(
            (
              sum,
              p
            ) =>
              sum +
              (
                Number(
                  p.result?.prize
                ) || 0
              ),
            0
          );

      const totalReferralBonus =
        gamePool.players
          .filter(
            (p) =>
              p.status ===
              "Won"
          )
          .reduce(
            (
              sum,
              p
            ) =>
              sum +
              (
                Number(
                  p.result
                    ?.referralBonus
                ) || 0
              ),
            0
          );

      return res.json({
        success: true,

        pool:
          gamePool,

        statistics: {
          totalPlayers,

          pendingPlayers,

          wonPlayers,

          lostPlayers,

          totalPrize,

          totalReferralBonus,
        },
      });
    } catch (error) {
      console.error(
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message,
      });
    }
  };

// ==========================================================
// GET USER WINNING HISTORY
// ==========================================================

exports.getUserWinningHistory =
  async (
    req,
    res
  ) => {
    try {
      const { PowerballResult, GamePool, PowerballDivision } = getCountryContext(req);
      const userId =
        req.user.id;

      const gamePools =
        await GamePool.find({
          "players.user":
            userId,

          "players.status":
            "Won",

          resultDeclared:
            true,
        })
          .populate(
            "ticketType",
            "name price"
          )
          .populate(
            "gameCount",
            "name totalGames"
          )
          .sort({
            createdAt: -1,
          });

      const winningHistory =
        [];

      let totalEarnings =
        0;

      let totalReferralBonus =
        0;

      gamePools.forEach(
        (pool) => {
          const player =
            pool.players.find(
              (p) =>
                p.user.toString() ===
                  userId.toString() &&
                p.status ===
                  "Won"
            );

          if (
            player &&
            player.result
          ) {
            const prize =
              Number(
                player.result
                  .prize
              ) || 0;

            const referralBonus =
              Number(
                player.result
                  .referralBonus
              ) || 0;

            totalEarnings +=
              prize;

            totalReferralBonus +=
              referralBonus;

            winningHistory.push({
              drawNo:
                pool.drawNo,

              gamePoolId:
                pool._id,

              ticketType:
                pool.ticketType,

              gameCount:
                pool.gameCount,

              division:
                player.result
                  .division,

              prize,

              gameNo:
                player.result
                  .gameNo,

              referralBonus,

              referralPercentage:
                player.result
                  .referralPercentage ||
                0,

              winningNumbers:
                pool.winningNumbers,

              declaredAt:
                pool.updatedAt ||
                pool.createdAt,

              status:
                pool.status,
            });
          }
        }
      );

      return res.json({
        success: true,

        total:
          winningHistory.length,

        totalEarnings,

        totalReferralBonus,

        history:
          winningHistory,
      });
    } catch (error) {
      console.error(
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message,
      });
    }
  };

// ==========================================================
// GET USER credit
// ==========================================================

exports.getUsercredit =
  async (
    req,
    res
  ) => {
    try {
      const { PowerballResult, GamePool, PowerballDivision } = getCountryContext(req);
      const userId =
        req.user.id;

      const user =
        await User.findById(
          userId
        ).select(
          "credit name email username"
        );

      if (!user) {
        return res.status(404).json({
          success: false,
          message:
            "User not found.",
        });
      }

      return res.json({
        success: true,

        user: {
          id:
            user._id,

          name:
            user.name,

          email:
            user.email,

          username:
            user.username,

          credit:
            user.credit ||
            0,
        },
      });
    } catch (error) {
      console.error(
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message,
      });
    }
  };


exports.getUnselectedPowerballNumbers = async (req, res) => {
    try {
        const { GamePool } = getCountryContext(req);

        const {
            gamePoolId,
            country,
        } = req.query;

        // ------------------------------------------------------
        // VALIDATION
        // ------------------------------------------------------

        if (!gamePoolId && !country) {
            return res.status(400).json({
                success: false,
                message: "gamePoolId or country is required.",
            });
        }

        // ------------------------------------------------------
        // FIND GAME POOL
        // ------------------------------------------------------

        let gamePool;

        if (gamePoolId) {
            gamePool = await GamePool.findById(gamePoolId).lean();
        } else {
            gamePool = await GamePool.findOne({
                country: String(country).trim().toUpperCase(),
                status: "Open",
            })
                .sort({
                    drawNo: -1,
                    createdAt: -1,
                })
                .lean();
        }

        if (!gamePool) {
            return res.status(404).json({
                success: false,
                message: "Game pool not found.",
            });
        }

        // ------------------------------------------------------
        // MAIN NUMBER RANGE
        // ------------------------------------------------------

        // Powerball main numbers:
        // 1 - 69

        const ALL_MAIN_NUMBERS = Array.from(
            { length: 69 },
            (_, index) => index + 1
        );

        // Powerball:
        // 1 - 20

        const ALL_POWERBALLS = Array.from(
            { length: 20 },
            (_, index) => index + 1
        );

        // ------------------------------------------------------
        // COLLECT SELECTED NUMBERS
        // ------------------------------------------------------

        const selectedMainSet = new Set();
        const selectedPowerballSet = new Set();

        for (const player of gamePool.players || []) {
            for (const game of player.games || []) {

                // Main numbers
                for (const number of game.numbers || []) {
                    const num = Number(number);

                    if (
                        Number.isInteger(num) &&
                        num >= 1 &&
                        num <= 69
                    ) {
                        selectedMainSet.add(num);
                    }
                }

                // Powerball
                if (
                    game.powerball !== undefined &&
                    game.powerball !== null
                ) {
                    const powerball = Number(game.powerball);

                    if (
                        Number.isInteger(powerball) &&
                        powerball >= 1 &&
                        powerball <= 20
                    ) {
                        selectedPowerballSet.add(powerball);
                    }
                }
            }
        }

        // ------------------------------------------------------
        // GET UNSELECTED NUMBERS
        // ------------------------------------------------------

        const selectedMainNumbers = [...selectedMainSet]
            .sort((a, b) => a - b);

        const selectedPowerballs = [...selectedPowerballSet]
            .sort((a, b) => a - b);

        const unselectedMainNumbers = ALL_MAIN_NUMBERS.filter(
            (number) => !selectedMainSet.has(number)
        );

        const unselectedPowerballs = ALL_POWERBALLS.filter(
            (number) => !selectedPowerballSet.has(number)
        );

        // ------------------------------------------------------
        // RESPONSE
        // ------------------------------------------------------

        return res.status(200).json({
            success: true,

            country: gamePool.country,

            gamePoolId: gamePool._id,

            drawNo: gamePool.drawNo,

            selected: {
                mainNumbers: selectedMainNumbers,
                powerballs: selectedPowerballs,
            },

            unselected: {
                mainNumbers: unselectedMainNumbers,
                powerballs: unselectedPowerballs,
            },

            counts: {
                selectedMainNumbers:
                    selectedMainNumbers.length,

                unselectedMainNumbers:
                    unselectedMainNumbers.length,

                selectedPowerballs:
                    selectedPowerballs.length,

                unselectedPowerballs:
                    unselectedPowerballs.length,
            },
        });

    } catch (error) {
        console.error(
            "Get Unselected Powerball Numbers Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};