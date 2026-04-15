const https = require('https');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const body = JSON.parse(event.body);
    const page = body.page || 'Unknown';
    const userAgent = event.headers['user-agent'] || 'Unknown';

    // Get IP from Netlify context
    const clientIP = event.headers['client-ip'] || event.headers['x-forwarded-for'] || 'Unknown';

    // Build Slack message
    const slackMessage = {
      text: '🌐 New Website Visit',
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '🌐 Solstice Website Visit'
          }
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Page:*\n${page}`
            },
            {
              type: 'mrkdwn',
              text: `*IP Address:*\n${clientIP}`
            }
          ]
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*User Agent:*\n\`${userAgent}\``
          }
        },
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: `Timestamp: <!date^${Math.floor(Date.now() / 1000)}^{date_num} {time_secs}|${new Date().toISOString()}>`
            }
          ]
        }
      ]
    };

    // Send to Slack
    const webhookUrl = 'https://hooks.slack.com/services/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';
    
    const slackRequest = new Promise((resolve, reject) => {
      const payload = JSON.stringify(slackMessage);
      const options = {
        hostname: 'hooks.slack.com',
        path: '/services/T0AMGNQMFL0/B0AL71SV3V5/HGU2FIaf2GH19eGBcDLMbyI8',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': payload.length
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          if (res.statusCode === 200) {
            resolve({ success: true });
          } else {
            reject(new Error(`Slack API returned ${res.statusCode}`));
          }
        });
      });

      req.on('error', reject);
      req.write(payload);
      req.end();
    });

    await slackRequest;

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: 'Notification sent' })
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
