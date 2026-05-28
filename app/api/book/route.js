import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      salon_id,
      customer_name,
      customer_phone,
      service_id,
      stylist_id,
      booking_date,
      booking_time,
      notes
    } = body;

    // 1. Client input validation
    if (!salon_id || !customer_name || !customer_phone || !service_id || !stylist_id || !booking_date || !booking_time) {
      return NextResponse.json(
        { success: false, message: "Missing required booking details." },
        { status: 400 }
      );
    }

    // 2. Insert booking record in the Supabase database
    const { data: booking, error: dbError } = await supabase
      .from('bookings')
      .insert({
        salon_id,
        customer_name,
        customer_phone,
        service_id,
        stylist_id,
        booking_date,
        booking_time,
        notes: notes || null
      })
      .select()
      .single();

    if (dbError) {
      console.error("Supabase Database Insert Error:", dbError);
      throw dbError;
    }

    // 3. Fetch Salon owner's Telegram configuration credentials
    const { data: salon, error: salonError } = await supabase
      .from('salons')
      .select('name, telegram_token, telegram_chat_id')
      .eq('id', salon_id)
      .single();

    if (salonError) {
      console.error("Supabase Salon Config Fetch Error:", salonError);
      throw salonError;
    }

    // 4. Send Telegram Bot notification (if token and chat ID are configured)
    if (salon.telegram_token && salon.telegram_chat_id) {
      // Fetch service and stylist details to format a clean text message
      const { data: service } = await supabase.from('services').select('title, price').eq('id', service_id).single();
      const { data: stylist } = await supabase.from('stylists').select('name').eq('id', stylist_id).single();

      const serviceName = service ? service.title : "Unknown Service";
      const servicePrice = service ? `₹${service.price}` : "N/A";
      const stylistName = stylist ? stylist.name : "Any Stylist";
      const dateFormatted = new Date(booking_date).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });

      // Construct HTML formatted message for Telegram Bot API
      const message = `
<b>👑 New Booking for ${salon.name}! 👑</b>
━━━━━━━━━━━━━━━━━━━━
👤 <b>Customer:</b> ${customer_name}
📞 <b>Phone:</b> ${customer_phone}

💇‍♂️ <b>Service:</b> ${serviceName}
💰 <b>Price:</b> ${servicePrice}
✂️ <b>Stylist:</b> ${stylistName}

📅 <b>Date:</b> ${dateFormatted}
⏰ <b>Time:</b> ${booking_time}
💬 <b>Special Note:</b> <i>${notes || "None"}</i>
━━━━━━━━━━━━━━━━━━━━
🚀 <i>Sent instantly from L'Étoile SaaS Platform</i>
`;

      try {
        const telegramRes = await fetch(
          `https://api.telegram.org/bot${salon.telegram_token}/sendMessage`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              chat_id: salon.telegram_chat_id,
              text: message,
              parse_mode: 'HTML'
            })
          }
        );
        
        const telegramData = await telegramRes.json();
        if (!telegramRes.ok || !telegramData.ok) {
          console.error("Telegram API Notification Failed:", telegramData);
          // We do not fail the request if only Telegram notification fails, because the booking was successfully recorded in DB.
        }
      } catch (tgError) {
        console.error("Telegram Request Error:", tgError);
      }
    }

    return NextResponse.json({ success: true, booking }, { status: 200 });

  } catch (error) {
    console.error("API Booking Route Error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error." },
      { status: 500 }
    );
  }
}
