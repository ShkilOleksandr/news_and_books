import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { name, email, subject, message } = await req.json();

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Send to your contact inbox
    const result = await resend.emails.send({
      from: 'Contact Form <contact@romaofukraine.com>',
      to: 'romanewsukraine@gmail.com', // admin inbox
      subject: `New Contact Message: ${subject}`,
      html: `
        <div style="font-family: Arial; padding:20px;">
          <h2>New Contact Form Message</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Message:</strong><br>${message.replace(/\n/g, "<br>")}</p>
        </div>
      `,
    });

    if (result.error) {
      throw new Error(result.error.message);
    }

    return NextResponse.json({ success: true });

  } catch (err: any) {
    console.error('Contact form error:', err.message);
    return NextResponse.json(
      { error: err.message || 'Server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    resendConfigured: !!process.env.RESEND_API_KEY
  });
}
