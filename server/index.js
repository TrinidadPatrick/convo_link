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

// app.use(cors({
//   origin: ["http://localhost:3000", "https://convo-wave.vercel.app"],
//   credentials: true,
  
// }));

app.use("/api", Route);

mongoose.connect(process.env.MONGODB_URI).then(() => {
  console.log("MongoDB connected");
}).catch((err) => {
  console.log("Error connecting to MongoDB", err);
});

server.listen(process.env.PORT, () => {
  console.log("Server is running on port " + process.env.PORT);
});

