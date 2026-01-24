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
  Copy
} from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { activateLicense, generateOfflineDownloadPaymentLink, PAYMENT_CONFIG } from '@/lib/subscription';
import { MotionContainer, MotionItem, PageWrapper } from '@/components/ui/motion';

export default function PricingPage() {
  const navigate = useNavigate();
  const { subscription, refresh, isPremium, isTrial, isExpired } = useSubscription();
  const [licenseKey, setLicenseKey] = useState('');
  const [isActivating, setIsActivating] = useState(false);
  const [showPaymentInstructions, setShowPaymentInstructions] = useState(false);

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
    } else {
      toast.error(result.message);
    }
  };

  const handlePayment = () => {
    const link = generateOfflineDownloadPaymentLink();
    
    // Check if on mobile device
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    
    if (isMobile) {
      // On mobile, try to open UPI intent directly
      window.location.href = link;
    }
    
    // Always show payment instructions (for desktop or as fallback on mobile)
    setShowPaymentInstructions(true);
  };

  const copyUPIId = () => {
    navigator.clipboard.writeText(PAYMENT_CONFIG.upiId);
    toast.success('UPI ID copied to clipboard');
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
        <MotionItem>
          <Card className="relative overflow-hidden border-2 border-primary/50">
            <div className="absolute top-0 right-0 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-bl-xl">
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
                  className="w-full text-lg py-6" 
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
        </MotionItem>

        {/* Payment Instructions */}
        {showPaymentInstructions && (
          <MotionItem>
            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Instructions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  If the UPI app didn't open automatically, you can pay manually:
                </p>
                
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

                <div className="bg-primary/10 p-4 rounded-lg">
                  <p className="text-sm">
                    <strong>After payment:</strong> You'll receive a license key via email within 24 hours. 
                    Enter it below to activate your lifetime license and get the download link.
                  </p>
                </div>
              </CardContent>
            </Card>
          </MotionItem>
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
                  Download Your Offline Version
                </CardTitle>
                <CardDescription>
                  Your lifetime license is active. Download BizSuite now!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  size="lg"
                  className="w-full bg-success hover:bg-success/90 text-success-foreground"
                  onClick={() => toast.info('Download link will be sent to your email')}
                >
                  <Download className="mr-2 h-5 w-5" />
                  Download BizSuite Offline (ZIP)
                </Button>
              </CardContent>
            </Card>
          </MotionItem>
        )}
      </MotionContainer>
    </PageWrapper>
  );
}