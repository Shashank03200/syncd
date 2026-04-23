
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");


const logger = require("./utils/logger");


const app = express();

// Security and middleware
app.use(helmet())
app.use(cors({origin: "*"}));

app.use(morgan("combined", {stream: {write: (msg) => logger.info(msg.trim())}}))

app.use(express.json({limit: "10kb"}));
app.use(express.urlencoded({extended: true}));

app.get("/health", (req, res)=>{
  res.status(200).json({status: "ok", timestamp: new Date().toISOString()})
})

app.use("/api/v1", ()=>{
  app.render("<b>Hello world</b>");
})

module.exports = app;