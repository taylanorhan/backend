const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const { isAdmin } = require("../middleware/auth");

// Admin tüm siparişleri görüntüleme yetkisi
router.get("/all", isAdmin, async (req, res) => {
  try {
    const orders = await Order.find();
    console.log("All orders:", orders);
    res.status(200).json(orders);
  } catch (err) {
    console.error("Error fetching all orders:", err);
    res.status(500).send("Siparişler getirilemedi");
  }
});

module.exports = router;
