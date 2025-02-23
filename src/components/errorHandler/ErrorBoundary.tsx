/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { PropsWithChildren, ReactNode } from "react";
import ErrorSection from "./ErrorSection";

type Props = {
  fallback?: ReactNode;
};

class ErrorBoundary extends React.Component<
  PropsWithChildren<Props>,
  { hasError: boolean }
> {
  constructor(props: PropsWithChildren<Props>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_error: any) {
    return { hasError: true };
  }

  componentDidCatch(error: any, info: any) {
    console.log("error", { error, info });
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <ErrorSection />;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
