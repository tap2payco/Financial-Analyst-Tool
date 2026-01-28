// Note: Client-side Resend usage is discouraged as it exposes the API key in the browser.
// For a production app, move this logic to a serverless function (Vercel or Supabase Edge Function).

const getEnvVar = (key: string): string => {
  if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
    return (import.meta as any).env[key] || '';
  }
  return '';
};

const resendApiKey = getEnvVar('VITE_RESEND_API_KEY');

export const emailService = {
    /**
     * Sends an email notification using direct Resend API call
     */
    sendEmail: async (to: string, subject: string, html: string) => {
        if (!resendApiKey) {
            console.warn('VITE_RESEND_API_KEY not configured. Email not sent.');
            return;
        }

        try {
            const response = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${resendApiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    from: 'Finance Guru <notifications@creotix.tech>', // Updated with verified domain
                    to: [to],
                    subject: subject,
                    html: html
                })
            });

            if (!response.ok) {
                const error = await response.json();
                console.error('Resend API error:', error);
            } else {
                console.log(`Email sent successfully to ${to}`);
            }
        } catch (error) {
            console.error('Error sending email via Resend API:', error);
        }
    },

    sendKeyApprovedEmail: async (userEmail: string, userName: string, apiKey: string) => {
        const html = `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
                <h2 style="color: #4f46e5;">Congratulations ${userName}!</h2>
                <p>Your request for a Finance Guru API key has been approved.</p>
                <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0; font-family: monospace; border: 1px dashed #cbd5e1;">
                    <strong>Your API Key:</strong><br/>
                    <span style="color: #0f172a; word-break: break-all;">${apiKey}</span>
                </div>
                <p>You can now use this key in the Developer Playground to test your prompts.</p>
                <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
                <p style="font-size: 12px; color: #64748b;">This is an automated message from Finance Guru.</p>
            </div>
        `;
        await emailService.sendEmail(userEmail, `Finance Guru - API Key Approved!`, html);
    },

    sendKeyRevokedEmail: async (userEmail: string, userName: string, apiKey: string) => {
        const html = `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
                <h2 style="color: #ef4444;">API Key Revoked</h2>
                <p>Hello ${userName},</p>
                <p>We are writing to inform you that your API key ending in <strong>...${apiKey.slice(-6)}</strong> has been revoked by an administrator.</p>
                <p>If you believe this was a mistake, please contact our support team.</p>
                <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
                <p style="font-size: 12px; color: #64748b;">This is an automated message from Finance Guru.</p>
            </div>
        `;
        await emailService.sendEmail(userEmail, `Finance Guru - API Key Revocation Notice`, html);
    }
};

