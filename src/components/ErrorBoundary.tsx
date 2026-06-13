import React from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-[#1a1a1a] border border-zinc-800 p-8 rounded-[2rem] max-w-md w-full shadow-2xl">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h1 className="text-xl font-bold text-white mb-2">Application Error</h1>
            <p className="text-zinc-400 text-sm mb-8 leading-relaxed">
              The interface encountered an unexpected collision. We've logged the technical details for our systems.
            </p>
            <div className="bg-black/50 rounded-xl p-4 mb-8 text-left">
              <code className="text-[10px] text-red-400 font-mono break-all italic">
                {this.state.error?.message || 'Unknown runtime exception'}
              </code>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-4 bg-zinc-800 hover:bg-zinc-700 text-white rounded-2xl transition-all flex items-center justify-center gap-2 font-medium"
            >
              <RefreshCcw className="w-4 h-4" />
              Reboot Interface
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
