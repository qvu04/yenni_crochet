import { Button, Modal, Space } from "antd-mobile";
import { SuccessIcon } from "components/icons";

interface ModalSuccessAction {
  label: string;
  onClick: () => void;
}

interface ModalSuccessProps {
  visible: boolean;
  heading?: string;
  title: string;
  primaryAction?: ModalSuccessAction;
  secondaryAction?: ModalSuccessAction;
  onClose?: () => void;
}

export const ModalSuccess = ({
  visible,
  heading = "Thành công!",
  title,
  primaryAction,
  secondaryAction,
  onClose,
}: ModalSuccessProps) => {
  return (
    <Modal
      visible={visible}
      className="!w-[calc(100vw-32px)] !max-w-[380px]"
      closeOnMaskClick={false}
      showCloseButton={Boolean(onClose)}
      onClose={onClose}
      content={
        <div className="px-2 py-3 text-center">
          <SuccessIcon />
          <h2 className="mt-4 font-heading text-xl font-bold text-title-text">{heading}</h2>
          <p className="mt-2 text-sm leading-6 text-text-muted">{title}</p>

          {(primaryAction || secondaryAction) && (
            <Space direction="vertical" block className="mt-5">
              {primaryAction && (
                <Button
                  block
                  onClick={primaryAction.onClick}
                  className="!rounded-2xl !border-none !bg-primary !py-3 !text-base !font-bold !text-text-main"
                >
                  {primaryAction.label}
                </Button>
              )}
              {secondaryAction && (
                <Button
                  block
                  fill="outline"
                  onClick={secondaryAction.onClick}
                  className="!rounded-2xl !border-background-main !py-3 !text-base !font-bold !text-text-main"
                >
                  {secondaryAction.label}
                </Button>
              )}
            </Space>
          )}
        </div>
      }
    />
  );
};
