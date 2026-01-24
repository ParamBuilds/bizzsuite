// Persistent Activation Key Toast - Must be manually closed
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Copy, Download, X, Key, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { downloadLicenseZip } from '@/lib/license-download';

interface ActivationKeyToastProps {
  licenseKey: string;
  isVisible: boolean;
  onClose: () => void;
}

export function ActivationKeyToast({ licenseKey, isVisible, onClose }: ActivationKeyToastProps) {
  const [copied, setCopied] = useState(false);

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

  const handleDownload = () => {
    downloadLicenseZip(licenseKey);
    toast.success('License ZIP downloaded');
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
                  <Key className="h-5 w-5 text-success" />
                  Activation Key Generated
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
              <p className="text-sm text-muted-foreground">
                Your activation key has been generated. Please copy and save it safely.
              </p>

              {/* License Key Display */}
              <div className="p-3 bg-muted rounded-lg border">
                <code className="font-mono text-sm break-all select-all">
                  {licenseKey}
                </code>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2">
                <Button
                  onClick={handleCopy}
                  variant="default"
                  className="w-full"
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
                  onClick={handleDownload}
                  variant="secondary"
                  className="w-full"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download License ZIP
                </Button>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                Key saved to Settings → License & Activation
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
