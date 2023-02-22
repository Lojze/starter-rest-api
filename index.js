// index.js

import express from "express";
import { router as bikesRouter } from "./router.js"; // this is the new import

import { generateAccessToken } from "./utils/auth.js";
import {corsWhitelist} from './utils/cors.js'

const app = express();

app.use(corsWhitelist());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Landing Page
app.use(express.static('homepage'))


app.use("/bikes", bikesRouter); // this is the new line

// Create new bearer token
app.post("/api/user", (req, res) => {
  const username = req.body.username;

  const token = generateAccessToken({ username });
  res.send({ token });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});