import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  try {
    const { name, email, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

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
            <h1 style="color: #ffffff; font-size: 22px; margin: 0; padding-top: 10px;">New Message from GeoInsights</h1>
          </div>
          
          <!-- MESSAGE CONTENT -->
          <div style="padding: 25px; color: #333;">
            <p style="margin: 0 0 12px; font-size: 16px;"><strong style="color: #004aad;">Name:</strong> ${name}</p>
            <p style="margin: 0 0 12px; font-size: 16px;"><strong style="color: #004aad;">Email:</strong> ${email}</p>
            <p style="margin: 0 0 8px; font-size: 16px; color: #004aad;"><strong>Message:</strong></p>
            <div style="background: #f4f8ff; padding: 15px; border-radius: 8px; font-size: 15px; line-height: 1.6;">
              ${message}
            </div>
          </div>

          <!-- FOOTER -->
          <div style="background: #004aad; text-align: center; padding: 15px; font-size: 13px; color: #ffffff;">
            This email was sent via the <strong>GeoInsights</strong> contact form.<br/>
            <span style="opacity: 0.8;">&copy; ${new Date().getFullYear()} GeoInsights. All rights reserved.</span>
          </div>

        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"GeoInsights" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_RECEIVER,
      subject: `GeoInsights — New message from ${name}`,
      text: `From: ${name} <${email}>\n\n${message}`,
      html: htmlContent,
    });

    return NextResponse.json({ success: true, message: "Message sent successfully!" });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
