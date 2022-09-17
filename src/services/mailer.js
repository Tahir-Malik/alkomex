const nodeMailer = require('nodemailer');
const process = require('process');


module.exports.send = async (receiver, mailSubject, body, attachments) => {
  try {
    const transporter = nodeMailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.AUTHEMAIL,
        pass: process.env.AUTHPASSWORD,
      },
    });
    const mailOptions = {
      from: { name: 'ALKOMEX', address: process.env.AUTHEMAIL },
      to: receiver,
      subject: mailSubject,
      attachments: attachments ? attachments : '',
      html: body,
    };
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        return Promise.reject(err);
      }
      return Promise.resolve();
    });
  } catch (err) {
    return Promise.reject(err);
  }
}

