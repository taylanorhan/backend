require("dotenv").config();
console.log("TOKEN_SECRET:", process.env.TOKEN_SECRET);

const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("./models/User");
const Cart = require("./models/Cart");
const Order = require("./models/Order");
const adminRoutes = require("./routes/admin");
const adminOrdersRoutes = require("./routes/admin_orders");
const { authenticateToken, isAdmin } = require("./middleware/auth");

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/admin/orders", authenticateToken, isAdmin, adminOrdersRoutes);

const mongoURI =
  "mongodb+srv://orhansawaf:orhan123@cluster0.nicwuiq.mongodb.net/mydatabase?retryWrites=true&w=majority";

console.log("MongoDB URI:", mongoURI);

mongoose
  .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use(express.static(path.join(__dirname, "..", "build")));

app.use("/admin", authenticateToken, isAdmin, adminRoutes);

app.post("/signup", async (req, res) => {
  try {
    console.log("Request Body:", req.body);
    const { email, password, username, name, surname, age } = req.body;
    if (!username) {
      return res.status(400).send("Username is required");
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      email,
      password: hashedPassword,
      username,
      name,
      surname,
      age,
    });
    await newUser.save();
    res.status(201).send("User registered successfully");
  } catch (err) {
    console.error("Error during user registration:", err);
    res.status(500).send("User registration failed");
  }
});

app.post("/login", async (req, res) => {
  try {
    console.log("Request Body:", req.body);
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send("Kullanıcı bulunamadı");
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).send("Hatalı şifre");
    }

    console.log("TOKEN_SECRET:", process.env.TOKEN_SECRET); // Kontrol edin
    const token = jwt.sign(
      { _id: user._id, isAdmin: user.isAdmin },
      process.env.TOKEN_SECRET,
      { expiresIn: "1h" }
    );
    res.json({ token, user });
  } catch (err) {
    console.error("Error during user login:", err);
    res.status(500).send("Giriş işlemi başarısız");
  }
});

app.post("/cart", async (req, res) => {
  try {
    console.log("Cart Request Body:", req.body);
    const { userId, cart } = req.body;
    const existingCart = await Cart.findOne({ userId });

    if (existingCart) {
      existingCart.items = cart;
      await existingCart.save();
      console.log("Cart updated:", existingCart);
      res.status(201).json({ message: "Cart updated", cart: existingCart });
    } else {
      const newCart = new Cart({
        userId,
        items: cart,
      });
      await newCart.save();
      console.log("Cart created:", newCart);
      res.status(201).json({ message: "Cart created", cart: newCart });
    }
  } catch (err) {
    console.error("Error during cart creation:", err);
    res.status(500).json({ message: "Cart creation failed" });
  }
});

app.get("/cart", async (req, res) => {
  try {
    const { userId } = req.query;
    const cart = await Cart.findOne({ userId });
    console.log("Fetched Cart:", cart);
    res.status(200).json(cart ? cart.items : []);
  } catch (err) {
    console.error("Error fetching cart:", err);
    res.status(500).send("Cart fetch failed");
  }
});

app.post("/orders", async (req, res) => {
  try {
    const { userId, items } = req.body;
    const newOrder = new Order({
      userId,
      items,
    });
    await newOrder.save();
    res.status(201).json({ message: "Order created", order: newOrder });
  } catch (err) {
    console.error("Error during order creation:", err);
    res.status(500).json({ message: "Order creation failed" });
  }
});

app.get("/orders", authenticateToken, async (req, res) => {
  try {
    const { _id } = req.user; // Auth middleware tarafından eklenen user bilgisi
    const orders = await Order.find({ userId: _id });
    res.status(200).json(orders);
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).send("Siparişler getirilemedi");
  }
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "build", "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
