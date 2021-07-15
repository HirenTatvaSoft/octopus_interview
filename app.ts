import express, {  } from "express";
import helmet from "helmet";
import cors from "cors";
import httpStatus from "http-status";
import routes from "./routes";
import ApiError from "./utils/ApiError";
import bodyParser from "body-parser";

const xss = require("xss-clean");
var cookieParser = require('cookie-parser')


const app = express();
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(xss());
app.use(cookieParser())
app.use(cors());
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", '*');
  res.header("Access-Control-Allow-Credentials", 'true');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header("Access-Control-Allow-Headers", 'Origin,X-Requested-With,Content-Type,Accept,content-type,application/json');
  next();
});

app.use("/v1", routes);

app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, "Not found"));
});


app.listen(process.env.PORT || 8899, () => {
  
  console.log(`Listening to port ${process.env.PORT || 8899}`);
});
