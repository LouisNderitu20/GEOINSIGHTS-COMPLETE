import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateResetToken } from '@/lib/auth-utils';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return NextResponse.json(
        { message: 'If an account with that email exists, a reset link has been sent.' },
        { status: 200 }
      );
    }

    const resetToken = generateResetToken();
    const resetExpires = new Date(Date.now() + 3600000); 

    await prisma.user.update({
      where: { email },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpires: resetExpires
      }
    });

    const resetUrl = `${process.env.NEXTAUTH_URL || 'https://geoinsights.vercel.app'}/reset-password?token=${resetToken}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const htmlContent = `
      <div style="font-family: 'Segoe UI', sans-serif; background-color: #f4f6f9; padding: 20px;">
        <div style="max-width: 650px; margin: auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 20px rgba(0,0,0,0.08);">

          <div style="background: linear-gradient(90deg, #004aad, #009ffd); padding: 25px; text-align: center;">
            <div style="text-align: center;">
              <img src="https://geoinsights.vercel.app/logo.png" 
                  alt="GeoInsights Logo" 
                  style="max-width: 120px; margin-bottom: 10px; display: block; margin-left: auto; margin-right: auto; border: 0; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic;" 
                  width="120" 
                  height="auto" />
            </div>
            <h1 style="color: #ffffff; font-size: 22px; margin: 0; padding-top: 10px;">Password Reset Request</h1>
          </div>
          
          <div style="padding: 25px; color: #333;">
            <p style="font-size: 16px; margin-bottom: 20px;">Hello <strong>${user.name}</strong>,</p>
            <p style="font-size: 16px; margin-bottom: 20px;">You requested to reset your password for your GeoInsights account. Click the button below to create a new password:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="display: inline-block; padding: 14px 32px; background: linear-gradient(90deg, #004aad, #009ffd); color: white; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600;">
                Reset Your Password
              </a>
            </div>

            <p style="font-size: 14px; color: #666; margin-bottom: 20px;">
              This link will expire in <strong>1 hour</strong>. If you didn't request this reset, please ignore this email.
            </p>

            <div style="background: #f4f8ff; padding: 15px; border-radius: 8px; margin-top: 20px;">
              <p style="font-size: 13px; color: #666; margin: 0;">
                <strong>Having trouble?</strong> Copy and paste this link into your browser:<br>
                <a href="${resetUrl}" style="color: #004aad; word-break: break-all;">${resetUrl}</a>
              </p>
            </div>
          </div>

          <div style="background: #004aad; text-align: center; padding: 15px; font-size: 13px; color: #ffffff;">
            This email was sent for password reset request at <strong>GeoInsights</strong>.<br/>
            <span style="opacity: 0.8;">&copy; ${new Date().getFullYear()} GeoInsights. All rights reserved.</span>
          </div>

        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"GeoInsights" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Reset Your Password - GeoInsights',
      html: htmlContent,
    });

    return NextResponse.json(
      { 
        message: 'If an account with that email exists, a reset link has been sent.' 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}