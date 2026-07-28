import { CustomRequestForm } from "./components";

export const CustomRequestPage = () => {
    return (
        <div className="min-h-screen bg-background-main px-5 pb-6 pt-10">
            <header className="mb-6">
                <p className="text-xs font-bold uppercase tracking-[0.08em] text-text-muted">
                    Mẫu handmade theo ý bạn
                </p>
                <h1 className="mt-1 font-heading text-3xl font-bold text-title-text">Đặt riêng</h1>
                <p className="mt-1 text-sm leading-6 text-text-muted">
                    Hãy cho Yenni biết ý tưởng của bạn nhé! <br />
                    Yenni sẽ tư vấn lại giá và lịch làm phù hợp.
                </p>
            </header>
            <CustomRequestForm />
        </div>
    );
};
