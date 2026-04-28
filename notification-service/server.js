const express = require('express');
const nodemailer = require('nodemailer');
const twilio = require('twilio');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // Use STARTTLS (not SSL). Required for Gmail App Passwords on port 587.
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false // Allows self-signed certs in dev/corp environments
    }
});

const twilioEnabled = Boolean(
  process.env.TWILIO_ACCOUNT_SID &&
  process.env.TWILIO_AUTH_TOKEN &&
  process.env.TWILIO_PHONE_NUMBER
);

const twilioClient = twilioEnabled
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

const textlkEnabled = Boolean(
  process.env.TEXTLK_API_TOKEN &&
  process.env.TEXTLK_SENDER_ID
);

const smsProvider = (process.env.SMS_PROVIDER || 'TEXT_LK').toUpperCase();

const normalizePhoneNumber = (value = '') => {
  const trimmed = String(value).trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('+')) return trimmed;
  return `+${trimmed}`;
};

const sendEmail = (to, subject, message) => new Promise((resolve, reject) => {
  const mailOptions = {
    from: `"${process.env.SITE_NAME} Support" <${process.env.EMAIL_USER}>`,
    to,
    subject: `[${process.env.SITE_NAME}] ${subject}`,
    text: message
  };

  transporter.sendMail(mailOptions, (error) => {
    if (error) return reject(error);
    resolve();
  });
});

const sendSms = async (to, message) => {
  const normalizedTo = normalizePhoneNumber(to);
  if (!normalizedTo) {
    throw new Error('Missing phone number');
  }

  if (smsProvider === 'TEXT_LK') {
    if (!textlkEnabled) {
      throw new Error('TEXT_LK SMS provider not configured');
    }

    // text.lk expects recipient like 9477XXXXXXX (no plus sign)
    const recipient = normalizedTo.replace('+', '');
    const response = await fetch('https://app.text.lk/api/v3/sms/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.TEXTLK_API_TOKEN}`,
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify({
        recipient,
        sender_id: process.env.TEXTLK_SENDER_ID,
        type: 'plain',
        message
      })
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data?.message || `Text.lk SMS failed with status ${response.status}`);
    }
    return data;
  }

  if (smsProvider === 'TWILIO') {
    if (!twilioEnabled || !twilioClient) {
      throw new Error('TWILIO SMS provider not configured');
    }

    return twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: normalizedTo
    });
  }

  throw new Error(`Unsupported SMS provider: ${smsProvider}`);
};

app.post('/api/notifications/send-email', async (req, res) => {
    const { to, subject, message } = req.body;

  try {
    await sendEmail(to, subject, message);
    res.status(200).json({ success: true, message: 'Email sent successfully!' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/notifications/send-sms', async (req, res) => {
  const { to, message } = req.body;

  try {
    await sendSms(to, message);
    res.status(200).json({ success: true, message: 'SMS sent successfully!' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/notifications/send-email-and-sms', async (req, res) => {
  const { toEmail, toPhone, subject, message } = req.body;
  const results = {
    email: { success: false, skipped: false, error: null },
    sms: { success: false, skipped: false, error: null }
  };

  if (toEmail) {
    try {
      await sendEmail(toEmail, subject, message);
      results.email.success = true;
    } catch (error) {
      results.email.error = error.message;
    }
  } else {
    results.email.skipped = true;
  }

  if (toPhone) {
    try {
      await sendSms(toPhone, message);
      results.sms.success = true;
    } catch (error) {
      results.sms.error = error.message;
    }
  } else {
    results.sms.skipped = true;
  }

  const hasSuccess = results.email.success || results.sms.success;
  res.status(hasSuccess ? 200 : 500).json({
    success: hasSuccess,
    smsConfigured: smsProvider === 'TEXT_LK' ? textlkEnabled : twilioEnabled,
    smsProvider,
    results
  });
});

const PORT = process.env.PORT || 5008;
app.listen(PORT, () => console.log(`HealthCare Notification Service running on port ${PORT}`));