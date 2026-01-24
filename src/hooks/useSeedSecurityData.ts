import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { writeAuditLog } from '@/lib/offline-db/audit-logger';
import { addEvidence } from '@/lib/evidence-vault';
import { toast } from 'sonner';

// Sample audit log entries for demo
const sampleAuditActions = [
  { action: 'login', entity_type: 'user', description: 'User logged in successfully' },
  { action: 'create', entity_type: 'invoice', description: 'Created invoice INV-2025001' },
  { action: 'update', entity_type: 'customer', description: 'Updated customer contact info' },
  { action: 'create', entity_type: 'product', description: 'Added new product to inventory' },
  { action: 'export', entity_type: 'report', description: 'Exported monthly sales report' },
  { action: 'update', entity_type: 'invoice', description: 'Updated invoice status to paid' },
  { action: 'create', entity_type: 'expense', description: 'Recorded office expense' },
  { action: 'delete', entity_type: 'draft_invoice', description: 'Deleted draft invoice' },
  { action: 'settings_change', entity_type: 'business', description: 'Updated GST settings' },
  { action: 'login', entity_type: 'user', description: 'User logged in from new device' },
  { action: 'create', entity_type: 'customer', description: 'Added new customer' },
  { action: 'export', entity_type: 'audit_logs', description: 'Exported audit logs for compliance' },
] as const;

// Sample evidence vault entries
const sampleEvidenceEntries = [
  {
    type: 'invoice' as const,
    title: 'Invoice INV-2025001',
    description: 'Invoice for Priya Sharma - ₹75,000',
    origin: 'Invoice Module',
    metadata: { invoiceNumber: 'INV-2025001', totalAmount: 75000, status: 'paid' }
  },
  {
    type: 'audit_export' as const,
    title: 'Monthly Audit Export - January 2025',
    description: 'Audit log export containing 156 entries',
    origin: 'Audit Module',
    metadata: { entryCount: 156, period: 'January 2025' }
  },
  {
    type: 'compliance_pack' as const,
    title: 'GST Compliance Report Q4',
    description: 'Quarterly GST compliance documentation',
    origin: 'Compliance Module',
    metadata: { quarter: 'Q4', year: 2024 }
  },
  {
    type: 'inspection_snapshot' as const,
    title: 'System Health Snapshot',
    description: 'Complete system state snapshot for audit',
    origin: 'Health Check Module',
    metadata: { componentsChecked: 12, allPassed: true }
  },
  {
    type: 'backup' as const,
    title: 'Daily Backup - Jan 24, 2025',
    description: 'Automated daily backup of business data',
    origin: 'Backup System',
    metadata: { recordCount: 1250, sizeBytes: 2500000 }
  }
];

// Sample security events for Supabase
const sampleSecurityEvents = [
  {
    event_type: 'failed_login_attempt',
    severity: 'warning',
    description: 'Multiple failed login attempts detected from IP 192.168.1.100',
    source_ip: '192.168.1.100'
  },
  {
    event_type: 'suspicious_activity',
    severity: 'critical',
    description: 'Unusual data access pattern detected - large export request',
    source_ip: '10.0.0.50'
  },
  {
    event_type: 'new_device_login',
    severity: 'info',
    description: 'Login from new device: Windows PC - Chrome Browser',
    source_ip: '203.45.67.89'
  },
  {
    event_type: 'permission_escalation',
    severity: 'warning',
    description: 'User role changed from viewer to admin',
    source_ip: '192.168.1.1'
  },
  {
    event_type: 'data_export',
    severity: 'info',
    description: 'Large data export initiated - 500+ records',
    source_ip: '192.168.1.50'
  }
];

export function useSeedSecurityData() {
  const [isSeeding, setIsSeeding] = useState(false);

  const seedSecurityData = async () => {
    setIsSeeding(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const actorId = user?.id || 'demo_user';
      
      // 1. Seed local RxDB audit logs with chain hashing
      console.log('Seeding local audit logs...');
      for (const audit of sampleAuditActions) {
        await writeAuditLog({
          actor: actorId,
          action: audit.action,
          entity_type: audit.entity_type,
          entity_id: crypto.randomUUID(),
          before_json: audit.action === 'update' ? { status: 'old' } : undefined,
          after_json: audit.action === 'update' ? { status: 'new' } : undefined
        });
        // Small delay to ensure proper chain hashing
        await new Promise(r => setTimeout(r, 50));
      }

      // 2. Seed evidence vault entries
      console.log('Seeding evidence vault...');
      for (const evidence of sampleEvidenceEntries) {
        await addEvidence({
          type: evidence.type,
          title: evidence.title,
          description: evidence.description,
          origin: evidence.origin,
          linkedAuditIds: [],
          metadata: evidence.metadata
        });
        await new Promise(r => setTimeout(r, 50));
      }

      // 3. Try to seed Supabase security_events (may fail if no organization)
      console.log('Seeding security events...');
      try {
        // First check if user has an organization
        const { data: userRole } = await supabase
          .from('user_roles')
          .select('organization_id')
          .eq('user_id', actorId)
          .eq('is_active', true)
          .maybeSingle();

        if (userRole?.organization_id) {
          for (const event of sampleSecurityEvents) {
            await supabase.from('security_events').insert({
              organization_id: userRole.organization_id,
              event_type: event.event_type,
              severity: event.severity,
              description: event.description,
              source_ip: event.source_ip,
              user_id: user?.id
            });
          }
        }
      } catch (secError) {
        console.log('Security events seeding skipped (no organization context)');
      }

      // 4. Also seed Supabase audit_logs table if organization exists
      console.log('Seeding Supabase audit logs...');
      try {
        const { data: userRole } = await supabase
          .from('user_roles')
          .select('organization_id')
          .eq('user_id', actorId)
          .eq('is_active', true)
          .maybeSingle();

        if (userRole?.organization_id) {
          const auditEventTypes = ['login', 'create', 'update', 'delete', 'export'] as const;
          const entityTypes = ['invoice', 'customer', 'product', 'expense', 'settings'];
          
          for (let i = 0; i < 15; i++) {
            const eventType = auditEventTypes[Math.floor(Math.random() * auditEventTypes.length)];
            const entityType = entityTypes[Math.floor(Math.random() * entityTypes.length)];
            
            await supabase.from('audit_logs').insert({
              organization_id: userRole.organization_id,
              user_id: user?.id,
              event_type: eventType,
              entity_type: entityType,
              action: `${eventType} ${entityType}`,
              entity_id: crypto.randomUUID(),
              ip_address: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`
            });
          }
        }
      } catch (auditError) {
        console.log('Supabase audit logs seeding skipped');
      }

      toast.success('Security demo data added: 12 audit logs, 5 evidence entries');
      return { success: true };
    } catch (error: any) {
      console.error('Failed to seed security data:', error);
      toast.error(`Failed to seed security data: ${error.message}`);
      return { success: false, error };
    } finally {
      setIsSeeding(false);
    }
  };

  return { seedSecurityData, isSeeding };
}