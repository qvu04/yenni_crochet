import { useMemo } from "react";
import { Sheet } from "zmp-ui";
import {
  AiOutlineCalendar,
  AiOutlineEnvironment,
  AiOutlineShopping,
} from "react-icons/ai";
import { Campaign } from "types";
import { useProductSheetStore } from "stores/productSheet";
import { ProductPreview } from "./ProductReview";
import { formatCampaignDate, getCampaignStatus } from "utils";
import { CampaignDetailSkeleton, CloseButtonSheet } from "components/ui";
import { EmptyCampaignIcon } from "components/icons";
interface CampaignDetailSheetProps {
  campaign: Campaign | null;
  visible: boolean;
  onClose: () => void;
  isLoading?: boolean;
  isError?: boolean;
}
export const CampaignDetailSheet = ({
  campaign,
  visible,
  onClose,
  isLoading,
  isError,
}: CampaignDetailSheetProps) => {
  const openProduct = useProductSheetStore((s) => s.openProduct);

  const status = useMemo(() => {
    if (!campaign) return null;
    return getCampaignStatus(campaign);
  }, [campaign]);

  if (isLoading) {
    return (
      <Sheet
        visible={visible}
        onClose={onClose}
        height="85vh"
        swipeToClose
        unmountOnClose
        handler={false}
      >
        <CampaignDetailSkeleton onClose={onClose} />
      </Sheet>
    );
  }

  if (isError || !campaign) {
    return (
      <Sheet
        visible={visible}
        onClose={onClose}
        height="85vh"
        swipeToClose
        unmountOnClose
        handler={false}
      >
        <div className="relative h-full bg-background-main p-5">
          <CloseButtonSheet onClick={onClose} />
          <p className="rounded-2xl bg-white p-4 text-sm text-text-muted">
            Không tìm thấy sự kiện này.
          </p>
        </div>
      </Sheet>
    );
  }

  const dateRange = [
    formatCampaignDate(campaign.start_at ?? campaign.start_date),
    formatCampaignDate(campaign.end_at ?? campaign.end_date),
  ]
    .filter(Boolean)
    .join(" - ");
  const heroImage = campaign.detail_image_url || campaign.banner_url;
  const contentLines = campaign.content
    ?.split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const handleProductSelect = (productId: string) => {
    onClose();
    openProduct(productId);
  };

  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      height="85vh"
      swipeToClose
      unmountOnClose
      handler={false}
    >
      <div className="relative flex h-full flex-col bg-background-main">
        <CloseButtonSheet onClick={onClose} />
        <div className="relative flex-1 overflow-y-auto pb-5">
          <div className="relative h-72 overflow-hidden bg-text-main">
            <img src={heroImage} alt={campaign.name} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-text-main/5 via-text-main/10 to-text-main/60" />
            <div className="absolute inset-x-0 bottom-0 p-5">
              {campaign.subtitle && (
                <p className="mb-1 text-xs font-bold uppercase tracking-[0.12em] text-white/85">
                  {campaign.subtitle}
                </p>
              )}
              <h2 className="font-heading text-2xl font-extrabold leading-tight text-white">
                {campaign.name}
              </h2>
            </div>
          </div>

          <div className="space-y-5 px-5 pt-5">
            <div className="flex flex-wrap items-center gap-2">
              {status && (
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${status.className}`}>
                  {status.label}
                </span>
              )}
              {dateRange && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-bold text-text-muted ring-1 ring-text-main/5">
                  <AiOutlineCalendar className="text-base" />
                  {dateRange}
                </span>
              )}
            </div>

            {campaign.description && (
              <p className="text-[15px] font-semibold leading-6 text-text-main">
                {campaign.description}
              </p>
            )}

            {campaign.event_location && (
              <div className="flex items-start gap-3 rounded-2xl bg-white p-4 shadow-[0_10px_24px_rgba(51,39,42,0.06)] ring-1 ring-text-main/5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-xl text-title-text">
                  <AiOutlineEnvironment />
                </span>
                <div>
                  <p className="text-xs font-bold uppercase text-text-muted">Địa điểm</p>
                  <p className="mt-1 text-sm font-bold leading-5 text-text-main">
                    {campaign.event_location}
                  </p>
                </div>
              </div>
            )}

            {contentLines && contentLines.length > 0 && (
              <div className="space-y-3 rounded-2xl bg-white p-4 text-[15px] leading-7 text-text-main shadow-[0_10px_24px_rgba(51,39,42,0.06)] ring-1 ring-text-main/5">
                {contentLines.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
            )}

            {campaign.products && campaign.products.length > 0 ? (
              <section className="space-y-3">
                <h3 className="flex items-center gap-2 text-base font-extrabold text-title-text">
                  <AiOutlineShopping className="text-xl" />
                  Sản phẩm trong dịp này
                </h3>
                <div className="scrollbar-none -mx-5 flex gap-3 overflow-x-auto px-5 pb-1">
                  {campaign.products.map((product) => (
                    <ProductPreview
                      key={product.id}
                      product={product}
                      onSelect={handleProductSelect}
                    />
                  ))}
                </div>
              </section>
            ) : (
              <section className="space-y-3">
                <h3 className="flex items-center gap-2 text-base font-extrabold text-title-text">
                  <AiOutlineShopping className="text-xl" />
                  Sản phẩm trong dịp này
                </h3>
                <div className="flex items-start gap-3 rounded-2xl bg-white p-4 shadow-[0_10px_24px_rgba(51,39,42,0.06)] ring-1 ring-text-main/5">
                  <EmptyCampaignIcon className="h-16 w-16 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-bold leading-5 text-text-main">
                      Chưa có sản phẩm trong dịp này
                    </p>
                    <p className="mt-1 text-sm leading-6 text-text-muted">
                      Yenni Crochet sẽ cập nhật sản phẩm sớm nhất có thể, bạn quay lại xem sau nhé.
                    </p>
                  </div>
                </div>
              </section>
            )}
          </div>
        </div>
        {/* <div className="bg-background-main px-4 pb-[calc(16px+var(--zaui-safe-area-inset-bottom,0px))] pt-3">
          <button
            type="button"
            onClick={handleCtaClick}
            className="w-full rounded-2xl bg-primary px-4 py-3.5 text-center text-base font-extrabold text-text-main shadow-[0_12px_26px_rgba(244,181,194,0.35)] active:scale-[0.98]"
          >
            {getDefaultCtaLabel(campaign)}
          </button>
        </div> */}
      </div>
    </Sheet>
  );
};
