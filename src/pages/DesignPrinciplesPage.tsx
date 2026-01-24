// Design Principles Page - Read-Only Documentation
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Shield, 
  Ban, 
  CheckCircle2, 
  Target,
  BookOpen,
  AlertTriangle
} from 'lucide-react';
import { DESIGN_DOCTRINE, FINAL_PRODUCT_MODE } from '@/lib/final-product-mode';
import { PageWrapper, MotionContainer, MotionItem } from '@/components/ui/motion';

export default function DesignPrinciplesPage() {
  const navigate = useNavigate();

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
                <BookOpen className="h-6 w-6" />
                Design Principles
              </h1>
              <p className="page-description">
                Core philosophy and boundaries of this product
              </p>
            </div>
            <Badge variant="secondary" className="ml-auto">
              v{FINAL_PRODUCT_MODE.version}
            </Badge>
          </div>
        </MotionItem>

        {/* Product Purpose */}
        <MotionItem>
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Product Purpose
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-medium">
                {DESIGN_DOCTRINE.productPurpose}
              </p>
            </CardContent>
          </Card>
        </MotionItem>

        {/* Core Philosophy */}
        <MotionItem>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Core Philosophy
              </CardTitle>
              <CardDescription>
                Guiding principles that inform every decision
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {DESIGN_DOCTRINE.corePhilosophy.map((principle, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
                  >
                    <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0" />
                    <span className="font-medium">{principle}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </MotionItem>

        {/* What NOT to Build */}
        <MotionItem>
          <Card className="border-destructive/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <Ban className="h-5 w-5" />
                What NOT to Build
              </CardTitle>
              <CardDescription>
                Features explicitly excluded to maintain product integrity
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {DESIGN_DOCTRINE.doNotBuild.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-warning" />
                    <h4 className="font-semibold">{item.feature}</h4>
                  </div>
                  <ul className="ml-6 text-sm text-muted-foreground space-y-1">
                    {item.reasons.map((reason, i) => (
                      <li key={i}>• {reason}</li>
                    ))}
                  </ul>
                  <p className="ml-6 text-sm text-success">
                    ✓ {item.alternative}
                  </p>
                  {index < DESIGN_DOCTRINE.doNotBuild.length - 1 && (
                    <Separator className="mt-4" />
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </MotionItem>

        {/* Focus List */}
        <MotionItem>
          <Card className="border-success/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-success">
                <CheckCircle2 className="h-5 w-5" />
                What to Build Instead
              </CardTitle>
              <CardDescription>
                The features that matter most
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {DESIGN_DOCTRINE.focusList.map((item, index) => (
                  <Badge key={index} variant="secondary" className="text-sm">
                    {item}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </MotionItem>

        {/* Final Product Status */}
        <MotionItem>
          <Card className="bg-muted/50">
            <CardContent className="py-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Product Status</p>
                  <p className="font-semibold">Final Release Mode</p>
                </div>
                <Badge variant="default" className="bg-success">
                  {FINAL_PRODUCT_MODE.finalRelease ? 'Active' : 'Development'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </MotionItem>
      </MotionContainer>
    </PageWrapper>
  );
}
