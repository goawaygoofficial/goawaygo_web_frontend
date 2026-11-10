import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { reportCrash } from '@/lib/monitoring';

/** Shows `fallback` instead of a blank page if rendering fails, and sends the crash to Sentry. */
export class ErrorBoundary extends Component<
  { fallback: ReactNode; children: ReactNode },
  { failed: boolean }
> {
  override state = { failed: false };

  static getDerivedStateFromError(): { failed: boolean } {
    return { failed: true };
  }

  override componentDidCatch(error: unknown, info: ErrorInfo): void {
    reportCrash(error, info.componentStack);
  }

  override render(): ReactNode {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
