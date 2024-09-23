const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const http = require("http");
const Route = require("./routes");
const middleware = require("./middleware");
const socketConfig = require("./socket");

const app = express();
const server = http.createServer(app);
const io = socketConfig(server);


app.use(cors({
  origin: ['http://localhost:3000', 'https://convo-wave.vercel.app'],
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());
require("dotenv").config();

app.use("/api",middleware, Route);

mongoose.connect(process.env.MONGODB_URI).then(() => {
  console.log("MongoDB connected");
}).catch((err) => {
  console.log("Error connecting to MongoDB", err);
});

server.listen(process.env.PORT, () => {
  console.log("Server is running on port " + process.env.PORT);
});

