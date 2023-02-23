import { Router } from "express";
import { generateAccessToken } from "../utils/auth.js";
import { REPLICATE_URL } from "../consts.js"
import fetch from 'node-fetch';

// Initialize Express router
export const api = Router();

// Create new bearer token
api.post("/user", (req, res) => {
    const username = req.body.username;

    const token = generateAccessToken({ username });
    res.send({ token });
});

api.post("/replicate", async (req, res) => {
    const prompt = req.body.input;
    const response = await fetch(`${REPLICATE_URL}/v1/predictions`,{
        method: "POST",
        headers: {
            Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            // Pinned to a specific version of Stable Diffusion
            // See https://replicate.com/stability-ai/stable-diffussion/versions
            version: "435061a1b5a4c1e26740464bf786efdfa9cb3a3ac488595a2de23e143fdb0117",

            // This is the text prompt that will be submitted by a form on the frontend
            input: { prompt },
        }),
    })

    if (response.status !== 201) {
        let error = await response.json();
        res.statusCode = 500;
        res.end(JSON.stringify({
            detail: error.detail
        }));
        return;
    }

    const prediction = await response.json();
    res.statusCode = 201;
    res.end(JSON.stringify(prediction));
});


