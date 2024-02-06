import mongoose from "mongoose";
import wiki from "./routes/wiki.js";
import express from "express";
import path from "path";
import "dotenv/config.js";
import bodyParser from "body-parser";
import compression from "compression";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
const limiter = rateLimit({ windowMs: 1 * 60 * 1000, max: 40 });
import indexRouter from "./routes/index.js";
import usersRouter from "./routes/users.js";
import catalogRouter from "./routes/catalog.js";
const app = express();
app.use(limiter);
app.use(helmet.contentSecurityPolicy({
    directives: {
        "script-src": ["'self'", "code.jquery.com", "cdn.jsdelivr.net"],
    },
}));
app.use(compression());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/catalog", catalogRouter);
app.use("/wiki", wiki);
app.set("view engine", "pug");
app.set("views", path.resolve("dist/views/"));
mongoose.set("strictQuery", false);
const mongoDB = process.env.MONGODB;
const port = +process.env.PORT || 3000;
const main = async () => {
    await mongoose.connect(mongoDB);
};
app.listen(port, console.log("running on localhost:3000"));
main().catch((err) => console.log(err));
