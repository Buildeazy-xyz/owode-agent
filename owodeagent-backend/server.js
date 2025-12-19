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
  'https://www.owode.xyz'
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like Postman)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 🔥 THIS LINE IS CRITICAL - Handle preflight requests
app.options('*', cors());

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
