import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

export class CanvasErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[PSYCHIS Canvas Error Boundary Caught]:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleClearAndReload = () => {
    try {
      localStorage.removeItem('psychis_workspaces_v1');
    } catch (e) {}
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-[#FAF9F7] p-6 text-[#1A1816] font-sans select-none">
          <div className="max-w-lg w-full bg-white border border-[#E8E6E3] rounded-3xl p-7 shadow-2xl flex flex-col gap-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h2 className="font-display text-xl font-medium text-[#1A1816]">
                Canvas Render State Protected
              </h2>
              <p className="text-xs font-mono text-[#6B655A] mt-1">
                A component error was safely intercepted to prevent application crash.
              </p>
            </div>

            <div className="bg-[#F0EFED] border border-[#E0DED9] rounded-xl p-3 text-left overflow-auto max-h-36">
              <p className="font-mono text-[11px] text-red-600 font-semibold break-all">
                {this.state.error?.message || 'Unknown render error'}
              </p>
              {this.state.error?.stack && (
                <pre className="font-mono text-[9px] text-[#8A8782] mt-1 whitespace-pre-wrap">
                  {this.state.error.stack.slice(0, 300)}
                </pre>
              )}
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={this.handleReset}
                className="px-4 py-2 bg-[#1A1816] hover:bg-[#333] text-white rounded-xl font-mono text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Recover Canvas</span>
              </button>
              <button
                onClick={this.handleClearAndReload}
                className="px-4 py-2 bg-white hover:bg-[#F0EFED] border border-[#C5C2BC] text-[#4A4540] rounded-xl font-mono text-xs font-semibold transition-colors cursor-pointer"
              >
                <span>Reset &amp; Reload</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
