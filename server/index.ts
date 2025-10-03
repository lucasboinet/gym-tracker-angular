import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express, { Application } from "express";
import http from "http";

// import { connectRedis } from './services/redis';
import config from "./config";
import router from "./router";
import database from "./services/database";

dotenv.config();

const app: Application = express();

app.use(compression());
app.use(cookieParser());
app.use(express.json());
app.use(
  cors({
    origin: [config.origin],
    methods: ["GET", "POST", "DELETE", "PUT", "PATCH"],
    credentials: true,
  })
);
app.use((req, res, next) => {
  console.debug(req.method, "=>", req.originalUrl);
  next();
});

app.get("/", (req, res) => {
  res.json({ message: "Welcome on Gym Tracker API" });
});

app.use("/api", router);

const server = http.createServer(app);

database.connect();
// connectRedis();

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.debug(`[server] Running on port ${PORT}`));
