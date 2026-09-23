require("dotenv").config();

const mongoose = require("mongoose");
const dns = require("dns");

// =====================================================
// DNS
// =====================================================

dns.setServers(["1.1.1.1", "8.8.8.8"]);

async function assignUserIds() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const users = mongoose.connection.db.collection("users");

    const lastUser = await users
      .find({
        userId: {
          $exists: true,
          $ne: null,
          $type: "number",
        },
      })
      .sort({ userId: -1 })
      .limit(1)
      .next();

    let nextUserId = lastUser
      ? Number(lastUser.userId) + 1
      : 100001;

    const missingUsers = await users
      .find({
        $or: [
          { userId: { $exists: false } },
          { userId: null },
        ],
      })
      .sort({ createdAt: 1, _id: 1 })
      .toArray();

    for (const user of missingUsers) {
      await users.updateOne(
        { _id: user._id },
        { $set: { userId: nextUserId } }
      );

      console.log(
        `${user.email || user.name} -> ${nextUserId}`
      );

      nextUserId++;
    }

    console.log(`✅ ${missingUsers.length} users updated`);

  } catch (err) {
    console.error("❌", err);
  } finally {
    await mongoose.disconnect();
  }
}

assignUserIds();