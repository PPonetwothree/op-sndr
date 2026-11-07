import { Component, type ReactNode } from "react";

export class ErrorBoundary extends Component<{ children: ReactNode; resetKey: string }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  componentDidUpdate(prev: { resetKey: string }) {
    if (prev.resetKey !== this.props.resetKey && this.state.error) this.setState({ error: null });
  }
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="m-6 border border-hostile/50 bg-hostile/10 p-4 text-[12px] text-hostile">
        <div className="font-semibold">This module hit a runtime error.</div>
        <div className="mono mt-1 text-[11px]">{this.state.error.message}</div>
        <button className="mt-3 border border-hostile/50 px-2 py-1" onClick={() => this.setState({ error: null })}>
          Retry
        </button>
      </div>
    );
  }
}
