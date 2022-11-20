const express = require("express");
const UserSchema = require("../module/UserSchema")
const AppUntil = require("../AppUntil");
const jwt = require("jsonwebtoken");
const argon2 = require("argon2");
const _ = require("lodash");
const router = express.Router();


router.post("/login", async (req, res)=>{

    const request = req.body;

    const user = await UserSchema.find();
    try {
        const findUser = _.find(user, x =>
            (x.username === request.username || x.email === request.username)
        )

        if(findUser){
            const verifyPassword = await argon2.verify(findUser.password, request.password)
            if(verifyPassword){
                const result = {
                    _id: findUser._id.toString(),
                    email: findUser.email,
                    username: findUser.username,
                    type: findUser.type,
                    isFirst: findUser.isFirst
                }
                const accessToken = jwt.sign(result,
                    process.env.ACCESS_TOKEN_SECRET,
                    {
                        expiresIn: "2h",
                    })

                return res.status(200)
                    .send(AppUntil.ResResult(200, true,
                        {
                            user: result,
                            token: accessToken
                        },
                        "Login success"))
            }
        }
        return res.status(201)
            .send(AppUntil.ResResult(201, false, {}, "Username or password wrong"))
    } catch (e) {
        return  res.status(500)
            .send(AppUntil.ResResult(500, false, {}, "123"))
    }
})

router.post("/change-password", async (req, res) => {
    const {token, password} = req.body;
    const str = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());

    try {

        const user = await UserSchema.findOne({_id: str?._id.toString() || "" })
        console.log(user)

        if(user && user.isFirst){
            const newPassword = await argon2.hash(password);

            await UserSchema.updateOne({_id: user._id}, {$set: {password: newPassword, isFirst: false}})
            return res.status(200)
                .send(AppUntil.ResResult(200,true, {}, "Change password success"))
        }
        return res.status(500)
            .send(AppUntil.ResResult(200,true, {}))
    } catch (e){
        return res.status(500)
            .send(AppUntil.ResResult(200,true, {}))
    }
})

module.exports = router