import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Create Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(
  supabaseUrl || '',
  supabaseServiceKey || ''
);

export async function POST(request: NextRequest) {
  try {
    // Check if Resend is configured
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { error: 'Resend API key not configured' },
        { status: 500 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { subject, content, htmlContent } = body;

    // Validate input
    if (!subject || !content) {
      return NextResponse.json(
        { error: 'Subject and content are required' },
        { status: 400 }
      );
    }

    console.log('📧 ===== NEWSLETTER SEND REQUEST =====');
    console.log('Subject:', subject);
    console.log('Content length:', content.length);

    // Get all active subscribers
    const { data: subscribers, error: dbError } = await supabase
      .from('newsletter_subscribers')
      .select('email, id')
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

    console.log('📊 Found', subscribers.length, 'active subscribers');
    console.log('📋 Emails:', subscribers.map(s => s.email).join(', '));

    // Send emails one by one with detailed logging
    const results = [];
    let sentCount = 0;
    let errorCount = 0;

    for (const subscriber of subscribers) {
      try {
        console.log(`\n📤 Sending to: ${subscriber.email}`);
        
        const result = await resend.emails.send({
          from: 'KYRS Newsletter <onboarding@resend.dev>',
          to: subscriber.email,
          subject: subject,
          html: htmlContent || `<div style="font-family: Arial, sans-serif; padding: 20px;"><p>${content.replace(/\n/g, '<br>')}</p></div>`,
        });

        if (result.error) {
          throw new Error(result.error.message);
        }

        console.log(`✅ SUCCESS for ${subscriber.email}:`, result);
        sentCount++;
        results.push({
          email: subscriber.email,
          status: 'success',
          id: result.data?.id
        });

        // Small delay between emails to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error: any) {
        console.error(`❌ FAILED for ${subscriber.email}:`, error);
        errorCount++;
        results.push({
          email: subscriber.email,
          status: 'failed',
          error: error.message
        });
      }
    }

    console.log('\n📊 ===== SEND SUMMARY =====');
    console.log('Total subscribers:', subscribers.length);
    console.log('Sent successfully:', sentCount);
    console.log('Failed:', errorCount);
    console.log('Results:', results);

    return NextResponse.json({
      success: true,
      sent: sentCount,
      failed: errorCount,
      total: subscribers.length,
      details: results
    });

  } catch (error: any) {
    console.error('❌ Newsletter send error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to send newsletter: ' + error.message,
        details: error.toString()
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: 'ok',
    message: 'Newsletter API is running',
    resendConfigured: !!process.env.RESEND_API_KEY,
    supabaseConfigured: !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
  });
}