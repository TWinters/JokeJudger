/*global require,exports, console,process*/
var nodemailer  = require('nodemailer');

var smtpConfig = {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || 587,
        secure: false, // use SSL
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD
        },
        rejectUnauthorized: false
    },
    transporter = nodemailer.createTransport(smtpConfig),
    sendMail = function(toMail, subject, message, attachments) {
        'use strict';
        // setup e-mail data with unicode symbols
        var mailOptions = {
            from: '"JokeJudger" <'+process.env.SMTP_SENDER_MAIL+'>',
            to: toMail,
            subject: subject,
            text: message // plaintext body
            // html: '<b>Hello world</b>'+newPassword // html body
        };

        if (attachments) {            
            mailOptions.attachments = attachments;
        }


        transporter.sendMail(mailOptions, function(error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Message sent: ' + message, info);
            }
        });

    }; 

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

exports.sendForgotPasswordMail = function (user, newPassword) {
    'use strict';
    sendMail(
        user.mail,
        'Password forgotten', 
        'Hi!'
            + '\nWe\'ve just received a request to change your password on '+process.env.WEBSITE_URL+
            '\n\nLogin: '+user.mail
            +'\nNew password: '+newPassword
            +'\n\n\nDon\'t forget to change your password to something more rememberable!\n\n'
            +'Kind regards,\n\nJokeJudger admin'
            );
};


exports.sendUserRequestMail = function (user) {
    'use strict';
    sendMail(
        user.mail,
        'Account created', 
        'Hi '+user.mail+'!'
            + '\n\nYou\'ve just created a new account on '+process.env.WEBSITE_URL+'!'
            + '\nHave fun rating and creating jokes!'
            + '\n\nKind regards,'
            + '\n\nJokeJudger admin'
            );

};


