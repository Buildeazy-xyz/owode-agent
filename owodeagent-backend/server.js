require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/auth");
const customerRoutes = require("./routes/customers");
const paymentRoutes = require("./routes/payments");

const app = express();

/* ---------- MIDDLEWARE ---------- */
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? function (origin, callback) {
        // Allow requests with no origin (mobile apps, etc.)
        if (!origin) return callback(null, true);

        // Allow specific production domains
        const allowedOrigins = [
          'https://owode.xyz',
          'https://www.owode.xyz',
          'https://owode-agent.onrender.com',
          'https://your-app-name.onrender.com'
        ];

        if (allowedOrigins.includes(origin)) {
          return callback(null, true);
        }

        // Allow all origins for development/testing
        return callback(null, true);
      }
    : ['http://localhost:3000', 'http://localhost:5000', 'http://127.0.0.1:3000', 'http://127.0.0.1:5000'],
  credentials: true
}));
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
