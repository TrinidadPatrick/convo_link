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

app.use("/api", Route);

server.listen(process.env.PORT, () => {
  console.log("Server is running on port " + process.env.PORT);
});

