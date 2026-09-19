const crypto = require('crypto');
const nodemailer = require('nodemailer');
const PasswordReset = require('../models/PasswordReset');

const isEmailConfigured = () => {
  return Boolean(
    process.env.EMAIL_HOST &&
    process.env.EMAIL_USER &&
    process.env.EMAIL_PASS &&
    process.env.EMAIL_USER !== 'your-email@gmail.com' &&
    process.env.EMAIL_PASS !== 'your-app-password-here'
  );
};

const createEmailTransporter = () => {
  if (isEmailConfigured()) {
    console.log('✅ Using configured email service:', process.env.EMAIL_HOST);
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT, 10) || 587,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      tls: {
        rejectUnauthorized: false
      }
    });
  }

  console.warn('⚠️  EMAIL NOT CONFIGURED: Emails will be logged to console only.');
  console.warn('⚠️  To enable email functionality:');
  console.warn('   1. Update .env file with your email credentials');
  console.warn('   2. For Gmail: Enable 2FA and generate an App Password');
  console.warn('   3. Restart the server');

  return {
    sendMail: async (mailOptions) => {
      console.log('\n' + '='.repeat(80));
      console.log('📧 EMAIL WOULD BE SENT (Not actually sent - email not configured)');
      console.log('='.repeat(80));
      console.log('To:', mailOptions.to);
      console.log('From:', mailOptions.from);
      console.log('Subject:', mailOptions.subject);
      console.log('\nMessage Preview:');
      console.log('-'.repeat(80));
      const urlMatch = mailOptions.html && mailOptions.html.match(/href="([^"]+)"/);
      if (urlMatch) {
        console.log('Invite/Reset URL:', urlMatch[1]);
      }
      console.log('-'.repeat(80));
      console.log('Full HTML:', (mailOptions.html || '').substring(0, 500) + '...');
      console.log('='.repeat(80) + '\n');
      return { messageId: 'dev-email-' + Date.now() };
    }
  };
};

const wrapEmail = (title, bodyHtml) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background-color: #1B4332; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
      <h1 style="color: white; margin: 0;">OCMS</h1>
      <p style="color: #F59E0B; margin: 5px 0;">Organic Coffee Management System</p>
    </div>
    <div style="background-color: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
      <h2 style="color: #1B4332; margin-top: 0;">${title}</h2>
      ${bodyHtml}
    </div>
    <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
      <p>© ${new Date().getFullYear()} OCMS. All rights reserved.</p>
    </div>
  </div>
`;

const actionButton = (url, label) => `
  <div style="text-align: center; margin: 30px 0;">
    <a href="${url}"
       style="background-color: #1B4332; color: white; padding: 15px 40px;
              text-decoration: none; border-radius: 8px; display: inline-block;
              font-weight: bold; font-size: 16px;">
      ${label}
    </a>
  </div>
  <p>Or copy and paste this link into your browser:</p>
  <p style="word-break: break-all; color: #666; background-color: #e9e9e9; padding: 10px; border-radius: 5px; font-family: monospace; font-size: 12px;">${url}</p>
`;

const frontendBaseUrl = () => process.env.FRONTEND_URL || 'http://localhost:5173';

const createPasswordToken = async (userId, expiresInMs) => {
  const rawToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

  await PasswordReset.deleteMany({ userId });
  await PasswordReset.create({
    userId,
    token: hashedToken,
    expiresAt: new Date(Date.now() + expiresInMs)
  });

  return rawToken;
};

const sendMail = async ({ to, subject, html }) => {
  const transporter = createEmailTransporter();
  const from = process.env.EMAIL_FROM || 'OCMS <noreply@ocms.com>';
  await transporter.sendMail({ from, to, subject, html });
  return isEmailConfigured();
};

const sendPasswordResetEmail = async (user, resetUrl) => {
  const html = wrapEmail('Password Reset Request', `
    <p>Hello <strong>${user.name || user.username}</strong>,</p>
    <p>You requested to reset your password for your OCMS account.</p>
    <p>Click the button below to reset your password:</p>
    ${actionButton(resetUrl, 'Reset Password')}
    <div style="background-color: #fff3cd; border-left: 4px solid #F59E0B; padding: 15px; margin-top: 30px; border-radius: 5px;">
      <p style="margin: 0; color: #856404; font-size: 14px;">
        <strong>Important:</strong> This link will expire in 1 hour.<br>
        If you didn't request this, please ignore this email and your password will remain unchanged.
      </p>
    </div>
  `);

  console.log(`📧 Attempting to send password reset email to: ${user.email}`);
  try {
    const emailSent = await sendMail({
      to: user.email,
      subject: 'Password Reset Request - OCMS',
      html
    });
    console.log('✅ Password reset email processed');
    return emailSent;
  } catch (emailError) {
    console.error('❌ Failed to send email:', emailError.message);
    console.error('Email error details:', {
      code: emailError.code,
      command: emailError.command,
      response: emailError.response
    });
    return false;
  }
};

const sendInviteEmail = async (user, inviteUrl) => {
  const roleLabel = user.role === 'admin' ? 'Administrator' : 'Field Agent';
  const regionLine = user.assignedRegion
    ? `<p>Assigned region: <strong>${user.assignedRegion}</strong></p>`
    : '';

  const html = wrapEmail('You have been invited to OCMS', `
    <p>Hello <strong>${user.name || user.username}</strong>,</p>
    <p>An administrator created an OCMS account for you as a <strong>${roleLabel}</strong>.</p>
    <p>Your username is <strong>${user.username}</strong>.</p>
    ${regionLine}
    <p>Set your password using the button below, then sign in at the login page.</p>
    ${actionButton(inviteUrl, 'Set your password')}
    <div style="background-color: #fff3cd; border-left: 4px solid #F59E0B; padding: 15px; margin-top: 30px; border-radius: 5px;">
      <p style="margin: 0; color: #856404; font-size: 14px;">
        <strong>Important:</strong> This invite link expires in 24 hours.
      </p>
    </div>
  `);

  console.log(`📧 Attempting to send invite email to: ${user.email}`);
  try {
    const emailSent = await sendMail({
      to: user.email,
      subject: 'You have been invited to OCMS',
      html
    });
    console.log('✅ Invite email processed');
    return emailSent;
  } catch (emailError) {
    console.error('❌ Failed to send invite email:', emailError.message);
    return false;
  }
};

const issuePasswordResetLink = async (user, { hours = 1, invite = false } = {}) => {
  const rawToken = await createPasswordToken(user._id, hours * 60 * 60 * 1000);
  const query = invite ? `token=${rawToken}&invite=1` : `token=${rawToken}`;
  const url = `${frontendBaseUrl()}/reset-password?${query}`;
  const emailSent = invite
    ? await sendInviteEmail(user, url)
    : await sendPasswordResetEmail(user, url);
  return { url, emailSent };
};

module.exports = {
  isEmailConfigured,
  createEmailTransporter,
  issuePasswordResetLink,
  sendPasswordResetEmail,
  sendInviteEmail
};
