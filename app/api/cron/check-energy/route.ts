import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getMaxEnergy, getCurrentEnergy } from '@/lib/energy';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  // Verifikasi request berasal dari Vercel Cron
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Ambil konfigurasi Telegram
  const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

  if (!TELEGRAM_TOKEN || !TELEGRAM_CHAT_ID) {
    return NextResponse.json({ error: 'Telegram config missing' }, { status: 500 });
  }

  try {
    // 1. Fetch data
    const { data: characters, error: charsError } = await supabase
      .from('characters')
      .select('*, accounts(name)');

    if (charsError) throw charsError;
    if (!characters) return NextResponse.json({ message: 'No characters' });

    const newlyFulls = [];

    // 2. Evaluasi
    for (const char of characters) {
      if (char.notified_full) continue;

      const max = getMaxEnergy(char.level);
      const current = getCurrentEnergy(char.energy, char.last_energy_update, char.level);

      if (current >= max) {
        newlyFulls.push(char);
      }
    }

    if (newlyFulls.length === 0) {
      return NextResponse.json({ message: 'No new full energies' });
    }

    // 3. Bangun pesan
    let messageBody = `🔔 *WWM Energy Tracker*\nEnergy Penuh!\n\n`;
    for (const char of newlyFulls) {
       messageBody += `- ${char.name} (${char.accounts.name})\n`;
    }

    // 4. Kirim ke Telegram
    const botUrl = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
    
    const tgRes = await fetch(botUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: messageBody,
        parse_mode: 'Markdown'
      })
    });

    if (!tgRes.ok) {
        throw new Error(`Gagal mengirim Telegram: ${await tgRes.text()}`);
    }

    // 5. Update DB agar tidak dikirim ulang nanti
    const charIds = newlyFulls.map(c => c.id);
    await supabase
      .from('characters')
      .update({ notified_full: true })
      .in('id', charIds);

    return NextResponse.json({ message: `Successfully notified for ${newlyFulls.length} characters` });

  } catch (error: any) {
    console.error('Cron error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
