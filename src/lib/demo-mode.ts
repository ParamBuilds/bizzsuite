// Demo Mode - Offline demo with realistic sample data
import { getDatabase } from './offline-db/database';

export interface DemoState {
  isActive: boolean;
  startedAt: string | null;
  organizationName: string;
}

const DEMO_STORAGE_KEY = 'bizsuite-demo-mode';

// Check if demo mode is active
export function isDemoMode(): boolean {
  const stored = localStorage.getItem(DEMO_STORAGE_KEY);
  if (!stored) return false;
  try {
    const state: DemoState = JSON.parse(stored);
    return state.isActive;
  } catch {
    return false;
  }
}

// Get demo state
export function getDemoState(): DemoState {
  const stored = localStorage.getItem(DEMO_STORAGE_KEY);
  if (!stored) {
    return { isActive: false, startedAt: null, organizationName: '' };
  }
  try {
    return JSON.parse(stored);
  } catch {
    return { isActive: false, startedAt: null, organizationName: '' };
  }
}

// Sample demo data
const DEMO_ORGANIZATION = {
  name: 'Sunrise Manufacturing Pvt. Ltd.',
  address: '123 Industrial Estate, Sector 5, Mumbai - 400001',
  gstin: '27AABCS1234Z1Z5',
  phone: '+91 22 2345 6789',
  email: 'info@sunrisemfg.com'
};

const DEMO_CUSTOMERS = [
  { name: 'Reliable Traders', email: 'orders@reliabletraders.com', phone: '+91 98765 43210', gstin: '27AABCT5678A1Z2', address: 'Shop 45, Crawford Market, Mumbai' },
  { name: 'Metro Distributors', email: 'purchase@metrodist.in', phone: '+91 98765 12345', gstin: '27AABCM9012B2Z3', address: '78 Andheri East, Mumbai' },
  { name: 'Bharat Enterprises', email: 'accounts@bharatent.com', phone: '+91 87654 32109', gstin: '27AABCB3456C3Z4', address: '156 Thane West, Thane' },
  { name: 'National Suppliers Co.', email: 'info@nationalsuppliers.in', phone: '+91 76543 21098', gstin: '27AABCN7890D4Z5', address: '234 Navi Mumbai' },
  { name: 'Quality Products Ltd.', email: 'sales@qualityproducts.co.in', phone: '+91 65432 10987', gstin: '27AABCQ1234E5Z6', address: '89 Powai, Mumbai' }
];

const DEMO_PRODUCTS = [
  { name: 'Industrial Bearing Set', sku: 'IBS-001', unit_price: 2500, stock_quantity: 150, low_stock_threshold: 20, hsn_sac_code: '8482', gst_rate: 18 },
  { name: 'Hydraulic Pump Motor', sku: 'HPM-002', unit_price: 15000, stock_quantity: 45, low_stock_threshold: 10, hsn_sac_code: '8413', gst_rate: 18 },
  { name: 'Steel Pipe 2"', sku: 'SP2-003', unit_price: 850, stock_quantity: 500, low_stock_threshold: 100, hsn_sac_code: '7304', gst_rate: 18 },
  { name: 'Control Panel Unit', sku: 'CPU-004', unit_price: 8500, stock_quantity: 25, low_stock_threshold: 5, hsn_sac_code: '8537', gst_rate: 18 },
  { name: 'Safety Valve Assembly', sku: 'SVA-005', unit_price: 3200, stock_quantity: 80, low_stock_threshold: 15, hsn_sac_code: '8481', gst_rate: 18 },
  { name: 'Lubricant Oil 5L', sku: 'LO5-006', unit_price: 1200, stock_quantity: 200, low_stock_threshold: 50, hsn_sac_code: '2710', gst_rate: 18 },
  { name: 'Electrical Connector Kit', sku: 'ECK-007', unit_price: 450, stock_quantity: 300, low_stock_threshold: 50, hsn_sac_code: '8536', gst_rate: 18 },
  { name: 'Filter Element Set', sku: 'FES-008', unit_price: 680, stock_quantity: 120, low_stock_threshold: 25, hsn_sac_code: '8421', gst_rate: 18 }
];

const DEMO_VENDORS = [
  { name: 'Supreme Steel Works', email: 'orders@supremesteel.com', phone: '+91 22 3456 7890', gstin: '27AABCS9876A1Z1', address: 'Plot 12, MIDC Taloja' },
  { name: 'Precision Parts India', email: 'sales@precisionparts.in', phone: '+91 22 4567 8901', gstin: '27AABCP5432B2Z2', address: '45 Bhiwandi Industrial Area' },
  { name: 'Global Hydraulics', email: 'info@globalhydraulics.com', phone: '+91 22 5678 9012', gstin: '27AABCG2109C3Z3', address: '78 Vasai Industrial Estate' }
];

// Start demo mode
export async function startDemoMode(): Promise<void> {
  const state: DemoState = {
    isActive: true,
    startedAt: new Date().toISOString(),
    organizationName: DEMO_ORGANIZATION.name
  };
  
  localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(state));
  localStorage.setItem('demo-data-loaded', 'false');
}

// Load demo data into database
export async function loadDemoData(): Promise<void> {
  if (localStorage.getItem('demo-data-loaded') === 'true') {
    return;
  }

  const db = await getDatabase();
  
  // This would insert demo data into the offline database
  // For now, we'll store in localStorage for the demo
  localStorage.setItem('demo-organization', JSON.stringify(DEMO_ORGANIZATION));
  localStorage.setItem('demo-customers', JSON.stringify(DEMO_CUSTOMERS));
  localStorage.setItem('demo-products', JSON.stringify(DEMO_PRODUCTS));
  localStorage.setItem('demo-vendors', JSON.stringify(DEMO_VENDORS));
  localStorage.setItem('demo-data-loaded', 'true');
}

// Get demo data
export function getDemoData() {
  return {
    organization: DEMO_ORGANIZATION,
    customers: DEMO_CUSTOMERS,
    products: DEMO_PRODUCTS,
    vendors: DEMO_VENDORS
  };
}

// Reset demo mode
export function resetDemoMode(): void {
  localStorage.removeItem(DEMO_STORAGE_KEY);
  localStorage.removeItem('demo-data-loaded');
  localStorage.removeItem('demo-organization');
  localStorage.removeItem('demo-customers');
  localStorage.removeItem('demo-products');
  localStorage.removeItem('demo-vendors');
}

// Exit demo mode and transition to real mode
export function exitDemoMode(): void {
  resetDemoMode();
  // Optionally clear demo data from database here
}

// Demo walkthrough steps
export const DEMO_WALKTHROUGH_STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to BizSuite Demo',
    description: 'Experience the full power of offline-first business management.',
    target: null
  },
  {
    id: 'dashboard',
    title: 'Your Business Dashboard',
    description: 'See revenue, expenses, and key metrics at a glance. All data stays on your device.',
    target: '/dashboard'
  },
  {
    id: 'invoices',
    title: 'GST-Ready Invoicing',
    description: 'Create professional invoices with automatic GST calculations (CGST/SGST/IGST).',
    target: '/invoices'
  },
  {
    id: 'inventory',
    title: 'Inventory Management',
    description: 'Track stock levels, batch numbers, and get low-stock alerts.',
    target: '/inventory'
  },
  {
    id: 'audit',
    title: 'Audit Trail',
    description: 'Every action is logged. Perfect for compliance and inspections.',
    target: '/audit-logs'
  },
  {
    id: 'offline',
    title: '100% Offline',
    description: 'BizSuite works without internet. Your data never leaves your device.',
    target: null
  },
  {
    id: 'activate',
    title: 'Ready to Start?',
    description: 'Purchase a lifetime license and own BizSuite forever.',
    target: '/pricing'
  }
];
