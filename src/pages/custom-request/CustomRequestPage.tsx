import { AiOutlineEdit, AiOutlineHeart } from "react-icons/ai";
import { CustomRequestForm } from "./components";

export const CustomRequestPage = () => {
    return (
        <div className="min-h-screen bg-background-main px-5 pb-6 pt-4">
            <header className="relative mb-6 overflow-hidden rounded-[30px] bg-[linear-gradient(135deg,#F3E8FF_0%,#FCE7F3_52%,#FFE4E6_100%)] p-5 shadow-[0_14px_32px_rgba(126,34,206,0.10)]">
                <AiOutlineHeart className="pointer-events-none absolute -right-2 top-4 rotate-12 text-7xl text-white/70" />
                <div className="relative">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/75 text-2xl text-[#7E22CE] shadow-sm">
                    <AiOutlineEdit />
                </span>
                <p className="mt-4 text-xs font-extrabold uppercase tracking-[0.12em] text-[#7E22CE]">
                    Mẫu handmade theo ý bạn
                </p>
                <h1 className="mt-1 font-heading text-[32px] font-extrabold leading-9 text-[#581C87]">Đặt riêng</h1>
                <p className="mt-2 max-w-[320px] text-sm font-semibold leading-6 text-[#86198F]">
                    Hãy cho Yenni biết ý tưởng của bạn nhé! <br />
                    Yenni sẽ tư vấn lại giá và lịch làm phù hợp.
                </p>
                </div>
            </header>
            <CustomRequestForm />
        </div>
    );
};
