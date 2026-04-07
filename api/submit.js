module.exports = async function (req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch (e) {
      return res.status(400).json({ error: 'Invalid JSON body' });
    }
  }

  const { Name, Phone } = body || {};

  if (!Name || !Phone) {
    return res.status(400).json({ error: 'Missing Name or Phone' });
  }

  const BREVO_API_KEY = process.env.BREVO_API_KEY_NOAM;

  let debugInfo = { brevo: null };

  // 1. BREVO EMAIL
  if (BREVO_API_KEY) {
    const brevoData = {
      sender: { name: "Noam Sapir Hadar Website", email: "sapirh111@gmail.com" },
      to: [{ email: "sapirh111@gmail.com", name: "נועם ספיר הדר" }],
      subject: `ליד חדש מהאתר: ${Name}`,
      htmlContent: `<div dir="rtl"><h2>התקבלה פנייה חדשה!</h2><p><strong>שם:</strong> ${Name}</p><p><strong>טלפון:</strong> ${Phone}</p></div>`
    };

    try {
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: { 'accept': 'application/json', 'api-key': BREVO_API_KEY, 'content-type': 'application/json' },
        body: JSON.stringify(brevoData)
      });
      const result = await response.json();
      debugInfo.brevo = { status: response.status, ok: response.ok, result };
    } catch (e) {
      debugInfo.brevo = { error: e.message };
    }
  } else {
    debugInfo.brevo = "API Key Missing";
  }

  // Return status 200
  return res.status(200).json({ success: true, debug: debugInfo });
};
