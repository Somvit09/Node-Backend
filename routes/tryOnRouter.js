const tryON = require(".././pages/tryon button/tryON")
const express = require("express")


const tryONRouter = express.Router()

// tryon button
tryONRouter.post("/", tryON)


module.exports = tryONRouter