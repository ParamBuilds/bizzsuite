import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { 
  CheckCircle2, 
  WifiOff, 
  Download, 
  CreditCard, 
  Key, 
  Crown,
  ArrowLeft,
  Smartphone,
  Copy,
  Mail,
  HelpCircle
} from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { activateLicense, generateOfflineDownloadPaymentLink, PAYMENT_CONFIG } from '@/lib/subscription';
import { MotionContainer, MotionItem, PageWrapper } from '@/components/ui/motion';
import { ActivationKeyToast } from '@/components/ActivationKeyToast';
import { generateActivationKey } from '@/lib/license-download';
import { downloadInstaller, getInstallerInfo, detectPlatform, getAllInstallers } from '@/lib/installer-download';

export default function PricingPage() {
  const navigate = useNavigate();
  const { subscription, refresh, isPremium, isTrial, isExpired } = useSubscription();
  const [licenseKey, setLicenseKey] = useState('');
  const [isActivating, setIsActivating] = useState(false);
  const [showPaymentInstructions, setShowPaymentInstructions] = useState(false);
  const [activationToast, setActivationToast] = useState<{ visible: boolean; key: string }>({
    visible: false,
    key: ''
  });

  const handleActivateLicense = async () => {
    if (!licenseKey.trim()) {
      toast.error('Please enter a license key');
      return;
    }

    setIsActivating(true);
    const result = await activateLicense(licenseKey);
    setIsActivating(false);

    if (result.success) {
      toast.success(result.message);
      await refresh();
      setLicenseKey('');
      // Show the activation key toast for the activated key
      setActivationToast({ visible: true, key: licenseKey });
      // Store the key for recovery
      localStorage.setItem('last-activated-key', licenseKey);
    } else {
      toast.error(result.message);
    }
  };

  // Simulate payment success - in production this would be triggered by payment webhook
  const handlePaymentSuccess = async () => {
    const newKey = generateActivationKey();
    
    // Activate the license immediately
    const result = await activateLicense(newKey);
    
    if (result.success) {
      await refresh();
      // Show the persistent activation toast
      setActivationToast({ visible: true, key: newKey });
      // Store the key for recovery
      localStorage.setItem('last-activated-key', newKey);
      localStorage.setItem('license-generated-at', new Date().toISOString());
    } else {
      toast.error('Failed to generate license. Please contact support.');
    }
  };

  const closeActivationToast = () => {
    setActivationToast(prev => ({ ...prev, visible: false }));
  };

  const handlePayment = () => {
    setShowPaymentInstructions(true);
    toast.info('Follow the payment steps below to complete your UPI payment.');
    window.setTimeout(() => {
      document.getElementById('payment-instructions')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 0);
  };

  const copyUPIId = () => {
    navigator.clipboard.writeText(PAYMENT_CONFIG.upiId);
    toast.success('UPI ID copied to clipboard');
  };

  const copyUPILink = () => {
    const link = generateOfflineDownloadPaymentLink();
    navigator.clipboard.writeText(link);
    toast.success('UPI payment link copied');
  };

  const openUPIApp = () => {
    const link = generateOfflineDownloadPaymentLink();
    window.location.href = link;
  };

  return (
    <PageWrapper className="max-w-3xl mx-auto space-y-8">
      <MotionContainer>
        <MotionItem>
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="page-header">Get BizSuite Offline Forever</h1>
              <p className="page-description">One-time payment, lifetime access</p>
            </div>
          </div>
        </MotionItem>

        {/* Current Status */}
        <MotionItem>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="h-5 w-5 text-warning" />
                    Current Status
                  </CardTitle>
                  <CardDescription>Your subscription status</CardDescription>
                </div>
                <Badge variant={isPremium ? 'default' : isTrial ? 'secondary' : 'destructive'}>
                  {isPremium ? 'Active' : isTrial ? 'Trial' : 'Expired'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {isTrial && subscription && (
                <p className="text-muted-foreground">
                  Your trial expires in <span className="font-semibold text-foreground">{subscription.trialDaysRemaining} days</span>
                </p>
              )}
              {isPremium && subscription?.expiresAt && (
                <p className="text-muted-foreground">
                  Active until <span className="font-semibold text-foreground">{new Date(subscription.expiresAt).toLocaleDateString('en-IN')}</span>
                </p>
              )}
              {isExpired && (
                <p className="text-destructive">
                  Your subscription has expired. Purchase the offline version to continue using all features.
                </p>
              )}
            </CardContent>
          </Card>
        </MotionItem>

        {/* Offline Forever Plan */}
        <div>
          <Card className="relative overflow-hidden border-2 border-primary/50">
            <div className="absolute top-0 right-0 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-bl-xl z-10">
              Best Value
            </div>
            <CardHeader>
              <div className="flex items-center gap-2">
                <WifiOff className="h-6 w-6 text-primary" />
                <CardTitle className="text-2xl">Offline Forever</CardTitle>
              </div>
              <CardDescription>Download & own forever - works 100% offline</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <span className="text-5xl font-bold">₹{PAYMENT_CONFIG.offlineDownloadPrice.toLocaleString('en-IN')}</span>
                <span className="text-muted-foreground ml-2">one-time payment</span>
              </div>
              
              <ul className="space-y-3">
                {[
                  'Downloadable ZIP with installer',
                  'Works 100% offline - no internet needed',
                  'Lifetime license key',
                  'All features included',
                  'No recurring fees ever',
                  'Local data storage - your data stays with you',
                  'Free updates for 1 year'
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="pt-4">
                <Button 
                  size="lg"
                  className="w-full text-lg py-6 relative z-20" 
                  onClick={handlePayment}
                  disabled={isPremium}
                >
                  <Smartphone className="mr-2 h-5 w-5" />
                  Pay ₹{PAYMENT_CONFIG.offlineDownloadPrice.toLocaleString('en-IN')} with UPI
                </Button>
                <p className="text-center text-sm text-muted-foreground mt-2">
                  Supports Google Pay, PhonePe, Paytm & all UPI apps
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment Instructions */}
        {showPaymentInstructions && (
          <div id="payment-instructions">
            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Instructions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Use the options below to pay via UPI:
                </p>

                <div className="flex flex-col sm:flex-row gap-2">
                  <Button onClick={openUPIApp} className="w-full" type="button">
                    Open UPI App
                  </Button>
                  <Button onClick={copyUPILink} variant="secondary" className="w-full" type="button">
                    Copy UPI Link
                  </Button>
                </div>
                
                <div className="flex items-center gap-2 p-4 bg-background rounded-lg border">
                  <span className="font-mono text-lg flex-1">{PAYMENT_CONFIG.upiId}</span>
                  <Button variant="ghost" size="sm" onClick={copyUPIId}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>

                <div className="text-sm space-y-2 p-4 bg-background rounded-lg border">
                  <p><strong>Amount:</strong> ₹{PAYMENT_CONFIG.offlineDownloadPrice.toLocaleString('en-IN')}</p>
                  <p><strong>Note:</strong> BizSuite Offline - Lifetime</p>
                </div>

                <Separator />

                <div className="bg-success/10 p-4 rounded-lg border border-success/20">
                  <p className="text-sm font-medium mb-3">
                    <strong>Complete Payment Instantly:</strong>
                  </p>
                  <Button 
                    onClick={handlePaymentSuccess}
                    className="w-full bg-success hover:bg-success/90 text-success-foreground"
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    I've Completed Payment - Generate My License
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    Your license key will appear immediately after clicking
                  </p>
                </div>

                {/* Support Section */}
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg border">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Need help with payment?</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                  >
                    <a href={`mailto:${PAYMENT_CONFIG.supportEmail}?subject=BizSuite%20Payment%20Support&body=Hi%2C%0A%0AI%20need%20help%20with%20my%20BizSuite%20Offline%20payment.%0A%0A`}>
                      <Mail className="mr-2 h-4 w-4" />
                      Contact Support
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* License Activation */}
        <MotionItem>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Activate License Key
              </CardTitle>
              <CardDescription>
                Enter your license key to activate lifetime access
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="license-key">License Key</Label>
                  <Input
                    id="license-key"
                    placeholder="BZSUITE-XXXX-XXXX-XXXX-XXXX"
                    value={licenseKey}
                    onChange={(e) => setLicenseKey(e.target.value.toUpperCase())}
                    className="font-mono"
                  />
                </div>
                <div className="flex items-end">
                  <Button 
                    onClick={handleActivateLicense} 
                    disabled={isActivating || !licenseKey.trim()}
                  >
                    {isActivating ? 'Activating...' : 'Activate'}
                  </Button>
                </div>
              </div>
              
              {subscription?.licenseKey && (
                <p className="text-sm text-muted-foreground">
                  Current license: <code className="text-xs bg-muted px-2 py-1 rounded">{subscription.licenseKey}</code>
                </p>
              )}
            </CardContent>
          </Card>
        </MotionItem>

        {/* Download Section - Only show if activated */}
        {isPremium && (
          <MotionItem>
            <Card className="border-success/50 bg-success/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-success">
                  <Download className="h-5 w-5" />
                  Download Your Software
                </CardTitle>
                <CardDescription>
                  Your lifetime license is active. Download and install BizSuite!
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Installation Steps */}
                <div className="text-sm text-muted-foreground space-y-1 mb-4">
                  <p><strong>Step 1:</strong> Download and install the software</p>
                  <p><strong>Step 2:</strong> Open the app locally</p>
                  <p><strong>Step 3:</strong> Activate using your key or license file</p>
                </div>

{/* Primary Download Button */}
                <Button 
                  size="lg"
                  className="w-full bg-success hover:bg-success/90 text-success-foreground"
                  onClick={() => {
                    const platform = detectPlatform();
                    const result = downloadInstaller(platform === 'pwa' ? 'windows' : platform);
                    if (result.success) {
                      toast.success('Installer download started');
                    } else {
                      toast.error(result.message || 'Installer not available. Please contact support.');
                    }
                  }}
                >
                  <Download className="mr-2 h-5 w-5" />
                  Download Installer ({getInstallerInfo().fileName})
                </Button>

                {/* Other Platforms */}
                <div className="flex flex-wrap gap-2 justify-center">
                  {getAllInstallers().map((installer) => (
                    <Button
                      key={installer.platform}
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const result = downloadInstaller(installer.platform);
                        if (result.success) {
                          toast.success(`${installer.platform} installer download started`);
                        } else {
                          toast.error(result.message || 'Installer not available.');
                        }
                      }}
                    >
                      {installer.platform.charAt(0).toUpperCase() + installer.platform.slice(1)}
                    </Button>
                  ))}
                </div>

                <Separator />

                {/* License Key Display */}
                {subscription?.licenseKey && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Your Activation Key:</p>
                    <div className="flex items-center gap-2 p-3 bg-muted rounded-lg border">
                      <code className="font-mono text-sm flex-1 break-all">{subscription.licenseKey}</code>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(subscription.licenseKey || '');
                          toast.success('Key copied to clipboard');
                        }}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </MotionItem>
        )}
      </MotionContainer>

      {/* Persistent Activation Key Toast */}
      <ActivationKeyToast
        licenseKey={activationToast.key}
        isVisible={activationToast.visible}
        onClose={closeActivationToast}
      />
    </PageWrapper>
  );
}