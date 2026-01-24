// How Installation Works - Plain Language Documentation
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Download, 
  Package, 
  Play, 
  Key, 
  WifiOff,
  CheckCircle2,
  AlertCircle,
  FileText,
  Monitor,
  Smartphone
} from 'lucide-react';
import { PageWrapper, MotionContainer, MotionItem } from '@/components/ui/motion';
import { INSTALLATION_STEPS, getAllInstallers, detectPlatform } from '@/lib/installer-download';

const stepIcons = {
  download: Download,
  package: Package,
  play: Play,
  key: Key
};

export default function HowInstallationWorksPage() {
  const navigate = useNavigate();
  const installers = getAllInstallers();
  const currentPlatform = detectPlatform();

  return (
    <PageWrapper className="max-w-4xl mx-auto space-y-8">
      <MotionContainer>
        <MotionItem>
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="page-header flex items-center gap-2">
                <Package className="h-6 w-6" />
                How Installation Works
              </h1>
              <p className="page-description">
                Simple steps to download, install, and own your software
              </p>
            </div>
          </div>
        </MotionItem>

        {/* Key Concept */}
        <MotionItem>
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <WifiOff className="h-5 w-5 text-primary" />
                Offline Ownership
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-lg">
                BizSuite is <strong>real software</strong> that you download and install on your computer.
                After activation, it works 100% offline — forever.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">No subscription required</Badge>
                <Badge variant="secondary">No internet needed</Badge>
                <Badge variant="secondary">Your data stays local</Badge>
              </div>
            </CardContent>
          </Card>
        </MotionItem>

        {/* Installation Steps */}
        <MotionItem>
          <Card>
            <CardHeader>
              <CardTitle>Installation Steps</CardTitle>
              <CardDescription>
                Follow these simple steps to get started
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {INSTALLATION_STEPS.map((step, index) => {
                const IconComponent = stepIcons[step.icon as keyof typeof stepIcons];
                return (
                  <div key={step.step} className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                        {step.step}
                      </div>
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <IconComponent className="h-4 w-4 text-muted-foreground" />
                        <h4 className="font-semibold">{step.title}</h4>
                      </div>
                      <p className="text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </MotionItem>

        {/* Installer vs License File */}
        <MotionItem>
          <Card>
            <CardHeader>
              <CardTitle>Understanding the Downloads</CardTitle>
              <CardDescription>
                Two different files serve different purposes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Installer */}
              <div className="p-4 bg-success/10 rounded-lg border border-success/20">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-success/20 rounded-lg">
                    <Monitor className="h-6 w-6 text-success" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-success mb-1">
                      Installer (Primary Download)
                    </h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      This is the actual program. Download and run it to install BizSuite on your computer.
                    </p>
                    <ul className="text-sm space-y-1">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-success" />
                        Contains the full application
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-success" />
                        Runs without internet
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-success" />
                        No license needed to install
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* License File */}
              <div className="p-4 bg-muted/50 rounded-lg border">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-muted rounded-lg">
                    <FileText className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">
                      License File (Optional Backup)
                    </h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      A small JSON file containing your activation key. Use it for backup or air-gapped activation.
                    </p>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        Not the program itself
                      </li>
                      <li className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        Not required for installation
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-success" />
                        Useful for offline activation
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </MotionItem>

        {/* Available Platforms */}
        <MotionItem>
          <Card>
            <CardHeader>
              <CardTitle>Available Platforms</CardTitle>
              <CardDescription>
                Download for your operating system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-3">
                {installers.map((installer) => (
                  <div 
                    key={installer.platform}
                    className={`p-4 rounded-lg border ${
                      installer.platform === currentPlatform 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium capitalize">{installer.platform}</span>
                      {installer.platform === currentPlatform && (
                        <Badge variant="default" className="text-xs">Detected</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{installer.fileName}</p>
                    <p className="text-xs text-muted-foreground mt-1">{installer.size}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </MotionItem>

        {/* Offline Guarantee */}
        <MotionItem>
          <Card className="border-success/30 bg-success/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-success">
                <WifiOff className="h-5 w-5" />
                Offline Guarantee
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                After installation and activation, your software:
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {[
                  'Launches without internet',
                  'All paid features available',
                  'No server calls required',
                  'No background checks',
                  'License validates locally',
                  'Data stays on your device'
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </MotionItem>

        {/* CTA */}
        <MotionItem>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={() => navigate('/pricing')} size="lg">
              <Download className="mr-2 h-5 w-5" />
              Get BizSuite
            </Button>
            <Button onClick={() => navigate('/settings')} variant="outline" size="lg">
              <Key className="mr-2 h-5 w-5" />
              Activate License
            </Button>
          </div>
        </MotionItem>
      </MotionContainer>
    </PageWrapper>
  );
}
