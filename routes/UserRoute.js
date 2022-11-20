const express = require("express");
const UserSchema = require("../module/UserSchema");
const TripSchema = require("../module/TripSchema");
const DestinationSchema = require("../module/DestinationSchema");
const _ = require("lodash");
const AppUntil = require("../AppUntil");
const argon2 = require("argon2");
const router = express.Router();


router.delete("/delete/:id", async (req, res) => {
    try {
        if (req.currentUser.type !== "ADMIN") {
            return res.status(500)
                .send(AppUntil.ResResult(500, false, {}, "Dont permission"))
        }
        let user = await UserSchema.findOne({ _id: req.params.id });
        if (user && user.type !== "ADMIN") {
            await UserSchema.deleteOne({ _id: user._id })
            const trips = await TripSchema.find({ createBy: req.params.id })
            const ArrayTripId = _.map(trips, x => {
                return x._id.toString()
            })
            await TripSchema.deleteMany({ createBy: req.params.id })
            await DestinationSchema.deleteMany({ tripId: { $in: ArrayTripId } })
            return res.status(200)
                .send(AppUntil.ResResult(200, true, {}, "Delete user success"))
        }
    } catch (e) {
        console.log(e)
        return res.status(500)
            .send(AppUntil.ResResult(400, false, []))
    }
})

router.get("/index", async (req, res) => {
    try {
        let users = await UserSchema.find({ type: "STAFF" });

        const result = _.map(users, x => {
            return {
                username: x.username,
                email: x.email,
                status: x.status,
                _id: x._id
            }
        })

        return res.status(200)
            .send(AppUntil.ResResult(200, true, result, "Get data success"))
    } catch (e) {
        console.log(e)
        return res.status(500)
            .send(AppUntil.ResResult(400, false, []))
    }
})

router.post("/change-password", async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    try {
        const userId = req.currentUser._id.toString();
        const findUser = await UserSchema.findOne({ _id: userId })
        if (findUser) {
            const verifyPassword = await argon2.verify(findUser.password, oldPassword)
            if (!verifyPassword) {
                return res.status(201)
                    .send(AppUntil.ResResult(400, false, {}, "Old password not match!"))
            } else {
                const password = await argon2.hash(newPassword);
                await UserSchema.updateOne({ _id: userId }, { $set: { password, isFirst: true } })
            }
        }
    } catch (e) {
        console.log(e)
        return res.status(500)
            .send(AppUntil.ResResult(400, false, []))
    }

})

router.post("/reset-password/:userId", async (req, res) => {
    try {
        const user = await UserSchema.findOne({ _id: req.currentUser._id });
        if (user && user.type == "ADMIN") {
            const password = AppUntil.GeneratePassword();

            const hashPassword = await argon2.hash(password)
            const findUser = await UserSchema.findOne({ _id: req.params.userId })

            await UserSchema.updateOne({ _id: req.params.userId }, { $set: { password: hashPassword, isFirst: true } })

            const sendMail = AppUntil.SendEmail(
                findUser.email,
                "Reset password destination app",
                `</div>
                            <div>
                                New Password: 
                                <h3>${password}</h3>
                            </div>
                        </div>
                        `
            )

            await sendMail.transport.sendMail(sendMail.mailOption, function (err, success) {
                if (err) {
                    return res.status(201)
                        .send(AppUntil.ResResult(202, true, {}, "Send email fail"))
                } else {
                    return res.status(200)
                        .send(AppUntil.ResResult(200, true, {}, "Reset password success"))
                }
            })
        }
    } catch (e) {
        console.log(e)
        return res.status(500)
            .send(AppUntil.ResResult(400, false, []))
    }

})

router.post("/create", async (req, res) => {
    const { username, email } = req.body;
    try {
        const findUserByEmail = await UserSchema.findOne({ email })
        if (findUserByEmail) {
            return res.status(201)
                .send(AppUntil.ResResult(201, false, {}, "Email is existed!"))
        }
        const findUserByUserName = await UserSchema.findOne({ username })
        if (findUserByUserName) {
            return res.status(201)
                .send(AppUntil.ResResult(201, false, {}, "Username is existed!"))
        }

        const password = AppUntil.GeneratePassword();

        const hashPassword = await argon2.hash(password)

        const newUser = new UserSchema({ username, email, password: hashPassword })

        await newUser.save();

        const sendMail = AppUntil.SendEmail(
            email,
            "Account destination app",
            `<div>
                        <div>
                            Username: 
                            <h3>${username}</h3>
                        </div>
                            <div>
                                Password: 
                                <h3>${password}</h3>
                            </div>
                        </div>`
        )

        await sendMail.transport.sendMail(sendMail.mailOption, function (err, success) {
            if (err) {
                return res.status(202)
                    .send(AppUntil.ResResult(202, true, {}, "Send email fail"))
            } else {
                return res.status(200)
                    .send(AppUntil.ResResult(200, true, {}, "Create user success"))
            }
        })


    } catch (e) {
        console.log(e)
        return res.status(500)
            .send(AppUntil.ResResult(400, false, []))
    }

})

module.exports = router