// index.js

import express from "express";

import { bikes as bikesRouter } from "./router/bikes.js"; // this is the new import
import { api as apiRouter } from "./router/api.js"; // this is the new import
import { ai as aiRouter } from "./router/ai.js"; // this is the new import

import {corsWhitelist} from './utils/cors.js'

const app = express();

app.use(corsWhitelist());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use("/bikes", bikesRouter); // this is the new line

app.use("/api", apiRouter); // this is the new line
app.use("/ai", aiRouter); // this is the new line



const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});