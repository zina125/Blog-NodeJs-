require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const cors = require("cors");
const compression = require("compression");
const mongoose = require("mongoose");
const morgan = require("morgan");
const usersRoutes = require("./routes/users");
const postsRoutes = require("./routes/posts");
const errorHandler = require("./middlewares/errorhandler");

const app = express();

app.use(express.json()); 

app.use(helmet());
app.use(mongoSanitize());
app.use(xss());
app.use(hpp());
app.use(compression());

const corsOptions = {
  origin: ["https://yourtrusteddomain.com", "http://localhost:3000"],
  methods: "GET,POST,PUT,PATCH,DELETE",
  credentials: true
};
app.use(cors(corsOptions));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  message: "Too many requests from this IP, please try again later."
});
app.use("/api/", limiter);

app.use(morgan("dev"));

const V1_PREFIX = "/api/v1";
app.use(`${V1_PREFIX}/users`, usersRoutes);
app.use(`${V1_PREFIX}/posts`, postsRoutes);

app.use((req, res, next) => {
  res.status(404).json({ message: `Route ${req.path} not found` });
});

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection Failed:", err);
    process.exit(1); 
  });
