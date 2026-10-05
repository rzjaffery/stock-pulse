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
        const { data, error } = await resend.emails.send({
            from: 'StockPulse Alerts <alerts@resend.dev>',
            to: process.env.RESEND_ALERT_EMAIL || 'admin@stockpulse.io',
            subject: `🚨 LOW STOCK ALERT: ${productName} (${warehouseCode})`,
            html: `
        <div style="font-family: Arial, sans-serif; background-color: #0f172a; color: #f8fafc; padding: 24px; border-radius: 8px;">
          <h2 style="color: #f59e0b; margin-top: 0;">⚠️ Low Stock Threshold Triggered</h2>
          <p style="font-size: 15px; color: #cbd5e1;">A recent stock movement reduced inventory below safety margins.</p>
          <p><strong>Product:</strong> ${productName} (${sku})</p>
          <p><strong>Warehouse:</strong> ${warehouseName} [${warehouseCode}]</p>
          <p><strong>Current Quantity:</strong> <span style="color: #ef4444;">${currentQuantity}</span></p>
          <p><strong>Min Threshold:</strong> ${minThreshold}</p>
        </div>
      `,
        });

        if (error) {
            console.error('❌ Resend API Error:', error);
            return;
        }

        console.log('✅ Low stock email alert sent via Resend:', data?.id);
    } catch (error) {
        console.error('❌ Failed to dispatch Resend email alert:', error);
    }
}