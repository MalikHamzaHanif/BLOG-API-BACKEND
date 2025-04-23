// const nodemailer = require("nodemailer")

const Mailjet = require('node-mailjet')
const mailjet = Mailjet.apiConnect(
  process.env.MJ_APIKEY_PUBLIC,
  process.env.MJ_APIKEY_PRIVATE
)



const sendEmail = async (email, subject, text) => {
  // const transport = nodemailer.createTransport({
  //     host: process.env.HOST,
  //     // service: process.env.SERVICE,
  //     port: Number(process.env.MAIL_PORT),
  //     secure: Boolean(process.env.SECURE),
  //     auth: {
  //         user: process.env.USER_EMAIL,
  //         pass: process.env.USER_PASSWORD
  //     },
  //     tls: {
  //         rejectUnauthorized: false  
  //     }
  // })

  // await transport.sendMail({
  //     from: process.env.USER_EMAIL,
  //     to: email,
  //     subject,
  //     text
  // })

  await mailjet.post('send', { version: 'v3.1' }).request({
    Messages: [
      {
        From: {
          Email: process.env.SENDER_MAIL,
          Name: 'desi blogs',
        },
        To: [
          {
            Email: email,
            Name: 'You',
          },
        ],
        Subject: subject,
        TextPart: 'Please verify your account.',
        HTMLPart:
          `<a href="${text}">Click here to verify your account</a>`,
      },
    ],
  })
}

module.exports = sendEmail