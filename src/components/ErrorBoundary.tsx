import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';
import { motion } from 'motion/react';

interface Props {
  children: ReactNode;
  isAdmin?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    const { isAdmin } = this.props;
    if (this.state.hasError) {
      let errorMessage = "An unexpected error occurred.";
      try {
        const parsedError = JSON.parse(this.state.error?.message || "{}");
        if (parsedError.error) {
          errorMessage = parsedError.error;
        }
      } catch (e) {
        errorMessage = this.state.error?.message || errorMessage;
      }

      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-900 p-10 rounded-[2.5rem] shadow-2xl shadow-red-100 dark:shadow-black/40 border border-red-50 dark:border-red-900/20 max-w-lg w-full text-center space-y-8"
          >
            <div className="w-20 h-20 bg-red-50 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-10 h-10 text-red-600 dark:text-red-400" />
            </div>
            
            <div className="space-y-3">
              <h2 className="text-2xl font-black text-gray-900 dark:text-white">Something went wrong</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                We encountered an error while processing your request. This might be due to a connection issue or a security restriction.
              </p>
            </div>

            <div className="p-4 bg-red-50 dark:bg-red-900/30 rounded-2xl border border-red-100 dark:border-red-900/20 text-left">
              <p className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-widest mb-1">Error Details</p>
              <p className="text-xs font-mono text-red-800 dark:text-red-200 break-words">{errorMessage}</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => window.location.href = '/'}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold rounded-2xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-all shadow-sm"
              >
                <Home className="w-5 h-5" />
                <span>Home</span>
              </button>
              {isAdmin && (
                <button
                  onClick={this.handleReset}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 dark:shadow-none"
                >
                  <RefreshCcw className="w-5 h-5" />
                  <span>Retry</span>
                </button>
              )}
            </div>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}
