import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Create Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// ========= CONFIGURATION =========
const BATCH_SIZE = 50;         // Emails per batch
const BATCH_DELAY = 3000;      // Delay between batches (ms)
const RETRY_LIMIT = 5;         // Retry attempts per email
const RETRY_BACKOFF = 1000;    // Backoff time per retry (ms)
// =================================

// Helper: retry logic for a single email
async function sendEmailWithRetry(
  subscriber: any,
  subject: string,
  content: string,
  htmlContent?: string
) {
  let attempt = 0;

  while (attempt < RETRY_LIMIT) {
    try {
      const response = await resend.emails.send({
        from: 'KYRS Newsletter <newsletter@romaofukraine.com>',
        to: subscriber.email,
        subject,
        html:
          htmlContent ||
          `<div style="font-family: Arial; padding:20px;">
             <p>${content.replace(/\n/g, '<br>')}</p>
           </div>`,
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      return { success: true, id: response.data?.id };
    } catch (err: any) {
      attempt++;
      console.log(
        `⚠️ Retry ${attempt}/${RETRY_LIMIT} for ${subscriber.email}: ${err.message}`
      );

      // If email is invalid or permanently rejected — don't retry
      if (
        err.message.includes('invalid') ||
        err.message.includes('recipient') ||
        err.message.includes('blocked')
      ) {
        return { success: false, error: err.message };
      }

      // Wait before retrying (exponential backoff)
      await new Promise((resolve) =>
        setTimeout(resolve, RETRY_BACKOFF * attempt)
      );
    }
  }

  return { success: false, error: 'Max retries reached' };
}

export async function POST(request: NextRequest) {
  try {
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { error: 'Resend API key not configured' },
        { status: 500 }
      );
    }

    // Parse request
    const body = await request.json();
    const { subject, content, htmlContent } = body;

    if (!subject || !content) {
      return NextResponse.json(
        { error: 'Subject and content are required' },
        { status: 400 }
      );
    }

    console.log('📧 NEWSLETTER SEND REQUEST RECEIVED');
    console.log('Subject:', subject);

    // Fetch subscribers
    const { data: subscribers, error: dbError } = await supabase
      .from('newsletter_subscribers')
      .select('email')
      .eq('is_active', true);

    if (dbError) throw new Error('Database error: ' + dbError.message);

    if (!subscribers || subscribers.length === 0) {
      return NextResponse.json(
        { error: 'No active subscribers found' },
        { status: 400 }
      );
    }

    console.log(`📊 Total active subscribers: ${subscribers.length}`);

    // Batching setup
    const totalBatches = Math.ceil(subscribers.length / BATCH_SIZE);
    console.log(`📦 Sending in ${totalBatches} batches...`);

    const results: any[] = [];
    let sentCount = 0;
    let errorCount = 0;

    // Send batches
    for (let i = 0; i < subscribers.length; i += BATCH_SIZE) {
      const batch = subscribers.slice(i, i + BATCH_SIZE);
      const batchNum = Math.floor(i / BATCH_SIZE) + 1;

      console.log(`\n🚀 Sending batch ${batchNum}/${totalBatches} (${batch.length} recipients)`);

      // Send entire batch in parallel
      const batchResults = await Promise.all(
        batch.map(async (subscriber) => {
          const res = await sendEmailWithRetry(
            subscriber,
            subject,
            content,
            htmlContent
          );

          if (res.success) {
            console.log(`   ✅ Sent to ${subscriber.email}`);
            sentCount++;
            return { email: subscriber.email, status: 'success', id: res.id };
          } else {
            console.log(`   ❌ Failed for ${subscriber.email}: ${res.error}`);
            errorCount++;
            return {
              email: subscriber.email,
              status: 'failed',
              error: res.error,
            };
          }
        })
      );

      results.push(...batchResults);

      // Delay before next batch
      if (batchNum < totalBatches) {
        console.log(`⏳ Waiting ${BATCH_DELAY / 1000}s before next batch...`);
        await new Promise((resolve) =>
          setTimeout(resolve, BATCH_DELAY)
        );
      }
    }

    // Summary
    console.log('\n📊 ===== SEND SUMMARY =====');
    console.log(`Total: ${subscribers.length}`);
    console.log(`Sent successfully: ${sentCount}`);
    console.log(`Failed: ${errorCount}`);

    return NextResponse.json({
      success: true,
      total: subscribers.length,
      sent: sentCount,
      failed: errorCount,
      details: results
    });

  } catch (error: any) {
    console.error('❌ Newsletter error:', error);
    return NextResponse.json(
      { error: 'Failed to send newsletter: ' + error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    resendConfigured: !!process.env.RESEND_API_KEY,
    supabaseConfigured:
      !!(process.env.NEXT_PUBLIC_SUPABASE_URL &&
         process.env.SUPABASE_SERVICE_ROLE_KEY),
  });
}
