require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/auth");
const customerRoutes = require("./routes/customers");
const paymentRoutes = require("./routes/payments");

const app = express();

/* ---------- CORS CONFIGURATION ---------- */
const allowedOrigins = [
  'https://owode.xyz',
  'https://www.owode.xyz',
  'http://localhost:3000',
  'http://localhost:5000',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5000'
];

app.use((req, res, next) => {
  const origin = req.headers.origin;

  // Allow requests with no origin (Postman, mobile apps, etc.)
  if (!origin) {
    res.setHeader('Access-Control-Allow-Origin', '*');
  } else if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
    return res.sendStatus(204);
  }

  next();
});

app.use(express.json());

/* ---------- DATABASE ---------- */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB error:", err));

/* ---------- API ROUTES ---------- */
app.use("/auth", authRoutes);
app.use("/customers", customerRoutes);
app.use("/payments", paymentRoutes);

/* ---------- FRONTEND (PRODUCTION) ---------- */
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/build")));

  app.get("*", (req, res) => {
    res.sendFile(
      path.resolve(__dirname, "../frontend/build", "index.html")
    );
  });
}

/* ---------- SERVER ---------- */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);
