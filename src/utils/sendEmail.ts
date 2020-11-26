import nodemailer from 'nodemailer';

export async function sendEmail(to: string, html: string) {
  let testAccount = await nodemailer.createTestAccount();
  console.log('testAccount', testAccount)

  let transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: 'sjgmtvbpl4cmzteh@ethereal.email',
      pass: 'BnDD8ZEWtn5UAr5h8V',
    },
  });

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: '"Fred Foo 👻" <foo@example.com>',
    to,
    subject: "Change password",
    html,
  });

  console.log("Message sent: %s", info.messageId);
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
}