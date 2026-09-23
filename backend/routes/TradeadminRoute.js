const express = require("express");

const router = express.Router();

const c = require("../controllers/tradeadminController");

const { upload } = require("../utils/upload.js");

router.get("/admin/allUsers", c.allUsers);

router.get("/betlist", c.betlist);

router.get("/pendingBetlist", c.pendingBetlist);

router.post("/admin/userInfo", c.userInfo);

router.get("/allBet", c.getAllBet);


router.post("/admin/userRecharge", c.userRecharge);

router.post("/admin/userWithdrawal", c.userWithdrawal);

router.post("/admin/userBet", c.userBet);

router.get("/admin/pendingRecharge", c.pendingRecharge);

router.get("/admin/rechargeList", c.rechargeList);

router.get("/admin/pendingWithdrawal", c.pendingWithdrawal);

router.get("/admin/withdrawalList", c.withdrawalList);

router.post("/admin/approveWithdrawal", c.approveWithdrawal);

router.post("/admin/approveRecharge", c.approveRecharge);

router.post("/admin/allAgent", c.allAgent);

router.post("/admin/adminResult", c.adminResult);

router.get("/admin/adminget", c.adminget);

router.post("/admin/increaseMoney", c.increaseMoney);

router.post("/admin/convertAdmin", c.convertAdmin);

router.post("/admin/blockUser", c.blockUser);

router.post("/admin/createAgent", c.createAgent);

router.post("/admin/allAdminData", c.allAdminData);

router.get(
  "/admin/downloadTodayRecharge",
  c.downloadTodayRecharge
);

router.post("/admin/createPromocode", c.createPromocode);

router.get("/admin/getPromocode", c.getPromocode);

router.post(
  "/admin/addLeaderboard",
  upload.single("image"),
  c.addLeaderboard
);

router.get("/admin/getLeader", c.getLeader);

module.exports = router;