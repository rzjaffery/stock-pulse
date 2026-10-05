// src/lib/email.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface LowStockAlertParams {
    productName: string;
    sku: string;
    warehouseName: string;
    warehouseCode: string;
    currentQuantity: number;
    minThreshold: number;
}

export async function sendLowStockAlertEmail(params: LowStockAlertParams) {
    if (!process.env.RESEND_API_KEY) {
        console.warn('⚠️ RESEND_API_KEY not found. Skipping email dispatch.');
        return;
    }

    const { productName, sku, warehouseName, warehouseCode, currentQuantity, minThreshold } = params;

    try {
        const data = await resend.emails.send({
            from: 'StockPulse Alerts <alerts@resend.dev>', // Use onboarding sender or custom domain
            to: process.env.RESEND_ALERT_EMAIL || 'admin@stockpulse.io',
            subject: `🚨 LOW STOCK ALERT: ${productName} (${warehouseCode})`,
            html: `
        <div style="font-family: Arial, sans-serif; background-color: #0f172a; color: #f8fafc; padding: 24px; border-radius: 8px;">
          <h2 style="color: #f59e0b; margin-top: 0;">⚠️ Low Stock Threshold Triggered</h2>
          <p style="font-size: 15px; line-height: 1.5; color: #cbd5e1;">
            A recent stock movement reduced inventory below safety margins.
          </p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0; background-color: #1e293b; border-radius: 6px;">
            <tr>
              <td style="padding: 12px; border-bottom: 1px solid #334155; color: #94a3b8;">Product</td>
              <td style="padding: 12px; border-bottom: 1px solid #334155; font-weight: bold; color: #ffffff;">${productName} (${sku})</td>
            </tr>
            <tr>
              <td style="padding: 12px; border-bottom: 1px solid #334155; color: #94a3b8;">Warehouse Location</td>
              <td style="padding: 12px; border-bottom: 1px solid #334155; font-weight: bold; color: #ffffff;">${warehouseName} [${warehouseCode}]</td>
            </tr>
            <tr>
              <td style="padding: 12px; border-bottom: 1px solid #334155; color: #94a3b8;">Current Quantity</td>
              <td style="padding: 12px; border-bottom: 1px solid #334155; font-weight: bold; color: #ef4444;">${currentQuantity} units</td>
            </tr>
            <tr>
              <td style="padding: 12px; color: #94a3b8;">Minimum Threshold</td>
              <td style="padding: 12px; font-weight: bold; color: #f59e0b;">${minThreshold} units</td>
            </tr>
          </table>

          <p style="font-size: 13px; color: #64748b;">
            StockPulse Enterprise Engine • Automated System Notification
          </p>
        </div>
      `,
        });

        console.log('✅ Low stock email alert sent via Resend:', data.id);
    } catch (error) {
        console.error('❌ Failed to dispatch Resend email alert:', error);
    }
}