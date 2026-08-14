import { Component, ErrorInfo, ReactNode } from "react";
import { Button, Modal, Space } from "antd-mobile";
import { AiOutlineWarning } from "react-icons/ai";
import { handleAppError } from "utils";

interface AppErrorBoundaryProps {
  children: ReactNode;
}

interface AppErrorBoundaryState {
  hasError: boolean;
}

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    handleAppError(error, {
      component: "AppErrorBoundary",
      action: "render",
      silent: true,
      extraData: {
        componentStack: errorInfo.componentStack,
      },
    });
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <Modal
        visible
        className="!w-[calc(100vw-32px)] !max-w-[380px]"
        getContainer={() => document.body}
        closeOnMaskClick={false}
        showCloseButton={false}
        content={
          <div className="px-2 py-3 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FEE2E2] text-3xl text-[#B91C1C]">
              <AiOutlineWarning />
            </div>
            <h2 className="mt-4 font-heading text-xl font-bold text-title-text">Thông báo</h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-text-muted">
              Mini App đang gặp sự cố tạm thời. Bạn thử tải lại app giúp shop nhé.
            </p>
            <Space direction="vertical" block className="mt-5">
              <Button
                block
                onClick={() => window.location.reload()}
                className="!rounded-2xl !border-none !bg-primary !py-3 !text-base !font-bold !text-text-main"
              >
                Tải lại
              </Button>
            </Space>
          </div>
        }
      />
    );
  }
}
