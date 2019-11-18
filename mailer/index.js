const fs = require("fs");
const util = require("util");
const path = require("path");

const nodemailer = require("nodemailer");

var transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    auth: {
      type: process.env.NODEMAILER_TYPE,
      user: process.env.NODEMAILER_USER,
      clientId: process.env.NODEMAILER_CLIENT_ID,
      clientSecret: process.env.NODEMAILER_CLIENT_SECRET,
      refreshToken: process.env.NODEMAILER_REFRESH_TOKEN
    }
  });

module.exports = async ({ emails, text, mailDuringDevelopment  }) => {
    if(process.env.NODE_ENV === 'development' && !mailDuringDevelopment)
        return Promise.resolve("Not mailing in dev server...")

    const promises = emails.map(email => {
        let HelperOptions = {
            from: '<hcramer@nationaljournal.com>',
            to: email,
            subject: "Hearings",
            text: JSON.stringify(text, null, 2)
        };
        return transporter.sendMail(HelperOptions);
    });

    return Promise.all(promises);

};