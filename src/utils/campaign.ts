import { Campaign } from 'types';
export const formatCampaignDate = (value?: string | null) => {
    if (!value) return "";

    return new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).format(new Date(value));
};
export const getCampaignStatus = (campaign: Campaign) => {
    const now = new Date();
    const start = new Date(campaign.start_at ?? campaign.start_date);
    const end = new Date(campaign.end_at ?? campaign.end_date);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
        return { label: "Đang mở", className: "bg-primary text-title-text" };
    }

    if (now < start) {
        return { label: "Sắp diễn ra", className: "bg-[#E7F0FF] text-[#24518A]" };
    }

    if (now > end) {
        return { label: "Đã kết thúc", className: "bg-text-main/10 text-text-muted" };
    }

    return { label: "Đang diễn ra", className: "bg-[#E7F7EF] text-[#16633F]" };
};

export const getDefaultCtaLabel = (campaign: Campaign) => {
    if (campaign.cta_label) return campaign.cta_label;
    if (campaign.campaign_type === "event") return "Xem sản phẩm dịp này";
    if (campaign.campaign_type === "promotion") return "Khám phá ưu đãi";
    return "Xem hàng ngay";
};
