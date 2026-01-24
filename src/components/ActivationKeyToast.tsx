// Persistent Activation Key Toast - Must be manually closed
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Copy, Download, X, CheckCircle2, Monitor, FileText, HelpCircle, AlertTriangle, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { downloadLicenseZip } from '@/lib/license-download';
import { downloadInstaller, downloadInstallGuide, getInstallerInfo, detectPlatform, INSTALLER_CONFIG } from '@/lib/installer-download';
import { useNavigate } from 'react-router-dom';

interface ActivationKeyToastProps {
  licenseKey: string;
  isVisible: boolean;
  onClose: () => void;
}

export function ActivationKeyToast({ licenseKey, isVisible, onClose }: ActivationKeyToastProps) {
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();
  const platform = detectPlatform();
  const installer = getInstallerInfo(platform);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(licenseKey);
      setCopied(true);
      toast.success('License key copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy. Please copy manually.');
    }
  };

  const handleDownloadInstaller = () => {
    const success = downloadInstaller(platform === 'pwa' ? 'windows' : platform);
    if (success) {
      toast.success('Installer download started');
    } else {
      toast.error('Installer not available yet. Please contact support.');
    }
  };

  const handleDownloadGuide = () => {
    downloadInstallGuide();
    toast.success('Install guide downloaded');
  };

  const handleDownloadLicense = () => {
    downloadLicenseZip(licenseKey);
    toast.success('License file downloaded');
  };

  // Respect reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const slideVariants = prefersReducedMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, x: 100, y: 0 },
        animate: { opacity: 1, x: 0, y: 0 },
        exit: { opacity: 0, x: 100, y: 0 }
      };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed bottom-4 right-4 z-[100] max-w-md"
          variants={slideVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          <Card className="border-2 border-success/50 bg-card shadow-xl">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                  Payment Successful!
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  onClick={onClose}
                  aria-label="Close notification"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Step 1: Download Installer - PRIMARY ACTION */}
              <div className="p-3 bg-success/10 rounded-lg border border-success/20">
                <p className="text-sm font-medium mb-2 flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-success text-success-foreground text-xs font-bold">1</span>
                  Download & Install the Software
                </p>
                {installer.isAvailable ? (
                  <Button
                    onClick={handleDownloadInstaller}
                    className="w-full bg-success hover:bg-success/90 text-success-foreground"
                  >
                    <Monitor className="mr-2 h-4 w-4" />
                    Download Installer ({installer.fileName})
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-warning bg-warning/10 p-2 rounded border border-warning/20">
                      <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                      <span>Installer not available yet. Please contact support.</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      asChild
                    >
                      <a href={`mailto:${INSTALLER_CONFIG.supportEmail}?subject=BizSuite%20Installer%20Request&body=Hi%2C%0A%0AI%20purchased%20BizSuite%20and%20need%20the%20installer.%0A%0AMy%20license%20key%3A%20${licenseKey}%0A%0A`}>
                        <Mail className="mr-2 h-4 w-4" />
                        Contact Support
                      </a>
                    </Button>
                  </div>
                )}
              </div>

              {/* Step 2: Activation Key */}
              <div className="space-y-2">
                <p className="text-sm font-medium flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-muted-foreground text-xs font-bold">2</span>
                  Your Activation Key
                </p>
                <div className="p-3 bg-muted rounded-lg border">
                  <code className="font-mono text-sm break-all select-all">
                    {licenseKey}
                  </code>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleCopy}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    {copied ? (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="mr-2 h-4 w-4" />
                        Copy Key
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={handleDownloadLicense}
                    variant="ghost"
                    size="sm"
                    className="flex-1"
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    License File
                  </Button>
                </div>
              </div>

              {/* Optional: Install Guide */}
              <div className="flex gap-2">
                <Button
                  onClick={handleDownloadGuide}
                  variant="ghost"
                  size="sm"
                  className="flex-1 text-muted-foreground"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Install Guide (optional)
                </Button>
              </div>

              {/* Help Link */}
              <button
                onClick={() => {
                  navigate('/how-installation-works');
                  onClose();
                }}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors w-full justify-center"
              >
                <HelpCircle className="h-3 w-3" />
                How installation works
              </button>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
