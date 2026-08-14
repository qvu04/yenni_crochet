interface SummaryCellProps {
    label: string;
    value: string;
    strong?: boolean
}
export const SummaryCell = ({ label, value, strong }: SummaryCellProps) => (
    <div className="rounded-2xl bg-white p-3 shadow-sm">
        <p className="text-[11px] font-bold text-text-muted">{label}</p>
        <p className={`mt-1 break-words font-heading text-sm font-extrabold ${strong ? "text-[#16A34A]" : "text-text-main"}`}>
            {value}
        </p>
    </div>
);