require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const usersRouter = require("./routes/users");

mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true });
const db = mongoose.connection;
db.on("error", (error) => console.error(error));
db.once("open", () => console.log("Connected to database"));

app.use(express.json());

app.use("/users", usersRouter);

function errorHandler(err, req, res, next) {
  res.status(500);
  res.json({ message: "An unexpected error has occurred", error: err });
}

app.use(errorHandler);

app.listen(3000, () => console.log("Server Started"));
