import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  FileText, 
  AlertTriangle, 
  Download, 
  CheckCircle2,
  Clock,
  XCircle,
  MessageSquare
} from 'lucide-react';
import { format } from 'date-fns';
import { PageWrapper, MotionContainer, MotionItem, ScrollReveal } from '@/components/ui/motion';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const requestStatusStyles = {
  pending: 'bg-warning/10 text-warning',
  in_progress: 'bg-info/10 text-info',
  completed: 'bg-success/10 text-success',
  rejected: 'bg-destructive/10 text-destructive',
};

const requestStatusIcons = {
  pending: Clock,
  in_progress: AlertTriangle,
  completed: CheckCircle2,
  rejected: XCircle,
};

export default function PrivacyCenterPage() {
  const [activeTab, setActiveTab] = useState('overview');

  const { data: privacyRequests } = useQuery({
    queryKey: ['privacy-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('privacy_requests')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: grievanceTickets } = useQuery({
    queryKey: ['grievance-tickets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('grievance_tickets')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: privacyConsents } = useQuery({
    queryKey: ['privacy-consents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('privacy_consents')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const handleExportData = () => {
    toast.success('Data export initiated. You will receive an email shortly.');
  };

  return (
    <PageWrapper className="space-y-6">
      <MotionContainer>
        <MotionItem>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="page-header flex items-center gap-2">
                <Shield className="h-6 w-6 text-primary" />
                Privacy Center
              </h1>
              <p className="page-description">
                Manage data privacy, consents, and compliance with DPDP Act
              </p>
            </div>
            <Button variant="outline" onClick={handleExportData}>
              <Download className="mr-2 h-4 w-4" />
              Export My Data
            </Button>
          </div>
        </MotionItem>

        <MotionItem>
          <div className="bg-warning/10 border border-warning/20 rounded-lg p-4 text-sm">
            <p className="font-medium text-warning mb-1">Disclaimer</p>
            <p className="text-muted-foreground">
              This software provides compliance tooling and does not constitute legal advice. 
              Please consult with a legal professional for specific compliance requirements.
            </p>
          </div>
        </MotionItem>

        <MotionItem>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="consents">Consents</TabsTrigger>
              <TabsTrigger value="requests">Data Requests</TabsTrigger>
              <TabsTrigger value="grievances">Grievances</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6 mt-6">
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Active Consents
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">
                      {privacyConsents?.filter(c => c.is_granted).length || 0}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Pending Requests
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-warning">
                      {privacyRequests?.filter(r => r.status === 'pending').length || 0}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Open Grievances
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-destructive">
                      {grievanceTickets?.filter(t => t.status === 'pending').length || 0}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Grievance Officer Contact</CardTitle>
                  <CardDescription>
                    As per DPDP Act requirements, the following officer handles data privacy grievances
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p><strong>Name:</strong> ParamBuilds</p>
                  <p><strong>Email:</strong> <a href="mailto:parambuilds@proton.me" className="text-primary hover:underline">parambuilds@proton.me</a></p>
                  <p><strong>Response Time:</strong> Within 30 days of receiving the complaint</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="consents" className="space-y-4 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Your Consents</CardTitle>
                  <CardDescription>Manage how your data is processed</CardDescription>
                </CardHeader>
                <CardContent>
                  {!privacyConsents?.length ? (
                    <p className="text-muted-foreground text-center py-8">No consent records found</p>
                  ) : (
                    <div className="space-y-4">
                      {privacyConsents.map((consent) => (
                        <div key={consent.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium capitalize">{consent.consent_type}</p>
                            <p className="text-sm text-muted-foreground">{consent.purpose}</p>
                          </div>
                          <Badge variant={consent.is_granted ? 'default' : 'secondary'}>
                            {consent.is_granted ? 'Granted' : 'Withdrawn'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="requests" className="space-y-4 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Data Subject Requests</CardTitle>
                  <CardDescription>Track your data access, correction, and deletion requests</CardDescription>
                </CardHeader>
                <CardContent>
                  {!privacyRequests?.length ? (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
                      <p className="text-muted-foreground">No requests submitted yet</p>
                      <Button className="mt-4" variant="outline">
                        Submit New Request
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {privacyRequests.map((request) => {
                        const StatusIcon = requestStatusIcons[request.status as keyof typeof requestStatusIcons];
                        return (
                          <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center gap-4">
                              <StatusIcon className="h-5 w-5 text-muted-foreground" />
                              <div>
                                <p className="font-medium capitalize">{request.request_type} Request</p>
                                <p className="text-sm text-muted-foreground">
                                  Submitted: {format(new Date(request.created_at), 'dd MMM yyyy')}
                                </p>
                              </div>
                            </div>
                            <Badge className={cn('badge-status capitalize', requestStatusStyles[request.status as keyof typeof requestStatusStyles])}>
                              {request.status?.replace('_', ' ')}
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="grievances" className="space-y-4 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Grievance Tickets</CardTitle>
                  <CardDescription>Track complaints and their resolution</CardDescription>
                </CardHeader>
                <CardContent>
                  {!grievanceTickets?.length ? (
                    <div className="text-center py-8">
                      <MessageSquare className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
                      <p className="text-muted-foreground">No grievances filed</p>
                      <Button className="mt-4" variant="outline">
                        File a Grievance
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {grievanceTickets.map((ticket) => (
                        <div key={ticket.id} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-medium">{ticket.subject}</p>
                            <Badge className={cn('badge-status capitalize', requestStatusStyles[ticket.status as keyof typeof requestStatusStyles])}>
                              {ticket.status?.replace('_', ' ')}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Ticket: {ticket.ticket_number} | 
                            Created: {format(new Date(ticket.created_at), 'dd MMM yyyy')}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </MotionItem>
      </MotionContainer>
    </PageWrapper>
  );
}
