export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Add CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  try {
    const { testName, studentName, timeSpent, score, totalQuestions, percentage, timestamp } = await req.body;

    // Validate required fields
    if (!testName || !studentName || !timeSpent || score === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Telegram bot configuration
    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      console.error('Telegram credentials not configured');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Create formatted message
    const message = `
📚 *Test Completed - ${testName}*

👤 *Student:* ${studentName}
⏱️ *Time Spent:* ${timeSpent}
📊 *Score:* ${score}/${totalQuestions} (${percentage}%)
🕒 *Completed:* ${new Date(timestamp).toLocaleString()}

${percentage >= 80 ? '🎉 Excellent work!' : percentage >= 60 ? '👍 Good job!' : '💪 Keep practicing!'}
    `.trim();

    // Send to Telegram
    const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    const telegramResponse = await fetch(telegramUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'Markdown',
      }),
    });

    const telegramData = await telegramResponse.json();

    if (!telegramResponse.ok) {
      console.error('Telegram API error:', telegramData);
      return res.status(500).json({ 
        error: 'Failed to send Telegram message',
        details: telegramData
      });
    }

    console.log('Test result sent to Telegram:', { studentName, score, timeSpent });
    
    res.status(200).json({ 
      success: true, 
      message: 'Test submitted successfully',
      telegramMessageId: telegramData.result.message_id
    });

  } catch (error) {
    console.error('Error submitting test:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}
