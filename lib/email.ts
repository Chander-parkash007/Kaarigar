import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

export async function sendOTPEmail(to: string, otp: string, name: string): Promise<void> {
  await transporter.sendMail({
    from: `"KaariGar" <${process.env.EMAIL_USER}>`,
    to,
    subject: `${otp} — آپکا KaariGar تصدیقی کوڈ`,
    html: `
      <!DOCTYPE html>
      <html>
      <head><meta charset="UTF-8"></head>
      <body style="font-family: Arial, sans-serif; background: #f8f9fa; margin: 0; padding: 20px;">
        <div style="max-width: 500px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <div style="background: #1B3A6B; padding: 24px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">
              <span style="color: #FF6B00;">Kaari</span>Gar
            </h1>
            <p style="color: #93c5fd; margin: 4px 0 0; font-size: 14px;">آپکا بھروسہ مند کاریگر پلیٹ فارم</p>
          </div>

          <!-- Body -->
          <div style="padding: 32px 24px;">
            <h2 style="color: #1B3A6B; margin: 0 0 8px;">سلام ${name}! 👋</h2>
            <p style="color: #6b7280; margin: 0 0 24px; font-size: 15px;">
              آپکے KaariGar اکاؤنٹ کو تصدیق کرنے کے لیے یہ کوڈ استعمال کریں:
            </p>

            <!-- OTP Box -->
            <div style="background: #f0f9ff; border: 2px dashed #1B3A6B; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
              <p style="color: #6b7280; font-size: 13px; margin: 0 0 8px;">Your verification code</p>
              <div style="font-size: 40px; font-weight: bold; letter-spacing: 12px; color: #FF6B00;">${otp}</div>
              <p style="color: #9ca3af; font-size: 12px; margin: 8px 0 0;">⏰ Expires in 10 minutes</p>
            </div>

            <p style="color: #9ca3af; font-size: 13px; margin: 0;">
              اگر آپ نے یہ درخواست نہیں کی تو اس ای میل کو نظرانداز کریں۔<br>
              If you did not request this, please ignore this email.
            </p>
          </div>

          <!-- Footer -->
          <div style="background: #f8f9fa; padding: 16px 24px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">© 2026 KaariGar Pakistan 🇵🇰</p>
          </div>
        </div>
      </body>
      </html>
    `,
  })
}
