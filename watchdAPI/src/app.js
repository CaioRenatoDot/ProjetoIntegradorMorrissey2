const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const { notFoundHandler, errorHandler } = require('./middlewares/error.middleware');

const authRoutes = require('./routes/auth.routes');
const watchlistRoutes = require("./routes/watchlist.routes");
const favoriteRoutes = require("./routes/favorite.routes")
const reviewRoutes = require("./routes/review.routes")
const userRoutes = require("./routes/user.routes")
const listRoutes = require("./routes/list.routes")

const app = express();

// CORS_ORIGIN aceita varias origens separadas por virgula (ex.: o front local
// e o publicado no GitHub Pages). credentials: true e obrigatorio para o
// navegador enviar o cookie de sessao em requisicoes cross-origin.
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

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

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;