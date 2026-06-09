const express = require("express");
const routes = require("./routes/index");
const errorMiddleware = require("./middleware/error.middleware");

const app = express();

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ success: true, message: "LedgerFlow is running" });
});

// Routes
app.use("/api", routes);

// Error handler — must be last
app.use(errorMiddleware);

module.exports = app;