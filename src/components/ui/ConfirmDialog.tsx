import { Button, Modal, Space } from "antd-mobile";
import { ReactNode } from "react";
import { AiOutlineQuestionCircle } from "react-icons/ai";

interface ConfirmDialogProps {
  visible: boolean;
  icon?: ReactNode;
  iconClassName?: string;
  confirmClassName?: string;
  title: ReactNode;
  description: ReactNode;
  confirmText?: ReactNode;
  cancelText?: ReactNode;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog = ({
  visible,
  icon = <AiOutlineQuestionCircle />,
  iconClassName = "bg-primary text-title-text",
  confirmClassName = "!bg-primary !text-text-main",
  title,
  description,
  confirmText = "Xác nhận",
  cancelText = "Hủy",
  isLoading,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => {
  return (
    <Modal
      visible={visible}
      className="!w-[calc(100vw-32px)] !max-w-[380px]"
      getContainer={() => document.body}
      bodyClassName="yenni-confirm-dialog-body"
      bodyStyle={{
        maxHeight: "calc(100dvh - var(--zaui-safe-area-inset-top, 0px) - var(--zaui-safe-area-inset-bottom, 0px) - 48px)",
        overflowY: "auto",
      }}
      closeOnMaskClick={!isLoading}
      onClose={onCancel}
      content={
        <div className="px-2 py-3 text-center">
          <div
            className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl text-3xl ${iconClassName}`}
          >
            {icon}
          </div>
          <h2 className="mt-4 font-heading text-xl font-bold text-title-text">{title}</h2>
          <p className="mt-2 text-sm leading-6 text-text-muted">{description}</p>

          <Space direction="vertical" block className="mt-5">
            <Button
              block
              loading={isLoading}
              disabled={isLoading}
              onClick={onConfirm}
              className={`!rounded-2xl !border-none !py-3 !text-base !font-bold ${confirmClassName}`}
            >
              {confirmText}
            </Button>
            <Button
              block
              disabled={isLoading}
              onClick={onCancel}
              className="!rounded-2xl !border-background-main !bg-background-main !py-3 !text-base !font-bold !text-title-text [--adm-button-background-color:var(--color-background-main)] [--adm-button-border-color:var(--color-background-main)] [--adm-button-text-color:var(--color-text-title)]"
            >
              {cancelText}
            </Button>
          </Space>
        </div>
      }
    />
  );
};
