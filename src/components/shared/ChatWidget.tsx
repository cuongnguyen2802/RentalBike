import Script from "next/script";
import { MessageCircle, Phone } from "lucide-react";
import { getSettings, DEFAULT_CHAT } from "@/lib/settings";

/* ── SVG icons for WhatsApp & Zalo ─────────────────────────── */
function WhatsAppIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function ZaloIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 16.59c-.23.644-.919 1.087-1.764 1.148l-.23.008H7.648c-.63 0-1.185-.215-1.577-.572-.391-.357-.608-.857-.608-1.406V8.215c0-.549.217-1.049.608-1.406.392-.357.947-.572 1.577-.572H15.9c.63 0 1.185.215 1.577.572.391.357.608.857.608 1.406v7.553c0 .293-.064.574-.19.822zM8.646 9.59H7.434v4.82h1.212V9.59zm3.667 0h-1.15v4.82h1.15v-2.51l1.888 2.51h1.15V9.59h-1.15v2.51L12.313 9.59zm-3.097-.7a.7.7 0 10-.001 1.4.7.7 0 000-1.4z" />
    </svg>
  );
}

export default async function ChatWidget() {
  const chat = await getSettings("chat", DEFAULT_CHAT);

  if (!chat.enabled) return null;

  if (chat.mode === "embed" && chat.embedCode) {
    return (
      <Script
        id="chat-embed"
        strategy="lazyOnload"
        dangerouslySetInnerHTML={{ __html: chat.embedCode.replace(/<\/?script[^>]*>/gi, "") }}
      />
    );
  }

  if (chat.mode === "button" && chat.href) {
    const pos = chat.position === "bottom-left"
      ? "bottom-6 left-6"
      : "bottom-6 right-6";

    const Icon = chat.icon === "whatsapp"
      ? <WhatsAppIcon size={26} />
      : chat.icon === "zalo"
      ? <ZaloIcon size={26} />
      : chat.icon === "phone"
      ? <Phone className="h-6 w-6" />
      : <MessageCircle className="h-6 w-6" />;

    return (
      <a
        href={chat.href}
        target={chat.href.startsWith("tel:") || chat.href.startsWith("mailto:") ? "_self" : "_blank"}
        rel="noopener noreferrer"
        aria-label={chat.label}
        title={chat.label}
        style={{ backgroundColor: chat.color }}
        className={`group fixed ${pos} z-50 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg hover:scale-110 active:scale-95 transition-all duration-200`}
      >
        {Icon}
        {/* Tooltip */}
        <span className={`absolute ${chat.position === "bottom-left" ? "left-full ml-3" : "right-full mr-3"} whitespace-nowrap bg-gray-900 text-white text-xs font-medium px-2.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none`}>
          {chat.label}
        </span>
      </a>
    );
  }

  return null;
}
