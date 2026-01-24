import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  ArrowRight, 
  ArrowLeft,
  WifiOff,
  Shield,
  FileText,
  Package,
  ClipboardCheck,
  Key,
  X,
  RotateCcw
} from 'lucide-react';
import { 
  isDemoMode,
  startDemoMode, 
  loadDemoData, 
  resetDemoMode, 
  getDemoData,
  DEMO_WALKTHROUGH_STEPS 
} from '@/lib/demo-mode';

interface DemoLauncherProps {
  onClose?: () => void;
}

export function DemoLauncher({ onClose }: DemoLauncherProps) {
  const navigate = useNavigate();
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsActive(isDemoMode());
  }, []);

  const handleStartDemo = async () => {
    setIsLoading(true);
    try {
      await startDemoMode();
      await loadDemoData();
      setIsActive(true);
      setCurrentStep(0);
    } catch (error) {
      console.error('Failed to start demo:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetDemo = () => {
    resetDemoMode();
    setIsActive(false);
    setCurrentStep(0);
  };

  const handleNext = () => {
    const step = DEMO_WALKTHROUGH_STEPS[currentStep];
    if (step.target) {
      navigate(step.target);
    }
    
    if (currentStep < DEMO_WALKTHROUGH_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleActivate = () => {
    navigate('/pricing');
    onClose?.();
  };

  const progress = ((currentStep + 1) / DEMO_WALKTHROUGH_STEPS.length) * 100;
  const step = DEMO_WALKTHROUGH_STEPS[currentStep];

  const stepIcons: Record<string, React.ReactNode> = {
    welcome: <Play className="h-6 w-6" />,
    dashboard: <FileText className="h-6 w-6" />,
    invoices: <FileText className="h-6 w-6" />,
    inventory: <Package className="h-6 w-6" />,
    audit: <ClipboardCheck className="h-6 w-6" />,
    offline: <WifiOff className="h-6 w-6" />,
    activate: <Key className="h-6 w-6" />
  };

  if (!isActive) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Play className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Try BizSuite Demo</CardTitle>
          <CardDescription>
            Experience the full product without signup, internet, or activation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Shield className="h-4 w-4 text-primary" />
              <span>Realistic sample business data</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <WifiOff className="h-4 w-4 text-primary" />
              <span>Works 100% offline</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <ClipboardCheck className="h-4 w-4 text-primary" />
              <span>Guided feature walkthrough</span>
            </div>
          </div>

          <Button 
            onClick={handleStartDemo} 
            className="w-full" 
            size="lg"
            disabled={isLoading}
          >
            {isLoading ? 'Loading Demo...' : 'Start Demo'}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>

          {onClose && (
            <Button variant="ghost" onClick={onClose} className="w-full">
              Maybe Later
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="mb-2">
            Demo Mode
          </Badge>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={handleResetDemo}>
              <RotateCcw className="h-4 w-4 mr-1" />
              Reset
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <Progress value={progress} className="h-2" />
        <p className="text-xs text-muted-foreground text-right mt-1">
          Step {currentStep + 1} of {DEMO_WALKTHROUGH_STEPS.length}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="text-center py-4"
          >
            <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
              {stepIcons[step.id] || <Play className="h-6 w-6" />}
            </div>
            <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
            <p className="text-muted-foreground">{step.description}</p>
          </motion.div>
        </AnimatePresence>

        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="flex-1"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          
          {currentStep === DEMO_WALKTHROUGH_STEPS.length - 1 ? (
            <Button onClick={handleActivate} className="flex-1">
              <Key className="mr-2 h-4 w-4" />
              Activate License
            </Button>
          ) : (
            <Button onClick={handleNext} className="flex-1">
              {step.target ? 'View & Next' : 'Next'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function DemoModeBanner() {
  const navigate = useNavigate();
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    setIsDemo(isDemoMode());
  }, []);

  if (!isDemo) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-primary text-primary-foreground py-2 px-4 z-50">
      <div className="container flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Play className="h-4 w-4" />
          <span className="text-sm font-medium">Demo Mode Active</span>
          <span className="text-sm opacity-80">— Sample data only</span>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={() => navigate('/pricing')}
          >
            <Key className="mr-2 h-4 w-4" />
            Activate Real License
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => {
              resetDemoMode();
              window.location.reload();
            }}
          >
            Exit Demo
          </Button>
        </div>
      </div>
    </div>
  );
}
