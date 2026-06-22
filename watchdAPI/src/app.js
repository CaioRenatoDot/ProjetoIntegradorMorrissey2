const express = require('express');

const authRoutes = require('./routes/auth.routes');
const watchlistRoutes = require("./routes/watchlist.routes");
const favoriteRoutes = require("./routes/favorite.routes")
const reviewRoutes = require("./routes/review.routes")
const userRoutes = require("./routes/user.routes")
const listRoutes = require("./routes/list.routes")

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

app.use("/favorites", favoriteRoutes);
app.use("/auth", authRoutes);
app.use("/watchlist", watchlistRoutes);
app.use("/reviews", reviewRoutes);
app.use("/users", userRoutes);
app.use("/lists", listRoutes);

module.exports = app;