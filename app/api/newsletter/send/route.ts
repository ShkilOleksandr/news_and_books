import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Create Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
}

const supabase = createClient(
  supabaseUrl || '',
  supabaseServiceKey || ''
);

export async function POST(request: NextRequest) {
  try {
    // Check if Resend is configured
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { error: 'Resend API key not configured. Please add RESEND_API_KEY to .env.local' },
        { status: 500 }
      );
    }

    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const { subject, content, htmlContent } = body;

    // Validate input
    if (!subject || !content) {
      return NextResponse.json(
        { error: 'Subject and content are required' },
        { status: 400 }
      );
    }

    // Get all active subscribers
    const { data: subscribers, error: dbError } = await supabase
      .from('newsletter_subscribers')
      .select('email')
      .eq('is_active', true);

    if (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Failed to fetch subscribers: ' + dbError.message },
        { status: 500 }
      );
    }

    if (!subscribers || subscribers.length === 0) {
      return NextResponse.json(
        { error: 'No active subscribers found' },
        { status: 400 }
      );
    }

    // Send emails in batches
    const batchSize = 50; // Reduced batch size for safety
    let sentCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    for (let i = 0; i < subscribers.length; i += batchSize) {
      const batch = subscribers.slice(i, i + batchSize);

      const emailPromises = batch.map(async (subscriber) => {
        try {
          await resend.emails.send({
            from: 'KYRS Newsletter <onboarding@resend.dev>', // Default Resend email
            to: subscriber.email,
            subject: subject,
            html: htmlContent || `<div style="font-family: Arial, sans-serif;"><p>${content.replace(/\n/g, '<br>')}</p></div>`,
          });
          sentCount++;
        } catch (error: any) {
          console.error(`Failed to send to ${subscriber.email}:`, error);
          errorCount++;
          errors.push(`${subscriber.email}: ${error.message}`);
        }
      });

      await Promise.all(emailPromises);

      // Wait between batches to avoid rate limits
      if (i + batchSize < subscribers.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return NextResponse.json({
      success: true,
      sent: sentCount,
      failed: errorCount,
      total: subscribers.length,
      errors: errors.length > 0 ? errors.slice(0, 5) : undefined // Only return first 5 errors
    });

  } catch (error: any) {
    console.error('Newsletter send error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to send newsletter: ' + error.message,
        details: error.toString()
      },
      { status: 500 }
    );
  }
}

// Add OPTIONS handler for CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}