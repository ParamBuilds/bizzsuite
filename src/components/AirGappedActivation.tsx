import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from 'sonner';
import { 
  WifiOff, 
  Upload, 
  FileJson, 
  Key, 
  CheckCircle2, 
  AlertTriangle,
  Download,
  HelpCircle,
  Shield
} from 'lucide-react';
import { 
  importLicenseFile, 
  isAirGappedMode, 
  downloadSampleLicense,
  LicenseFile
} from '@/lib/air-gapped-activation';
import { activateLicense } from '@/lib/subscription';

interface AirGappedActivationProps {
  onActivated?: () => void;
}

export function AirGappedActivation({ onActivated }: AirGappedActivationProps) {
  const [isImporting, setIsImporting] = useState(false);
  const [licenseKey, setLicenseKey] = useState('');
  const [isActivating, setIsActivating] = useState(false);
  const [importedLicense, setImportedLicense] = useState<LicenseFile | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const result = await importLicenseFile(file);
      
      if (result.success) {
        toast.success(result.message);
        setImportedLicense(result.license || null);
        onActivated?.();
      } else {
        toast.error(result.message);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to import license');
    } finally {
      setIsImporting(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleManualActivation = async () => {
    if (!licenseKey.trim()) {
      toast.error('Please enter a license key');
      return;
    }

    setIsActivating(true);
    try {
      const result = await activateLicense(licenseKey);
      
      if (result.success) {
        toast.success(result.message);
        localStorage.setItem('air-gapped-mode', 'true');
        onActivated?.();
      } else {
        toast.error(result.message);
      }
    } catch (error: any) {
      toast.error(error.message || 'Activation failed');
    } finally {
      setIsActivating(false);
    }
  };

  const handleDownloadSample = () => {
    downloadSampleLicense();
    toast.success('Sample license file downloaded');
  };

  const isAirGapped = isAirGappedMode();

  return (
    <div className="space-y-6">
      {/* Air-Gapped Mode Badge */}
      {isAirGapped && (
        <Alert className="border-primary/50 bg-primary/5">
          <Shield className="h-4 w-4" />
          <AlertTitle className="flex items-center gap-2">
            Air-Gapped Mode Active
            <Badge variant="secondary" className="ml-2">Secure</Badge>
          </AlertTitle>
          <AlertDescription>
            This installation is configured for air-gapped environments. No internet connection is required.
          </AlertDescription>
        </Alert>
      )}

      {/* Import License File */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileJson className="h-5 w-5 text-primary" />
            Import License File
          </CardTitle>
          <CardDescription>
            For air-gapped environments - import a license.json file
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleFileImport}
              className="hidden"
              id="license-file-input"
            />
            <label 
              htmlFor="license-file-input" 
              className="cursor-pointer flex flex-col items-center gap-3"
            >
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                <Upload className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">Drop license.json here or click to browse</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Supports .json license files
                </p>
              </div>
            </label>
          </div>

          {isImporting && (
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
              <span>Verifying license...</span>
            </div>
          )}

          {importedLicense && (
            <Alert className="border-success/50 bg-success/5">
              <CheckCircle2 className="h-4 w-4 text-success" />
              <AlertTitle>License Imported Successfully</AlertTitle>
              <AlertDescription className="space-y-1">
                <p>Key: <code className="text-xs bg-muted px-1 rounded">{importedLicense.licenseKey}</code></p>
                <p>Expires: {new Date(importedLicense.expiresAt).toLocaleDateString('en-IN')}</p>
                <p>Device Limit: {importedLicense.deviceLimit}</p>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Manual Activation Code */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5 text-primary" />
            Manual Activation Code
          </CardTitle>
          <CardDescription>
            Enter the license key manually if you don't have a file
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="manual-license-key">License Key</Label>
              <Input
                id="manual-license-key"
                placeholder="BZSUITE-XXXX-XXXX-XXXX-XXXX"
                value={licenseKey}
                onChange={(e) => setLicenseKey(e.target.value.toUpperCase())}
                className="font-mono"
              />
            </div>
            <div className="flex items-end">
              <Button 
                onClick={handleManualActivation} 
                disabled={isActivating || !licenseKey.trim()}
              >
                {isActivating ? 'Activating...' : 'Activate'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Help Section */}
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle 
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => setShowHelp(!showHelp)}
          >
            <HelpCircle className="h-5 w-5 text-muted-foreground" />
            Air-Gapped Activation Help
            <Badge variant="outline" className="ml-auto">
              {showHelp ? 'Hide' : 'Show'}
            </Badge>
          </CardTitle>
        </CardHeader>
        {showHelp && (
          <CardContent className="space-y-4">
            <div className="space-y-3 text-sm">
              <h4 className="font-semibold">What is Air-Gapped Mode?</h4>
              <p className="text-muted-foreground">
                Air-gapped mode allows BizSuite to run in environments with no internet access, 
                such as factory floors, secure offices, or remote locations.
              </p>

              <Separator />

              <h4 className="font-semibold">How to Activate Offline:</h4>
              <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                <li>Purchase a license on a computer with internet</li>
                <li>Download the license.json file from your email</li>
                <li>Transfer the file to the offline machine (USB, network share)</li>
                <li>Import the license.json file above</li>
                <li>Your installation is now activated offline!</li>
              </ol>

              <Separator />

              <h4 className="font-semibold">For Testing:</h4>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleDownloadSample}
                className="mt-2"
              >
                <Download className="mr-2 h-4 w-4" />
                Download Sample License File
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                This generates a test license for demonstration purposes.
              </p>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
