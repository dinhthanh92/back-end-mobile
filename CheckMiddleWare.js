const jwt = require('jsonwebtoken')
const User = require('./module/UserSchema')
const AppUntil = require("./AppUntil");
const argon2 = require("argon2");
module.exports = CheckMiddleWare = async (req, res, next)  => {
    const accessToken = req.headers?.bearer;

    // const newPassword = await argon2.hash("admin");
    // await User.updateOne({_id: "632691b916150721002f3920"}, {$set: {password: newPassword}})

    if(accessToken){
        const str = JSON.parse(Buffer.from(accessToken.split('.')[1], 'base64').toString());

        try {
            if(str.exp && ( Date.now() < (str.exp * 1000))){
                const user = await User.findOne({_id: str?._id ||"" })
                if(user && user.status && !user.isFirst){
                    req.currentUser = str
                }
                next()
            } else {
                return res?.status(500)
                    .send(AppUntil.ResResult(500, false, {}, "Please login" ))
            }
        } catch(e)
        {
            return res?.status(500)
                .send(AppUntil.ResResult(500, false, {}, "Please login" ))
        }
    } else {
        return res?.status(500)
            .send(AppUntil.ResResult(400, false, {} ))
    }
};