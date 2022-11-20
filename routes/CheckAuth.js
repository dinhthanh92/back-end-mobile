const AppUntil = require("../AppUntil");
const express = require("express");
const router = express.Router();
router.get("/check-login", async (req, res) => {
    return res.status(200)
        .send(AppUntil.ResResult(200,false, true, "Get data success"))
})

router.get("/check-login-native", async (req, res) => {
    return res.status(200)
        .send(AppUntil.ResResult(200,false, req.currentUser, "Get data success"))
})

module.exports = router