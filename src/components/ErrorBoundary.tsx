import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Bug, Copy, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });
    console.error('[ErrorBoundary] Caught error:', error, errorInfo);
  }

  handleReload = (): void => {
    window.location.reload();
  };

  handleCopyError = async (): Promise<void> => {
    const { error, errorInfo } = this.state;
    const errorDetails = `
Error: ${error?.message || 'Unknown error'}
Stack: ${error?.stack || 'No stack trace'}
Component Stack: ${errorInfo?.componentStack || 'No component stack'}
URL: ${window.location.href}
Protocol: ${window.location.protocol}
User Agent: ${navigator.userAgent}
Timestamp: ${new Date().toISOString()}
    `.trim();

    try {
      await navigator.clipboard.writeText(errorDetails);
      alert('Error details copied to clipboard');
    } catch {
      console.error('Failed to copy error details');
    }
  };

  toggleDetails = (): void => {
    this.setState(prev => ({ showDetails: !prev.showDetails }));
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { error, errorInfo, showDetails } = this.state;

      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <Card className="max-w-lg w-full">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <CardTitle className="text-xl">App Failed to Load</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-center text-muted-foreground">
                Something went wrong while loading the application.
                This might be a temporary issue.
              </p>

              <div className="flex flex-col gap-2">
                <Button onClick={this.handleReload} className="w-full">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Reload App
                </Button>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={this.toggleDetails}
                    className="flex-1"
                  >
                    <Bug className="mr-2 h-4 w-4" />
                    {showDetails ? 'Hide' : 'Show'} Debug Info
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={this.handleCopyError}
                    className="flex-1"
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Error
                  </Button>
                </div>
              </div>

              {showDetails && (
                <div className="mt-4 p-3 bg-muted rounded-md overflow-auto max-h-48">
                  <pre className="text-xs text-muted-foreground whitespace-pre-wrap break-words">
                    <strong>Error:</strong> {error?.message || 'Unknown'}
                    {'\n\n'}
                    <strong>Stack:</strong>
                    {'\n'}
                    {error?.stack || 'No stack trace'}
                    {errorInfo?.componentStack && (
                      <>
                        {'\n\n'}
                        <strong>Component Stack:</strong>
                        {errorInfo.componentStack}
                      </>
                    )}
                  </pre>
                </div>
              )}

              <p className="text-xs text-center text-muted-foreground">
                Protocol: {window.location.protocol} | 
                URL: {window.location.pathname}
              </p>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
