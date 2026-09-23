const cron = require("node-cron");
const Market = require("./models/Market");

// --------------------------------------------------
// Normalize date to YYYY-MM-DD (local date)
// --------------------------------------------------
function normalizeDate(value) {
  if (!value) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  date.setHours(0, 0, 0, 0);

  return date;
}

// --------------------------------------------------
// Create next market day
// --------------------------------------------------
async function createNextMarketDays() {
  try {
    console.log("========================================");
    console.log("NEXT MARKET DAY CRON STARTED");
    console.log(new Date().toISOString());
    console.log("========================================");

    const markets = await Market.find({});

    if (!markets.length) {
      console.log("No markets found.");
      return;
    }

    let created = 0;
    let skipped = 0;
    let failed = 0;

    for (const market of markets) {
      try {
        // ------------------------------------------
        // No marketArray
        // ------------------------------------------
        if (
          !Array.isArray(market.marketArray) ||
          market.marketArray.length === 0
        ) {
          console.log(
            `[SKIP] Market ${market._id} has no marketArray`
          );

          skipped++;
          continue;
        }

        // ------------------------------------------
        // Find latest market day
        // ------------------------------------------
        let latestDay = null;
        let latestDate = null;

        for (const day of market.marketArray) {
          const dayDate = normalizeDate(day.marketDate);

          if (!dayDate) continue;

          if (!latestDate || dayDate.getTime() > latestDate.getTime()) {
            latestDate = dayDate;
            latestDay = day;
          }
        }

        // ------------------------------------------
        // Invalid dates
        // ------------------------------------------
        if (!latestDay || !latestDate) {
          console.log(
            `[SKIP] Market ${market._id} has no valid marketDate`
          );

          skipped++;
          continue;
        }

        // ------------------------------------------
        // Next date
        // ------------------------------------------
        const nextDate = new Date(latestDate);

        nextDate.setDate(nextDate.getDate() + 1);
        nextDate.setHours(0, 0, 0, 0);

        // ------------------------------------------
        // Duplicate check
        // ------------------------------------------
        const alreadyExists = market.marketArray.some((day) => {
          const dayDate = normalizeDate(day.marketDate);

          return (
            dayDate &&
            dayDate.getTime() === nextDate.getTime()
          );
        });

        if (alreadyExists) {
          console.log(
            `[SKIP] Market ${market._id} already has date ${formatDate(
              nextDate
            )}`
          );

          skipped++;
          continue;
        }

        // ------------------------------------------
        // Create new market day
        // ONLY marketDate changes
        // ------------------------------------------
        const newDay = {
          marketDate: nextDate,

          openTime: latestDay.openTime,
          closeTime: latestDay.closeTime,
          resultTime: latestDay.resultTime,

          minBid: latestDay.minBid,
          maxBid: latestDay.maxBid,

          isActive: latestDay.isActive !== false,
        };

        // ------------------------------------------
        // Copy any additional fields if your schema
        // has them
        // ------------------------------------------
        if (latestDay.marketDayId !== undefined) {
          newDay.marketDayId = latestDay.marketDayId;
        }

        market.marketArray.push(newDay);

        await market.save();

        created++;

        console.log(
          `[CREATED] Market ${market._id}: ${formatDate(
            latestDate
          )} -> ${formatDate(nextDate)}`
        );
      } catch (marketError) {
        failed++;

        console.error(
          `[ERROR] Market ${market._id}:`,
          marketError.message
        );
      }
    }

    console.log("========================================");
    console.log("NEXT MARKET DAY CRON COMPLETED");
    console.log(`Markets      : ${markets.length}`);
    console.log(`Created      : ${created}`);
    console.log(`Skipped      : ${skipped}`);
    console.log(`Failed       : ${failed}`);
    console.log("========================================");
  } catch (error) {
    console.error(
      "NEXT MARKET DAY CRON ERROR:",
      error
    );
  }
}

// --------------------------------------------------
// Format date
// --------------------------------------------------
function formatDate(date) {
  if (!date) return "N/A";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

// --------------------------------------------------
// CRON
// Runs every day at 12:01 AM
// --------------------------------------------------
cron.schedule(
  "1 0 * * *",
  async () => {
    await createNextMarketDays();
  },
  {
    timezone: "Asia/Kolkata",
  }
);

console.log(
  "Market Day Cron initialized - runs daily at 12:01 AM IST"
);

// --------------------------------------------------
// Optional manual export
// --------------------------------------------------
module.exports = {
  createNextMarketDays,
};