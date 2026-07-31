import { ModalSuccess } from "components/ui";
import { useState } from "react";
import {
  AiOutlineClockCircle,
  AiOutlineEnvironment,
  AiFillFacebook,
  AiFillInstagram,
  AiFillTikTok,
  AiOutlineHeart,
  AiOutlineMail,
  AiOutlineMessage,
  AiOutlineQuestionCircle,
  AiOutlineRight,
} from "react-icons/ai";
import { Link } from "react-router-dom";
import { openWebview } from "zmp-sdk/apis";
import { copyToClipboard } from 'utils';

const shopContact = {
  phone: "0704604023",
  email: "yennhixd633@gmail.com",
  area: "Nhận đơn online tại TP.HCM và ship toàn quốc",
  responseTime: "Phản hồi 24/7",
  facebookUrl: "https://www.facebook.com/people/Yennicrochet/100071147977503/",
  instagramUrl: "https://www.instagram.com/yenni.crochet",
  tiktokUrl: "https://www.tiktok.com/@ngyennhiii?is_from_webapp=1&sender_device=pc",
};

const contactActions = [
  {
    label: "Liên hệ Zalo",
    description: shopContact.phone,
    icon: <AiOutlineMessage />,
    type: "phone",
    copyValue: shopContact.phone,
  },
  {
    label: "Email",
    description: shopContact.email,
    icon: <AiOutlineMail />,
    type: "email",
    copyValue: shopContact.email,
  },
] as const;

const socialLinks = [
  {
    label: "Facebook",
    description: "Giới thiệu tất cả sản phẩm hiện bán.",
    icon: <AiFillFacebook />,
    href: shopContact.facebookUrl,
    className: "bg-[#1877F2] text-white",
  },
  {
    label: "Instagram",
    description: "Album sản phẩm cực kỳ độc đáo.",
    icon: <AiFillInstagram />,
    href: shopContact.instagramUrl,
    className: "bg-[#E4405F] text-white",
  },
  {
    label: "TikTok",
    description: "Các sản phẩm mới được cập nhật liên tục.",
    icon: <AiFillTikTok />,
    href: shopContact.tiktokUrl,
    className: "bg-text-main text-white",
  },
] as const;

const contactNotes = [
  {
    icon: <AiOutlineEnvironment />,
    label: "Khu vực",
    value: shopContact.area,
  },
  {
    icon: <AiOutlineClockCircle />,
    label: "Thời gian phản hồi",
    value: shopContact.responseTime,
  },
  {
    icon: <AiOutlineHeart />,
    label: "Sản phẩm",
    value: "Móc thú len, móc khóa, quà tặng handmade và mẫu đặt riêng.",
  },
] as const;

const faqs = [
  {
    question: "Shop có nhận đặt riêng không?",
    answer: "Shop có bạn nhé. Bạn có thể gửi hình tham khảo, tone màu và số lượng ở mục Đặt riêng giúp shop nhé.",
  },
  {
    question: "Bao lâu thì hoàn thành sản phẩm?",
    answer: "Tùy mẫu và số lượng. Yenni sẽ liên hệ đến bạn để xác nhận thời gian trước khi làm.",
  },
  {
    question: "Có giao hàng không?",
    answer: "Shop có hỗ trợ giao hàng nội thành TP.HCM và ship toàn quốc bạn nhé.",
  },
] as const;

// const isBrowserDev = () => ["localhost", "127.0.0.1"].includes(window.location.hostname);

const openExternalUrlFallback = (url: string) => {
  window.open(url, "_blank", "noopener,noreferrer");
};

export const ContactPage = () => {
  const [copiedType, setCopiedType] = useState<"phone" | "email" | null>(null);

  const handleCopyContact = async (type: "phone" | "email", value: string) => {
    try {
      await copyToClipboard(value);
      setCopiedType(type);
    } catch {
      setCopiedType(null);
    }
  };

  const handleOpenSocialLink = async (url: string) => {
    // if (isBrowserDev()) {
    //   openExternalUrlFallback(url);
    //   return;
    // }

    try {
      await openWebview({
        url,
        config: {
          style: "normal",
          leftButton: "back",
        },
      });
    } catch {
      openExternalUrlFallback(url);
    }
  };

  return (
    <main className="bg-background-main px-5 pb-5 pt-4">
      <header className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.08em] text-text-muted">
          Yenni luôn ở đây
        </p>
        <h1 className="mt-1 font-heading text-3xl font-bold text-title-text">
          Liên hệ với shop
        </h1>
        <p className="mt-2 text-sm leading-6 text-text-muted">
          Cần hỏi về mẫu có sẵn, đơn đặt riêng hoặc thời gian hoàn thành, bạn nhắn Yenni nhé.
        </p>
      </header>

      <section className="mb-5 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-text-main/5">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-2xl text-title-text">
            <AiOutlineMessage />
          </div>
          <div className="min-w-0">
            <h2 className="font-heading text-xl font-bold text-title-text">Yenni Crochet</h2>
            <p className="mt-1 text-sm leading-6 text-text-muted">
              Shop handmade nhỏ nhận làm quà tặng len theo mẫu có sẵn và ý tưởng riêng của bạn.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-3">
          {contactNotes.map((note) => (
            <div key={note.label} className="flex items-center gap-3 rounded-2xl bg-background-main px-4 py-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-xl text-title-text">
                {note.icon}
              </span>
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-[0.06em] text-text-muted">
                  {note.label}
                </p>
                <p className="mt-0.5 text-sm font-semibold leading-5 text-text-main">
                  {note.value}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-5">
        <h2 className="mb-3 font-heading text-xl font-bold text-title-text">Liên hệ nhanh</h2>
        <div className="grid gap-3">
          {contactActions.map((action) => {
            const content = (
              <>
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/80 text-2xl text-title-text">
                  {action.icon}
                </span>
                <div className="min-w-0 flex-1 text-left">
                  <p className="text-base font-bold text-text-main">{action.label}</p>
                  <p className="mt-0.5 truncate text-sm text-text-muted">{action.description}</p>
                </div>
                <AiOutlineRight className="shrink-0 text-lg text-text-muted" />
              </>
            );
            const className =
              "flex w-full items-center gap-3 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-text-main/5 transition active:scale-[0.99]";
            return (
              <button
                key={action.label}
                type="button"
                onClick={() => handleCopyContact(action.type, action.copyValue)}
                className={className}
              >
                {content}
              </button>
            );
          })}
        </div>
      </section>

      <section className="mb-5">
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-text-muted">
              Mạng xã hội
            </p>
            <h2 className="mt-0.5 font-heading text-xl font-bold text-title-text">Theo dõi Yenni</h2>
          </div>
          <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-text-muted shadow-sm ring-1 ring-text-main/5">
            3 kênh
          </span>
        </div>

        <div className="grid gap-3">
          {socialLinks.map((social) => (
            <button
              key={social.label}
              type="button"
              onClick={() => handleOpenSocialLink(social.href)}
              className="flex items-center gap-3 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-text-main/5 transition active:scale-[0.99]"
            >
              <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl ${social.className}`}>
                {social.icon}
              </span>
              <div className="min-w-0 flex-1 text-left">
                <p className="text-base font-bold text-text-main">{social.label}</p>
                <p className="mt-0.5 line-clamp-2 text-sm leading-5 text-text-muted">
                  {social.description}
                </p>
              </div>
              <AiOutlineRight className="shrink-0 text-lg text-text-muted" />
            </button>
          ))}
        </div>
      </section>

      <section className="mb-5 rounded-3xl bg-[#FFF7E8] p-5 shadow-sm ring-1 ring-text-main/5">
        <h2 className="font-heading text-xl font-bold text-title-text">Bạn muốn đặt mẫu riêng?</h2>
        <p className="mt-2 text-sm leading-6 text-text-muted">
          Gửi mô tả ngắn, số lượng và ảnh tham khảo để Yenni tư vấn giá cùng lịch làm phù hợp.
        </p>
        <Link
          to="/order"
          className="mt-4 flex min-h-12 w-full items-center justify-center rounded-2xl bg-primary px-4 text-sm font-extrabold text-text-main"
        >
          Gửi yêu cầu đặt riêng
        </Link>
      </section>

      <section>
        <h2 className="mb-3 font-heading text-xl font-bold text-title-text">Câu hỏi thường gặp</h2>
        <div className="space-y-3">
          {faqs.map((faq) => (
            <div key={faq.question} className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-text-main/5">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/70 text-lg text-title-text">
                  <AiOutlineQuestionCircle />
                </span>
                <div>
                  <p className="font-bold leading-5 text-text-main">{faq.question}</p>
                  <p className="mt-1 text-sm leading-6 text-text-muted">{faq.answer}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
      <ModalSuccess
        visible={Boolean(copiedType)}
        heading={copiedType === "email" ? "Copy email thành công" : "Copy số điện thoại thành công"}
        title={
          copiedType === "email"
            ? "Bạn có thể dán email này để gửi lời nhắn cho shop nhé!"
            : "Bạn có thể nhắn tin qua zalo hoặc liên hệ với shop qua số điện thoại này bạn nhé!"
        }
        onClose={() => setCopiedType(null)}
      />
    </main>
  );
};
