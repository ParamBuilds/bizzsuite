// SMTP Email Queue for Offline-First Notifications
import { getDatabase } from './offline-db/database';

export interface SMTPConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  from_name: string;
  from_email: string;
  secure: boolean;
}

export interface EmailNotification {
  type: 'invoice_overdue' | 'low_stock' | 'compliance_pack' | 'grievance_ticket' | 'security_alert' | 'payment_reminder';
  recipient_email: string;
  subject: string;
  body: string;
  metadata?: Record<string, any>;
}

// Save SMTP config to local settings
export async function saveSMTPConfig(config: SMTPConfig): Promise<void> {
  const db = await getDatabase();
  const now = new Date().toISOString();
  
  const existing = await db.settings.findOne({ selector: { key: 'smtp_config' } }).exec();
  
  if (existing) {
    await existing.patch({
      value: JSON.stringify(config),
      updated_at: now
    });
  } else {
    await db.settings.insert({
      key: 'smtp_config',
      value: JSON.stringify(config),
      updated_at: now
    });
  }
}

export async function getSMTPConfig(): Promise<SMTPConfig | null> {
  const db = await getDatabase();
  const setting = await db.settings.findOne({ selector: { key: 'smtp_config' } }).exec();
  
  if (!setting) return null;
  
  try {
    return JSON.parse(setting.value);
  } catch {
    return null;
  }
}

// Queue a notification for sending
export async function queueNotification(notification: EmailNotification): Promise<string> {
  const db = await getDatabase();
  const now = new Date().toISOString();
  const id = crypto.randomUUID();
  
  await db.notification_queue.insert({
    id,
    type: notification.type,
    recipient_email: notification.recipient_email,
    subject: notification.subject,
    body: notification.body,
    status: 'pending',
    created_at: now,
    sent_at: null,
    error: null,
    retry_count: 0
  });
  
  return id;
}

// Get pending notifications
export async function getPendingNotifications(): Promise<any[]> {
  const db = await getDatabase();
  const notifications = await db.notification_queue
    .find({ selector: { status: 'pending' } })
    .exec();
  return notifications.map((n: any) => n.toJSON());
}

// Get notification queue stats
export async function getNotificationQueueStats(): Promise<{
  pending: number;
  sent: number;
  failed: number;
}> {
  const db = await getDatabase();
  
  const pending = await db.notification_queue.find({ selector: { status: 'pending' } }).exec();
  const sent = await db.notification_queue.find({ selector: { status: 'sent' } }).exec();
  const failed = await db.notification_queue.find({ selector: { status: 'failed' } }).exec();
  
  return {
    pending: pending.length,
    sent: sent.length,
    failed: failed.length
  };
}

// Email templates
export const emailTemplates = {
  invoice_overdue: (data: { businessName: string; customerName: string; invoiceNumber: string; amount: string; dueDate: string }) => ({
    subject: `Payment Overdue: Invoice ${data.invoiceNumber}`,
    body: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; }
    .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
    .amount { font-size: 24px; font-weight: bold; color: #dc2626; }
    .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin-top: 20px; }
    .footer { text-align: center; margin-top: 20px; color: #64748b; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin:0;">Payment Reminder</h1>
      <p style="margin:10px 0 0;">From ${data.businessName}</p>
    </div>
    <div class="content">
      <p>Dear ${data.customerName},</p>
      <p>This is a friendly reminder that payment for invoice <strong>${data.invoiceNumber}</strong> is now overdue.</p>
      <p class="amount">Amount Due: ${data.amount}</p>
      <p>Original Due Date: ${data.dueDate}</p>
      <p>Please arrange payment at your earliest convenience.</p>
      <p>If you have already made the payment, please disregard this reminder.</p>
      <p>Best regards,<br>${data.businessName}</p>
    </div>
    <div class="footer">
      <p>This email was sent by BizSuite on behalf of ${data.businessName}</p>
    </div>
  </div>
</body>
</html>`
  }),

  low_stock: (data: { businessName: string; productName: string; currentStock: number; threshold: number }) => ({
    subject: `Low Stock Alert: ${data.productName}`,
    body: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; }
    .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
    .alert-box { background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .footer { text-align: center; margin-top: 20px; color: #64748b; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin:0;">⚠️ Low Stock Alert</h1>
    </div>
    <div class="content">
      <div class="alert-box">
        <h2 style="margin-top:0;">${data.productName}</h2>
        <p><strong>Current Stock:</strong> ${data.currentStock} units</p>
        <p><strong>Reorder Threshold:</strong> ${data.threshold} units</p>
      </div>
      <p>Please reorder this item to maintain adequate inventory levels.</p>
      <p>Best regards,<br>${data.businessName}</p>
    </div>
    <div class="footer">
      <p>Automated alert from BizSuite</p>
    </div>
  </div>
</body>
</html>`
  }),

  payment_reminder: (data: { businessName: string; customerName: string; invoiceNumber: string; amount: string; dueDate: string }) => ({
    subject: `Payment Due Soon: Invoice ${data.invoiceNumber}`,
    body: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; }
    .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
    .amount { font-size: 24px; font-weight: bold; color: #2563eb; }
    .footer { text-align: center; margin-top: 20px; color: #64748b; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin:0;">Payment Reminder</h1>
      <p style="margin:10px 0 0;">From ${data.businessName}</p>
    </div>
    <div class="content">
      <p>Dear ${data.customerName},</p>
      <p>This is a friendly reminder about your upcoming payment for invoice <strong>${data.invoiceNumber}</strong>.</p>
      <p class="amount">Amount: ${data.amount}</p>
      <p>Due Date: ${data.dueDate}</p>
      <p>Thank you for your continued business!</p>
      <p>Best regards,<br>${data.businessName}</p>
    </div>
    <div class="footer">
      <p>This email was sent by BizSuite on behalf of ${data.businessName}</p>
    </div>
  </div>
</body>
</html>`
  })
};
