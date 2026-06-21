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

const pricingPath = path.join(__dirname, '../PRICING.md');
if (!fs.existsSync(pricingPath)) {
  console.error('❌ PRICING.md not found');
  process.exit(1);
}

const content = fs.readFileSync(pricingPath, 'utf8');

// Slack messages have a character limit of 4000 characters.
// We will split the content into sections by headers '##' and send them as clean attachments.
const sections = content.split(/\n(?=## )/);

const attachments = [];
let mainText = sections[0].trim(); // Includes title and diagram

// Parse each section into a Slack attachment
for (let i = 1; i < sections.length; i++) {
  const section = sections[i].trim();
  const lines = section.split('\n');
  const title = lines[0].replace(/^##\s*/, '').trim();
  const body = lines.slice(1).join('\n').trim();
  
  attachments.push({
    title: title,
    text: body,
    color: '#0284c7', // Sky blue theme for Pricing/Finances
  });
}

const payload = {
  text: `💰 *Voxora End-to-End Billing & Wallet Workflow (PRICING)*\n\n${mainText}`,
  attachments: attachments
};

console.log('🚀 Sending PRICING workflow to Slack...');

fetch(webhookUrl, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload),
})
  .then(res => {
    if (res.ok) console.log('✅ Slack notified successfully!');
    else res.text().then(t => console.error('❌ Failed:', res.status, t));
  })
  .catch(err => console.error('💥 Network error:', err.message));
