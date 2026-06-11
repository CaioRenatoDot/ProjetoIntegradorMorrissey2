const express = require('express');

const authRoutes = require('./routes/auth.routes');
const watchlistRoutes = require("./routes/watchlist.routes");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  return res.json({
    message: "Watchd API is running!"
  });
});

app.get("/health", (req, res) => {
  return res.json({
    status: "ok",
    message: "A API esta funcionando!",
    service: "Watchd API",
    timestamp: new Date().toISOString()
  });
});

app.use("/auth", authRoutes);
app.use("/watchlist", watchlistRoutes);

module.exports = app;