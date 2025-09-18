import nodemailer from "nodemailer"

export function createTransporter() {
  const host = process.env.SMTP_HOST
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : undefined
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS

  if (!host || !port) {
    console.error("SMTP_HOST/SMTP_PORT not configured; skipping admin email send")
    return null
  }

  const auth = user && pass ? { user, pass } : undefined

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth,
  })

  return transporter
}

export async function sendAdminEmail(recipients: string[], subject: string, text: string) {
  if (!recipients || recipients.length === 0) return

  const from = process.env.SMTP_FROM || "no-reply@localhost"
  const transporter = createTransporter()
  if (!transporter) return

  try {
    await transporter.sendMail({
      from,
      to: recipients.join(","),
      subject,
      text,
    })
  } catch (error) {
    console.error("Failed to send admin email:", error)
  }
}

export async function sendOrderEmail(to: string, data: {
  address: string;
  dateStr: string;
  timeStr: string;
  totalCents: number;
  orderId: string;
  orderPlacedDate: string;
  orderUrl: string;
  receiptUrl?: string;
  customerNotes?: string;
}) {
  const { address, dateStr, timeStr, totalCents, orderId, orderPlacedDate, orderUrl, receiptUrl, customerNotes } = data;

  const text = `Thank you for your order!

Please pick up your order at ${address} on ${dateStr} between ${timeStr}.

Order total: $${(totalCents / 100).toFixed(2)}
Order ID: ${orderId}
Order placed on: ${orderPlacedDate}
Notes: ${customerNotes || '(none)'}

Send any questions to ${process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'EXAMPLE@GMAIL.COM'} and include your order ID, or reply directly to this email.

See your order: ${orderUrl}${receiptUrl ? `\nStripe Receipt: ${receiptUrl}` : ''}

We'll see you soon!`;

  const html = `
  <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;line-height:1.4">
    <p>Thank you for your order!</p>
    
    <p>Please pick up your order at <strong>${address}</strong> on <strong>${dateStr}</strong> between <strong>${timeStr}</strong>.</p>
    
    <p><strong>Order total:</strong> $${(totalCents / 100).toFixed(2)}<br/>
       <strong>Order ID:</strong> ${orderId}<br/>
       <strong>Order placed on:</strong> ${orderPlacedDate}<br/>
       <strong>Notes:</strong> ${customerNotes || '(none)'}</p>
    
    <p>Send any questions to <strong>${process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'EXAMPLE@GMAIL.COM'}</strong> and include your order ID, or reply directly to this email.</p>
    
    <p>See your order: <a href="${orderUrl}">${orderUrl}</a>${receiptUrl ? `<br/>Stripe receipt: <a href="${receiptUrl}">${receiptUrl}</a>` : ''}</p>
    
    <p>We'll see you soon!</p>
  </div>
  `;

  const transporter = createTransporter()
  if (!transporter) return

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || "no-reply@localhost",
      to,
      subject: `Bake4Love Order - Pickup: ${dateStr}`,
      text,           // plaintext fallback
      html,           // formatted version
    })
  } catch (error) {
    console.error("Failed to send order email:", error)
  }
} 