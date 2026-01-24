import { format } from 'date-fns';

interface InvoiceItem {
  description: string;
  quantity: number;
  unit_price: number;
  gst_rate: number;
  gst_amount: number;
  total_amount: number;
}

interface InvoiceData {
  invoice_number: string;
  issue_date: string;
  due_date?: string;
  status: string;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  notes?: string;
  customer?: {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    gstin?: string;
  };
  business?: {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    gstin?: string;
  };
  items: InvoiceItem[];
}

export const generateInvoicePDF = async (invoice: InvoiceData): Promise<void> => {
  // Create a printable HTML document
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    throw new Error('Could not open print window');
  }

  const formatCurrency = (amount: number) => `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Invoice ${invoice.invoice_number}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
          padding: 40px; 
          color: #1a1a2e;
          line-height: 1.6;
        }
        .invoice-container { max-width: 800px; margin: 0 auto; }
        .header { 
          display: flex; 
          justify-content: space-between; 
          align-items: flex-start;
          margin-bottom: 40px;
          padding-bottom: 20px;
          border-bottom: 2px solid #e5e7eb;
        }
        .company-info h1 { 
          font-size: 28px; 
          color: #1e40af; 
          margin-bottom: 8px;
        }
        .company-info p { 
          font-size: 14px; 
          color: #6b7280; 
        }
        .invoice-details { text-align: right; }
        .invoice-number { 
          font-size: 24px; 
          font-weight: bold; 
          color: #1e40af;
          margin-bottom: 8px;
        }
        .invoice-meta p { 
          font-size: 14px; 
          color: #6b7280;
          margin: 4px 0;
        }
        .status { 
          display: inline-block;
          padding: 4px 12px; 
          border-radius: 20px; 
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          margin-top: 8px;
        }
        .status-paid { background: #d1fae5; color: #065f46; }
        .status-sent { background: #dbeafe; color: #1e40af; }
        .status-draft { background: #f3f4f6; color: #374151; }
        .status-overdue { background: #fee2e2; color: #991b1b; }
        .parties { 
          display: flex; 
          gap: 40px; 
          margin-bottom: 40px;
        }
        .party { flex: 1; }
        .party-label { 
          font-size: 12px; 
          color: #6b7280; 
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 8px;
        }
        .party-name { 
          font-size: 18px; 
          font-weight: 600; 
          margin-bottom: 4px;
        }
        .party-details p { 
          font-size: 14px; 
          color: #374151;
          margin: 2px 0;
        }
        table { 
          width: 100%; 
          border-collapse: collapse; 
          margin-bottom: 30px;
        }
        th { 
          background: #f8fafc; 
          padding: 12px 16px; 
          text-align: left;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #6b7280;
          border-bottom: 2px solid #e5e7eb;
        }
        th:last-child, td:last-child { text-align: right; }
        td { 
          padding: 16px; 
          border-bottom: 1px solid #f3f4f6;
          font-size: 14px;
        }
        .item-desc { font-weight: 500; }
        .totals { 
          margin-left: auto; 
          width: 300px; 
        }
        .total-row { 
          display: flex; 
          justify-content: space-between;
          padding: 8px 0;
          font-size: 14px;
        }
        .total-row.grand { 
          border-top: 2px solid #e5e7eb;
          margin-top: 8px;
          padding-top: 16px;
          font-size: 18px;
          font-weight: bold;
          color: #1e40af;
        }
        .notes { 
          margin-top: 40px;
          padding: 20px;
          background: #f8fafc;
          border-radius: 8px;
        }
        .notes-label { 
          font-size: 12px;
          text-transform: uppercase;
          color: #6b7280;
          margin-bottom: 8px;
        }
        .footer { 
          margin-top: 60px;
          text-align: center;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          font-size: 12px;
          color: #9ca3af;
        }
        @media print {
          body { padding: 20px; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="invoice-container">
        <div class="header">
          <div class="company-info">
            <h1>${invoice.business?.name || 'Your Business'}</h1>
            ${invoice.business?.address ? `<p>${invoice.business.address}</p>` : ''}
            ${invoice.business?.phone ? `<p>Phone: ${invoice.business.phone}</p>` : ''}
            ${invoice.business?.email ? `<p>Email: ${invoice.business.email}</p>` : ''}
            ${invoice.business?.gstin ? `<p><strong>GSTIN:</strong> ${invoice.business.gstin}</p>` : ''}
          </div>
          <div class="invoice-details">
            <div class="invoice-number">INVOICE</div>
            <div class="invoice-meta">
              <p><strong>${invoice.invoice_number}</strong></p>
              <p>Issue Date: ${format(new Date(invoice.issue_date), 'dd MMM yyyy')}</p>
              ${invoice.due_date ? `<p>Due Date: ${format(new Date(invoice.due_date), 'dd MMM yyyy')}</p>` : ''}
              <span class="status status-${invoice.status}">${invoice.status}</span>
            </div>
          </div>
        </div>

        <div class="parties">
          <div class="party">
            <div class="party-label">Bill To</div>
            <div class="party-name">${invoice.customer?.name || 'Customer'}</div>
            <div class="party-details">
              ${invoice.customer?.address ? `<p>${invoice.customer.address}</p>` : ''}
              ${invoice.customer?.phone ? `<p>Phone: ${invoice.customer.phone}</p>` : ''}
              ${invoice.customer?.email ? `<p>Email: ${invoice.customer.email}</p>` : ''}
              ${invoice.customer?.gstin ? `<p><strong>GSTIN:</strong> ${invoice.customer.gstin}</p>` : ''}
            </div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 40%">Description</th>
              <th>Qty</th>
              <th>Rate</th>
              <th>GST %</th>
              <th>GST Amount</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            ${invoice.items.map(item => `
              <tr>
                <td class="item-desc">${item.description}</td>
                <td>${item.quantity}</td>
                <td>${formatCurrency(item.unit_price)}</td>
                <td>${item.gst_rate}%</td>
                <td>${formatCurrency(item.gst_amount || 0)}</td>
                <td>${formatCurrency(item.total_amount)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="totals">
          <div class="total-row">
            <span>Subtotal</span>
            <span>${formatCurrency(invoice.subtotal)}</span>
          </div>
          <div class="total-row">
            <span>GST</span>
            <span>${formatCurrency(invoice.tax_amount)}</span>
          </div>
          <div class="total-row grand">
            <span>Total</span>
            <span>${formatCurrency(invoice.total_amount)}</span>
          </div>
        </div>

        ${invoice.notes ? `
          <div class="notes">
            <div class="notes-label">Notes</div>
            <p>${invoice.notes}</p>
          </div>
        ` : ''}

        <div class="footer">
          <p>Thank you for your business!</p>
          <p>Generated on ${format(new Date(), 'dd MMM yyyy, HH:mm')}</p>
        </div>
      </div>

      <script>
        window.onload = function() {
          window.print();
        }
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
};
