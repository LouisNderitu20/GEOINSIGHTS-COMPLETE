import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword } from '@/lib/auth-utils';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: {
          gt: new Date() 
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    const hashedPassword = hashPassword(password);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null
      }
    });

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

          <!-- HEADER -->
          <div style="background: linear-gradient(90deg, #004aad, #009ffd); padding: 25px; text-align: center;">
            <div style="text-align: center;">
              <img src="https://geoinsights.vercel.app/logo.png" 
                  alt="GeoInsights Logo" 
                  style="max-width: 120px; margin-bottom: 10px; display: block; margin-left: auto; margin-right: auto; border: 0; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic;" 
                  width="120" 
                  height="auto" />
            </div>
            <h1 style="color: #ffffff; font-size: 22px; margin: 0; padding-top: 10px;">Password Reset Successful</h1>
          </div>
          
          <!-- MESSAGE CONTENT -->
          <div style="padding: 25px; color: #333;">
            <p style="font-size: 16px; margin-bottom: 20px;">Hello <strong>${user.name}</strong>,</p>
            <p style="font-size: 16px; margin-bottom: 20px;">Your GeoInsights password has been successfully reset.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <div style="display: inline-block; padding: 14px 32px; background: #10b981; color: white; border-radius: 8px; font-size: 16px; font-weight: 600;">
              Password Updated Successfully
              </div>
            </div>

            <p style="font-size: 14px; color: #666; margin-bottom: 20px;">
              If you did not make this change, please contact our support team immediately.
            </p>

            <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin-top: 20px; border-left: 4px solid #004aad;">
              <p style="font-size: 14px; color: #666; margin: 0;">
                <strong>Security Tip:</strong> For your security, we recommend using a unique password that you don't use for other services.
              </p>
            </div>
          </div>

          <!-- FOOTER -->
          <div style="background: #004aad; text-align: center; padding: 15px; font-size: 13px; color: #ffffff;">
            This email confirms your password change at <strong>GeoInsights</strong>.<br/>
            <span style="opacity: 0.8;">&copy; ${new Date().getFullYear()} GeoInsights. All rights reserved.</span>
          </div>

        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"GeoInsights" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Password Reset Successful - GeoInsights',
      html: htmlContent,
    });

    return NextResponse.json(
      { message: 'Password has been reset successfully' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}