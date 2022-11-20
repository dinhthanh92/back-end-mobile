const nodemailer = require("nodemailer");
const smtpTransport = require("nodemailer-smtp-transport");
const _ = require("lodash");

module.exports = class AppUntil {
    static ResResult = (statusCode,isSuccess, results, message = "Error sever 111") => {
        return {
            statusCode,isSuccess, results, message
        }
    }
    static ConvertTextVnToEn(text){
        let newStr = "";
        const AccentsMap = [
            "aàảãáạăằẳẵắặâầẩẫấậ",
            "AÀẢÃÁẠĂẰẲẴẮẶÂẦẨẪẤẬ",
            "dđ", "DĐ",
            "eèẻẽéẹêềểễếệ",
            "EÈẺẼÉẸÊỀỂỄẾỆ",
            "iìỉĩíị",
            "IÌỈĨÍỊ",
            "oòỏõóọôồổỗốộơờởỡớợ",
            "OÒỎÕÓỌÔỒỔỖỐỘƠỜỞỠỚỢ",
            "uùủũúụưừửữứự",
            "UÙỦŨÚỤƯỪỬỮỨỰ",
            "yỳỷỹýỵ",
            "YỲỶỸÝỴ"
        ];
        for (let i=0; i<AccentsMap.length; i++) {
            let re = new RegExp('[' + AccentsMap[i].substr(1) + ']', 'g');
            let char = AccentsMap[i][0];
            text = text.replace(re, char);
        }
        return text;
    }

    static SendEmail(email, subject, htmlString){
        let transport = nodemailer.createTransport(smtpTransport({
            service: 'gmail',
            auth: {
                user: 'managetaskproject@gmail.com', // my mail
                pass: 'bpkxhvbkhnmsdlwq'
            }
        }))
        let mailOption = {
            from: "managetaskproject@gmail.com",
            to: email,
            subject: subject,
            // text: text,
            html: htmlString
        }
        return {
            transport, mailOption
        }
    }

    static GeneratePassword(){
        const chars = "0123456789abcdefghijklmnopqrstuvwxyz!@#$%&ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const passwordLength = 12;
        let password = "";

        for (let i = 0; i <= passwordLength; i++) {
            let randomNumber = Math.floor(Math.random() * chars.length);
            password += chars.substring(randomNumber, randomNumber +1);
        }
        return password.trim();
    }

    static GetPriceValueType(type, results){
        const find = _.find(results, x=>x.type === type);
        return _.toNumber(find.value)
    }

}