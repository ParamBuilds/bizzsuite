// Guided Activation Wizard for Phase 3.2
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  CheckCircle2,
  Key,
  Smartphone,
  Download,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Shield,
  WifiOff,
  Copy,
  ChevronRight
} from 'lucide-react';
import { activateLicense } from '@/lib/subscription';
import { registerCurrentDevice, getDeviceSlots, Device } from '@/lib/device-manager';

interface WizardProps {
  onComplete: () => void;
  onSkip: () => void;
}

type WizardStep = 'welcome' | 'license' | 'device' | 'download' | 'complete';

const STEPS: { id: WizardStep; title: string; description: string }[] = [
  { id: 'welcome', title: 'Welcome', description: 'Introduction to BizSuite Offline' },
  { id: 'license', title: 'Enter License', description: 'Activate your license key' },
  { id: 'device', title: 'Register Device', description: 'Register this device' },
  { id: 'download', title: 'Download', description: 'Get your offline copy' },
  { id: 'complete', title: 'Complete', description: 'You\'re all set!' }
];

export function ActivationWizard({ onComplete, onSkip }: WizardProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>('welcome');
  const [licenseKey, setLicenseKey] = useState('');
  const [isActivating, setIsActivating] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [deviceName, setDeviceName] = useState('');
  const [registeredDevice, setRegisteredDevice] = useState<Device | null>(null);
  const [deviceSlots, setDeviceSlots] = useState({ used: 0, total: 3, remaining: 3 });

  const currentStepIndex = STEPS.findIndex(s => s.id === currentStep);
  const progress = ((currentStepIndex + 1) / STEPS.length) * 100;

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
      setCurrentStep('device');
    } else {
      toast.error(result.message);
    }
  };

  const handleRegisterDevice = async () => {
    setIsRegistering(true);
    const result = await registerCurrentDevice(deviceName || undefined);
    const slots = await getDeviceSlots();
    setIsRegistering(false);

    if (result.success) {
      setRegisteredDevice(result.device || null);
      setDeviceSlots(slots);
      toast.success(result.message);
      setCurrentStep('download');
    } else {
      toast.error(result.message);
    }
  };

  const goToStep = (step: WizardStep) => {
    setCurrentStep(step);
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0
    })
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-2xl"
      >
        <Card className="border-2 shadow-2xl">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between mb-4">
              <Badge variant="secondary" className="text-sm">
                Step {currentStepIndex + 1} of {STEPS.length}
              </Badge>
              <Button variant="ghost" size="sm" onClick={onSkip}>
                Skip Setup
              </Button>
            </div>
            <Progress value={progress} className="h-2 mb-4" />
            <div className="flex justify-between text-xs text-muted-foreground mb-2">
              {STEPS.map((step, idx) => (
                <span
                  key={step.id}
                  className={idx <= currentStepIndex ? 'text-primary font-medium' : ''}
                >
                  {step.title}
                </span>
              ))}
            </div>
          </CardHeader>

          <CardContent className="min-h-[400px] flex flex-col">
            <AnimatePresence mode="wait" custom={1}>
              {/* Welcome Step */}
              {currentStep === 'welcome' && (
                <motion.div
                  key="welcome"
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  custom={1}
                  className="flex-1 flex flex-col"
                >
                  <div className="text-center space-y-6 flex-1 flex flex-col justify-center">
                    <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                      <Sparkles className="h-10 w-10 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold mb-2">Welcome to BizSuite Offline</h2>
                      <p className="text-muted-foreground max-w-md mx-auto">
                        Let's set up your offline-first business suite. This wizard will guide you through
                        license activation and device registration.
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
                      <div className="text-center p-4 rounded-lg bg-muted/50">
                        <WifiOff className="h-6 w-6 mx-auto mb-2 text-primary" />
                        <span className="text-sm">Works Offline</span>
                      </div>
                      <div className="text-center p-4 rounded-lg bg-muted/50">
                        <Shield className="h-6 w-6 mx-auto mb-2 text-primary" />
                        <span className="text-sm">Secure</span>
                      </div>
                      <div className="text-center p-4 rounded-lg bg-muted/50">
                        <Key className="h-6 w-6 mx-auto mb-2 text-primary" />
                        <span className="text-sm">Lifetime License</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end pt-6">
                    <Button onClick={() => goToStep('license')}>
                      Get Started <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* License Step */}
              {currentStep === 'license' && (
                <motion.div
                  key="license"
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  custom={1}
                  className="flex-1 flex flex-col"
                >
                  <div className="space-y-6 flex-1">
                    <div className="text-center">
                      <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                        <Key className="h-8 w-8 text-primary" />
                      </div>
                      <h2 className="text-xl font-bold">Activate Your License</h2>
                      <p className="text-muted-foreground">
                        Enter the license key you received after purchase
                      </p>
                    </div>

                    <div className="max-w-md mx-auto space-y-4">
                      <div>
                        <Label htmlFor="wizard-license">License Key</Label>
                        <Input
                          id="wizard-license"
                          placeholder="BZSUITE-XXXX-XXXX-XXXX-XXXX"
                          value={licenseKey}
                          onChange={(e) => setLicenseKey(e.target.value.toUpperCase())}
                          className="font-mono text-center text-lg h-12"
                        />
                      </div>
                      
                      <Button 
                        className="w-full" 
                        onClick={handleActivateLicense}
                        disabled={isActivating || !licenseKey.trim()}
                      >
                        {isActivating ? 'Activating...' : 'Activate License'}
                      </Button>
                    </div>
                  </div>

                  <div className="flex justify-between pt-6">
                    <Button variant="ghost" onClick={() => goToStep('welcome')}>
                      <ArrowLeft className="mr-2 h-4 w-4" /> Back
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Device Step */}
              {currentStep === 'device' && (
                <motion.div
                  key="device"
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  custom={1}
                  className="flex-1 flex flex-col"
                >
                  <div className="space-y-6 flex-1">
                    <div className="text-center">
                      <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                        <Smartphone className="h-8 w-8 text-primary" />
                      </div>
                      <h2 className="text-xl font-bold">Register This Device</h2>
                      <p className="text-muted-foreground">
                        Your license supports up to 3 devices
                      </p>
                    </div>

                    <div className="max-w-md mx-auto space-y-4">
                      <div>
                        <Label htmlFor="device-name">Device Name (Optional)</Label>
                        <Input
                          id="device-name"
                          placeholder="e.g., Office Laptop, Home PC"
                          value={deviceName}
                          onChange={(e) => setDeviceName(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Give this device a friendly name for easy identification
                        </p>
                      </div>
                      
                      <Button 
                        className="w-full" 
                        onClick={handleRegisterDevice}
                        disabled={isRegistering}
                      >
                        {isRegistering ? 'Registering...' : 'Register Device'}
                      </Button>

                      <div className="text-center text-sm text-muted-foreground">
                        Device slots: {deviceSlots.used} / {deviceSlots.total} used
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between pt-6">
                    <Button variant="ghost" onClick={() => goToStep('license')}>
                      <ArrowLeft className="mr-2 h-4 w-4" /> Back
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Download Step */}
              {currentStep === 'download' && (
                <motion.div
                  key="download"
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  custom={1}
                  className="flex-1 flex flex-col"
                >
                  <div className="space-y-6 flex-1">
                    <div className="text-center">
                      <div className="mx-auto w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mb-4">
                        <Download className="h-8 w-8 text-success" />
                      </div>
                      <h2 className="text-xl font-bold">Download Your Offline Copy</h2>
                      <p className="text-muted-foreground">
                        Download the installable version for true offline usage
                      </p>
                    </div>

                    <div className="max-w-md mx-auto space-y-4">
                      {registeredDevice && (
                        <div className="p-4 rounded-lg bg-muted/50 text-center">
                          <p className="text-sm text-muted-foreground">Registered as</p>
                          <p className="font-medium">{registeredDevice.device_name}</p>
                        </div>
                      )}
                      
                      <Button 
                        className="w-full bg-success hover:bg-success/90" 
                        size="lg"
                        onClick={() => {
                          toast.info('Download link will be sent to your registered email');
                          setTimeout(() => goToStep('complete'), 1500);
                        }}
                      >
                        <Download className="mr-2 h-5 w-5" />
                        Download BizSuite (ZIP)
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => goToStep('complete')}
                      >
                        Skip Download <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex justify-between pt-6">
                    <Button variant="ghost" onClick={() => goToStep('device')}>
                      <ArrowLeft className="mr-2 h-4 w-4" /> Back
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Complete Step */}
              {currentStep === 'complete' && (
                <motion.div
                  key="complete"
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  custom={1}
                  className="flex-1 flex flex-col justify-center"
                >
                  <div className="text-center space-y-6">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', delay: 0.2 }}
                      className="mx-auto w-24 h-24 rounded-full bg-success/10 flex items-center justify-center"
                    >
                      <CheckCircle2 className="h-12 w-12 text-success" />
                    </motion.div>
                    
                    <div>
                      <h2 className="text-2xl font-bold mb-2">You're All Set!</h2>
                      <p className="text-muted-foreground max-w-md mx-auto">
                        Your BizSuite is now activated and ready for offline use. 
                        Your data is stored locally and will work even without internet.
                      </p>
                    </div>

                    <Button size="lg" onClick={onComplete}>
                      Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
