const fs = require('fs');
const path = require('path');

function loadEnv() {
  const envPath = path.join(__dirname, '../.env');
  if (!fs.existsSync(envPath)) return {};
  const content = fs.readFileSync(envPath, 'utf8');
  const env = {};
  content.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?/);
    if (match) {
      let value = (match[2] || '').trim();
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      env[match[1]] = value;
    }
  });
  return env;
}

const env = loadEnv();
const webhookUrl = env.SLACK_WEBHOOK_URL || process.env.SLACK_WEBHOOK_URL;

if (!webhookUrl) {
  console.error('❌ SLACK_WEBHOOK_URL not found in .env');
  process.exit(1);
}

const pdfUrl = "https://tmpfiles.org/dl/wTw7d5hnoKuz/voxora_pricing_workflow.pdf";

const payload = {
  text: `📄 *Voxora End-to-End Billing & Wallet Workflow (PDF)*`,
  attachments: [
    {
      color: '#0284c7', // Sky blue theme
      title: '📥 Download PRICING.pdf',
      title_link: pdfUrl,
      text: `A clean, professionally formatted PDF outlining the end-to-end user-to-backend credits workflow, Stripe webhook lifecycles, and security safeguards.\n\n🔗 *Direct Download Link:* <${pdfUrl}|Click here to download PDF>`,
      footer: 'Voxora AI Billing Infrastructure',
      ts: Math.floor(Date.now() / 1000)
    }
  ]
};

console.log('🚀 Broadcasting PDF download link to Slack...');

fetch(webhookUrl, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload),
})
  .then(res => {
    if (res.ok) console.log('✅ Slack notified successfully with PDF link!');
    else res.text().then(t => console.error('❌ Failed:', res.status, t));
  })
  .catch(err => console.error('💥 Network error:', err.message));
