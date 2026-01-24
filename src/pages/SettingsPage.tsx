import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useBusiness } from '@/contexts/BusinessContext';
import { useSeedData } from '@/hooks/useSeedData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Building2, IndianRupee, Save, Database, Loader2, RefreshCw, Sparkles, CheckCircle2, Monitor } from 'lucide-react';
import { isDesktopMode } from '@/lib/desktop-mode';
import { FINAL_PRODUCT_MODE } from '@/lib/final-product-mode';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';

// Version changelog
const VERSION_CHANGELOG = [
  {
    version: '1.1.0',
    date: '2026-01-25',
    highlights: [
      'Added manual "Check for Updates" button',
      'Fixed sidebar scrolling on smaller screens',
      'Updated pricing to ₹1,299',
      'Evidence Vault verification fix',
      'Indian Rupee icon throughout the app',
      'Privacy Center grievance officer updated',
    ],
    isNew: true
  },
  {
    version: '1.0.0',
    date: '2026-01-20',
    highlights: [
      'Initial release',
      'Offline-first business management',
      'GST-ready invoicing',
      'Inventory & expense tracking',
      'Desktop app with auto-updates',
    ],
    isNew: false
  },
];

export default function SettingsPage() {
  const { business, profile, refetch } = useBusiness();
  const queryClient = useQueryClient();
  const seedData = useSeedData();
  const [isCheckingUpdates, setIsCheckingUpdates] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<'idle' | 'checking' | 'available' | 'uptodate'>('idle');

  const [businessForm, setBusinessForm] = useState({
    name: business?.name || '',
    email: business?.email || '',
    phone: business?.phone || '',
    address: business?.address || '',
    currency: business?.currency || 'INR',
  });

  const [gstForm, setGstForm] = useState({
    gst_enabled: business?.gst_enabled || false,
    gstin: business?.gstin || '',
  });

  // Fetch GST settings
  const { data: gstSettings } = useQuery({
    queryKey: ['gst-settings', business?.id],
    enabled: !!business?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gst_settings')
        .select('*')
        .eq('business_id', business?.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const [gstSettingsForm, setGstSettingsForm] = useState({
    legal_name: gstSettings?.legal_name || '',
    trade_name: gstSettings?.trade_name || '',
    state_code: gstSettings?.state_code || '',
    default_gst_rate: String(gstSettings?.default_gst_rate ?? 18),
  });

  const updateBusinessMutation = useMutation({
    mutationFn: async () => {
      if (!business?.id) {
        throw new Error('Business not found. Please refresh and try again.');
      }
      const { error } = await supabase
        .from('businesses')
        .update({
          name: businessForm.name,
          email: businessForm.email || null,
          phone: businessForm.phone || null,
          address: businessForm.address || null,
          currency: businessForm.currency,
          gst_enabled: gstForm.gst_enabled,
          gstin: gstForm.gstin || null,
        })
        .eq('id', business.id);
      if (error) throw error;
    },
    onSuccess: () => {
      refetch();
      toast.success('Business settings updated');
    },
    onError: (error) => toast.error(error.message),
  });

  const updateGstSettingsMutation = useMutation({
    mutationFn: async () => {
      if (!business?.id) {
        throw new Error('Business not found. Please refresh and try again.');
      }
      const { error } = await supabase.from('gst_settings').upsert({
        business_id: business.id,
        gstin: gstForm.gstin || null,
        legal_name: gstSettingsForm.legal_name || null,
        trade_name: gstSettingsForm.trade_name || null,
        state_code: gstSettingsForm.state_code || null,
        default_gst_rate: parseFloat(gstSettingsForm.default_gst_rate) || 18,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gst-settings'] });
      toast.success('GST settings updated');
    },
    onError: (error) => toast.error(error.message),
  });

  // Update form when business data loads
  useEffect(() => {
    if (business) {
      setBusinessForm({
        name: business.name || '',
        email: business.email || '',
        phone: business.phone || '',
        address: business.address || '',
        currency: business.currency || 'INR',
      });
      setGstForm({
        gst_enabled: business.gst_enabled || false,
        gstin: business.gstin || '',
      });
    }
  }, [business]);

  useEffect(() => {
    if (gstSettings) {
      setGstSettingsForm({
        legal_name: gstSettings.legal_name || '',
        trade_name: gstSettings.trade_name || '',
        state_code: gstSettings.state_code || '',
        default_gst_rate: String(gstSettings.default_gst_rate || 18),
      });
    }
  }, [gstSettings]);

  // Check for updates handler
  const handleCheckForUpdates = async () => {
    setIsCheckingUpdates(true);
    setUpdateStatus('checking');
    
    try {
      // In desktop mode, trigger the Electron updater via IPC
      if (isDesktopMode() && (window as any).electronAPI?.checkForUpdates) {
        (window as any).electronAPI.checkForUpdates();
        toast.info('Checking for updates...');
        
        // Listen for update response
        setTimeout(() => {
          setIsCheckingUpdates(false);
          setUpdateStatus('uptodate');
          // Trigger confetti for up-to-date celebration
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
          toast.success('You are on the latest version!');
        }, 2000);
      } else {
        // Web mode - just show current version
        await new Promise(resolve => setTimeout(resolve, 1500));
        setUpdateStatus('uptodate');
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
        toast.success(`You're on v${FINAL_PRODUCT_MODE.version} - the latest version!`);
      }
    } catch (error) {
      toast.error('Failed to check for updates');
      setUpdateStatus('idle');
    } finally {
      setIsCheckingUpdates(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div>
        <h1 className="page-header">Settings</h1>
        <p className="page-description">Manage your business settings and preferences</p>
      </div>

      <Tabs defaultValue="business" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="business" className="gap-2">
            <Building2 className="h-4 w-4" />
            Business
          </TabsTrigger>
          <TabsTrigger value="gst" className="gap-2">
            <IndianRupee className="h-4 w-4" />
            GST Settings
          </TabsTrigger>
          <TabsTrigger value="data" className="gap-2">
            <Database className="h-4 w-4" />
            Data
          </TabsTrigger>
          <TabsTrigger value="updates" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Updates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="business">
          <Card>
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
              <CardDescription>Update your business details and contact information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="business-name">Business Name</Label>
                <Input
                  id="business-name"
                  value={businessForm.name}
                  onChange={(e) => setBusinessForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Your Business Name"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="business-email">Email</Label>
                  <Input
                    id="business-email"
                    type="email"
                    value={businessForm.email}
                    onChange={(e) => setBusinessForm((f) => ({ ...f, email: e.target.value }))}
                    placeholder="business@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="business-phone">Phone</Label>
                  <Input
                    id="business-phone"
                    value={businessForm.phone}
                    onChange={(e) => setBusinessForm((f) => ({ ...f, phone: e.target.value }))}
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="business-address">Address</Label>
                <Input
                  id="business-address"
                  value={businessForm.address}
                  onChange={(e) => setBusinessForm((f) => ({ ...f, address: e.target.value }))}
                  placeholder="Full business address"
                />
              </div>

              <Separator className="my-6" />

              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable GST</Label>
                  <p className="text-sm text-muted-foreground">
                    Show GST fields on invoices and products
                  </p>
                </div>
                <Switch
                  checked={gstForm.gst_enabled}
                  onCheckedChange={(c) => setGstForm((f) => ({ ...f, gst_enabled: c }))}
                />
              </div>

              {gstForm.gst_enabled && (
                <div className="space-y-2">
                  <Label htmlFor="gstin">GSTIN</Label>
                  <Input
                    id="gstin"
                    value={gstForm.gstin}
                    onChange={(e) => setGstForm((f) => ({ ...f, gstin: e.target.value }))}
                    placeholder="22AAAAA0000A1Z5"
                  />
                </div>
              )}

              <div className="pt-4">
                <Button onClick={() => updateBusinessMutation.mutate()} disabled={updateBusinessMutation.isPending}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gst">
          <Card>
            <CardHeader>
              <CardTitle>GST Configuration</CardTitle>
              <CardDescription>Configure GST settings for Indian tax compliance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!gstForm.gst_enabled ? (
                <div className="text-center py-8">
                  <IndianRupee className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
                  <h3 className="font-medium text-lg">GST is disabled</h3>
                  <p className="text-muted-foreground">
                    Enable GST in the Business tab to configure these settings
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="legal-name">Legal Name</Label>
                      <Input
                        id="legal-name"
                        value={gstSettingsForm.legal_name}
                        onChange={(e) => setGstSettingsForm((f) => ({ ...f, legal_name: e.target.value }))}
                        placeholder="Registered business name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="trade-name">Trade Name</Label>
                      <Input
                        id="trade-name"
                        value={gstSettingsForm.trade_name}
                        onChange={(e) => setGstSettingsForm((f) => ({ ...f, trade_name: e.target.value }))}
                        placeholder="Trade/brand name"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="state-code">State Code</Label>
                      <Input
                        id="state-code"
                        value={gstSettingsForm.state_code}
                        onChange={(e) => setGstSettingsForm((f) => ({ ...f, state_code: e.target.value }))}
                        placeholder="e.g., 27 for Maharashtra"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="default-rate">Default GST Rate (%)</Label>
                      <Input
                        id="default-rate"
                        type="number"
                        value={gstSettingsForm.default_gst_rate}
                        onChange={(e) => setGstSettingsForm((f) => ({ ...f, default_gst_rate: e.target.value }))}
                        placeholder="18"
                      />
                    </div>
                  </div>

                  <div className="bg-muted/50 rounded-lg p-4 mt-4">
                    <h4 className="font-medium mb-2">GST Calculation</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• <strong>Intra-state:</strong> CGST + SGST (split equally)</li>
                      <li>• <strong>Inter-state:</strong> IGST (full rate)</li>
                      <li>• Rates: 0%, 5%, 12%, 18%, 28%</li>
                    </ul>
                  </div>

                  <div className="pt-4">
                    <Button onClick={() => updateGstSettingsMutation.mutate()} disabled={updateGstSettingsMutation.isPending}>
                      <Save className="mr-2 h-4 w-4" />
                      Save GST Settings
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data">
          <Card>
            <CardHeader>
              <CardTitle>Demo Data</CardTitle>
              <CardDescription>Add sample data to explore the platform features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="font-medium mb-2">What will be added:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• 5 sample customers with contact details</li>
                  <li>• 8 products & services with pricing</li>
                  <li>• 5 invoices (paid, pending, overdue)</li>
                  <li>• 7 expense entries across categories</li>
                </ul>
              </div>
              <Button 
                onClick={() => seedData.mutate()} 
                disabled={seedData.isPending}
                className="w-full"
              >
                {seedData.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding Demo Data...
                  </>
                ) : (
                  <>
                    <Database className="mr-2 h-4 w-4" />
                    Add Demo Data
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Note: Running this multiple times will create duplicate entries
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="updates">
          <div className="space-y-4">
            {/* Current Version Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Monitor className="h-5 w-5" />
                      Current Version
                    </CardTitle>
                    <CardDescription>
                      {isDesktopMode() ? 'Desktop Application' : 'Web Application'}
                    </CardDescription>
                  </div>
                  <Badge variant="default" className="text-lg px-3 py-1">
                    v{FINAL_PRODUCT_MODE.version}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={handleCheckForUpdates}
                  disabled={isCheckingUpdates}
                  className="w-full"
                  size="lg"
                >
                  {isCheckingUpdates ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Checking for Updates...
                    </>
                  ) : updateStatus === 'uptodate' ? (
                    <>
                      <CheckCircle2 className="mr-2 h-5 w-5" />
                      You're Up to Date!
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-5 w-5" />
                      Check for Updates
                    </>
                  )}
                </Button>
                
                {isDesktopMode() && (
                  <p className="text-xs text-muted-foreground text-center">
                    Updates are also checked automatically every 30 minutes
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Version Changelog */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-warning" />
                  What's New
                </CardTitle>
                <CardDescription>Recent updates and improvements</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {VERSION_CHANGELOG.map((release, index) => (
                  <div key={release.version} className="relative">
                    {index > 0 && <Separator className="mb-4" />}
                    <div className="flex items-center gap-3 mb-3">
                      <Badge 
                        variant={release.isNew ? 'default' : 'secondary'}
                        className={release.isNew ? 'bg-success text-success-foreground' : ''}
                      >
                        v{release.version}
                      </Badge>
                      <span className="text-sm text-muted-foreground">{release.date}</span>
                      {release.isNew && (
                        <Badge variant="outline" className="border-success text-success">
                          Latest
                        </Badge>
                      )}
                    </div>
                    <ul className="space-y-2 ml-1">
                      {release.highlights.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
