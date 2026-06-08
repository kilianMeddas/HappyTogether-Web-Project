/**
 * File: ForgottenPassword.js
 * Author: Kilian Meddas
 * Purpose: Handle password recovery using tokens and emails
 */

const express = require('express')
const { getDB } = require('../db/Connection')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const nodemailer = require('nodemailer')
const path = require('path')
const router = express.Router()

/**
 * Mail sender (Mailtrap)
 */
const sendResetEmail = async (email, token) => {
  const transporter = nodemailer.createTransport({
    host: 'sandbox.smtp.mailtrap.io',
    port: process.env.MAIL_PORT || 2525,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  })

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000'

  const resetLink = `${frontendUrl}/reset-password?token=${token}`

  const mailOptions = {
    from: '"HappyTogether" <noreply@happytogether.com>',
    to: email,
    subject: 'Reset your password - HappyTogether',
    html: `
        <div style="margin:0;padding:0;background:#f4f4f7;font-family:Arial,sans-serif;">
            <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
                <tr>
                    <td align="center">
                        <table width="520" cellpadding="0" cellspacing="0"
                            style="background:linear-gradient(160deg,#ff3300,#ff4d00,#ff6600);border-radius:24px;padding:30px;text-align:center;color:white;">

                            <!-- LOGO -->
                            <tr>
                                <td style="padding-bottom:20px;"><img src="cid:logo" width="100" style="display:block;margin:0 auto;border-radius:20px;background:white;padding:10px;"></td>
                            </tr>
                            <tr>
                                <td style="font-size:26px;font-weight:800;">
                                    Password Reset
                                </td>
                            </tr>
                            <tr>
                                <td style="font-size:15px;padding:15px 0;">
                                    You requested to reset your password.<br>
                                    Click below to continue.
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <a href="${resetLink}" 
                                    style="display:inline-block;padding:14px 28px;background:white;color:#2b00a8;font-weight:700;border-radius:999px;text-decoration:none;">
                                    Reset Password
                                    </a>
                                </td>
                            </tr>
                            <tr>
                                <td style="font-size:13px;padding-top:20px;">
                                    This link expires in 1 hour.
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </div>
        `,

    attachments: [
      {
        filename: 'HappyTogether.png',
        path: path.join(__dirname, '../public/images/HappyTogether.png'),
        cid: 'logo',
      },
    ],
  }

  return transporter.sendMail(mailOptions)
}

/**
 * POST /forgot-password
 */
router.post('/forgot-password', async (req, res, next) => {
  const { email } = req.body

  try {
    const db = getDB()
    const user = await db.collection('Roommates').findOne({ _id: email })

    const response = {
      success: true,
      message: 'If an account exists, a recovery email has been sent.',
    }

    if (!user) {
      return res.json(response)
    }

    const rawToken = crypto.randomBytes(32).toString('hex')

    const hashedToken = crypto
      .createHash('sha256')
      .update(rawToken)
      .digest('hex')

    const expires = Date.now() + 3600000

    await db.collection('Roommates').updateOne(
      { _id: email },
      {
        $set: {
          resetPasswordToken: hashedToken,
          resetPasswordExpires: expires,
        },
      },
    )

    await sendResetEmail(email, rawToken)

    res.json(response)
  } catch (err) {
    next(err)
  }
})

/**
 * POST /reset-confirm
 */
router.post('/reset-confirm', async (req, res, next) => {
  const { token, password } = req.body

  try {
    const db = getDB()

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex')

    const user = await db.collection('Roommates').findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    })

    if (!user) {
      return res.status(400).json({ message: 'Token invalid or expired.' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    await db.collection('Roommates').updateOne(
      { _id: user._id },
      {
        $set: { password: hashedPassword },
        $unset: {
          resetPasswordToken: '',
          resetPasswordExpires: '',
        },
      },
    )

    res.json({ success: true, message: 'Password updated successfully!' })
  } catch (err) {
    next(err)
  }
})

module.exports = router
