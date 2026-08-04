import { AiOutlineInfoCircle } from "react-icons/ai";

interface AccountNoticeProps {
  message: string;
}

export const AccountNotice = ({ message }: AccountNoticeProps) => {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-white p-4 text-sm font-semibold leading-6 text-text-muted shadow-sm ring-1 ring-text-main/5">
      <AiOutlineInfoCircle className="mt-0.5 shrink-0 text-xl text-title-text" />
      <p>{message}</p>
    </div>
  );
};
