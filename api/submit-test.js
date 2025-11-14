const fetch = require('node-fetch');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { testName, studentName, timeSpent, score, totalQuestions, percentage, timestamp } = req.body;

    // Telegram bot configuration
    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      console.error('Telegram credentials not configured');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Create message
    const message = `
📚 *Test Completed - ${testName}*

👤 *Student:* ${studentName}
⏱️ *Time Spent:* ${timeSpent}
📊 *Score:* ${score}/${totalQuestions} (${percentage}%)
🕒 *Completed:* ${new Date(timestamp).toLocaleString()}

${percentage >= 80 ? '🎉 Excellent work!' : percentage >= 60 ? '👍 Good job!' : '💪 Keep practicing!'}
    `.trim();

    // Send to Telegram
    const telegramResponse = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: 'Markdown',
        }),
      }
    );

    if (!telegramResponse.ok) {
      throw new Error('Failed to send Telegram message');
    }

    res.status(200).json({ success: true, message: 'Test submitted successfully' });
  } catch (error) {
    console.error('Error submitting test:', error);
    res.status(500).json({ error: 'Failed to submit test' });
  }
};
