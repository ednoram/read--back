import { createTransport } from "nodemailer";

import { MAIL_SENDER_EMAIL, MAIL_SENDER_PASS } from "@config";

const mailTransporter = createTransport({
  service: "yahoo",
  host: "smtp.mail.yahoo.com",
  port: 465,
  secure: false,
  auth: {
    user: MAIL_SENDER_EMAIL,
    pass: MAIL_SENDER_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

export default mailTransporter;
