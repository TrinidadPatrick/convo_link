const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const http = require("http");
const dotenv = require("dotenv");
const Route = require("./routes");
dotenv.config();

const app = express();
const server = http.createServer(app);

app.use(express.json());
app.use(cookieParser());

const myLogger = function (req, res, next) {
  // console.log(req)
  next()
}

app.use(myLogger)

app.use(cors({
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With', 'Access-Control-Allow-Origin', 'Access-Control-Allow-Credentials', 'Access-Control-Allow-Methods', 'Access-Control-Allow-Headers'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  origin: '*',
}));

app.use("/api", Route);

mongoose.connect(process.env.MONGODB_URI).then(() => {
  console.log("MongoDB connected");
}).catch((err) => {
  console.log("Error connecting to MongoDB", err);
});

server.listen(process.env.PORT, () => {
  console.log("Server is running on port " + process.env.PORT);
});

