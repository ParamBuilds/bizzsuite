import { useState, useEffect } from 'react';
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
  Wifi, 
  WifiOff, 
  Download, 
  CreditCard, 
  Key, 
  Crown,
  ArrowLeft,
  Smartphone,
  Copy,
  ExternalLink
} from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { activateLicense, generateMonthlyPaymentLink, generateOfflineDownloadPaymentLink, PAYMENT_CONFIG } from '@/lib/subscription';
import { MotionContainer, MotionItem, PageWrapper } from '@/components/ui/motion';

export default function PricingPage() {
  const navigate = useNavigate();
  const { subscription, refresh, isPremium, isTrial, isExpired } = useSubscription();
  const [licenseKey, setLicenseKey] = useState('');
  const [isActivating, setIsActivating] = useState(false);
  const [showPaymentInstructions, setShowPaymentInstructions] = useState<'monthly' | 'offline' | null>(null);

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

  const handlePayment = (type: 'monthly' | 'offline') => {
    const link = type === 'monthly' 
      ? generateMonthlyPaymentLink() 
      : generateOfflineDownloadPaymentLink();
    
    // Try to open UPI intent
    window.open(link, '_blank');
    setShowPaymentInstructions(type);
  };

  const copyUPIId = () => {
    navigator.clipboard.writeText(PAYMENT_CONFIG.upiId);
    toast.success('UPI ID copied to clipboard');
  };

  return (
    <PageWrapper className="max-w-4xl mx-auto space-y-8">
      <MotionContainer>
        <MotionItem>
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="page-header">Pricing & Subscription</h1>
              <p className="page-description">Manage your subscription and billing</p>
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
                    Current Plan
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
                  Your subscription has expired. Upgrade to continue using premium features.
                </p>
              )}
            </CardContent>
          </Card>
        </MotionItem>

        {/* Plans */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Monthly Plan */}
          <MotionItem>
            <Card className="relative overflow-hidden">
              <div className="absolute top-0 right-0 px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-bl-lg">
                Recommended
              </div>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Wifi className="h-5 w-5 text-primary" />
                  <CardTitle>Business Plan</CardTitle>
                </div>
                <CardDescription>Full access with cloud sync</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <span className="text-4xl font-bold">₹{PAYMENT_CONFIG.monthlyPrice}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                
                <ul className="space-y-2 text-sm">
                  {[
                    'Unlimited invoices & reports',
                    'Cloud sync & backup',
                    'Multi-user access',
                    'Priority support',
                    'Email notifications',
                    'Advanced analytics'
                  ].map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-success" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button 
                  className="w-full" 
                  onClick={() => handlePayment('monthly')}
                  disabled={isPremium}
                >
                  <Smartphone className="mr-2 h-4 w-4" />
                  Pay with UPI
                </Button>
              </CardContent>
            </Card>
          </MotionItem>

          {/* Offline Download */}
          <MotionItem>
            <Card className="border-accent/50">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <WifiOff className="h-5 w-5 text-accent" />
                  <CardTitle>Offline Forever</CardTitle>
                </div>
                <CardDescription>Download & own forever</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <span className="text-4xl font-bold">₹{PAYMENT_CONFIG.offlineDownloadPrice}</span>
                  <span className="text-muted-foreground"> one-time</span>
                </div>
                
                <ul className="space-y-2 text-sm">
                  {[
                    'Downloadable ZIP with installer',
                    'Works 100% offline',
                    'Lifetime license key',
                    'No recurring fees',
                    'Local data storage only',
                    'All features included'
                  ].map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Download className="h-4 w-4 text-accent" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button 
                  variant="outline" 
                  className="w-full border-accent text-accent hover:bg-accent hover:text-accent-foreground" 
                  onClick={() => handlePayment('offline')}
                >
                  <Smartphone className="mr-2 h-4 w-4" />
                  Buy with UPI
                </Button>
              </CardContent>
            </Card>
          </MotionItem>
        </div>

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
                
                <div className="flex items-center gap-2 p-3 bg-background rounded-lg border">
                  <span className="font-mono text-sm flex-1">{PAYMENT_CONFIG.upiId}</span>
                  <Button variant="ghost" size="sm" onClick={copyUPIId}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>

                <div className="text-sm space-y-2">
                  <p><strong>Amount:</strong> ₹{showPaymentInstructions === 'monthly' ? PAYMENT_CONFIG.monthlyPrice : PAYMENT_CONFIG.offlineDownloadPrice}</p>
                  <p><strong>Note:</strong> {showPaymentInstructions === 'monthly' ? 'BizSuite Monthly' : 'BizSuite Offline'}</p>
                </div>

                <Separator />

                <p className="text-sm text-muted-foreground">
                  After payment, you'll receive a license key via email within 24 hours. Enter it below to activate.
                </p>
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
                Enter your license key to activate your subscription
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
      </MotionContainer>
    </PageWrapper>
  );
}
