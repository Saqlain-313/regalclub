// Pages/SupportChat.jsx — Support hub: Tawk.to live chat + WhatsApp + Telegram
import {
  AlertCircle,
  ArrowLeft,
  Clock,
  Headphones,
  Mail,
  MessageCircle,
  Send,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { api } from "../redux/slices/api";
import {
  SUPPORT_CONFIG,
  isTawkConfigured,
} from "../config/supportConfig";

const SupportChat = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [tawkReady, setTawkReady] = useState(false);
  const [tawkError, setTawkError] = useState(false);
  const tawkLoadedRef = useRef(false);
  const tawkConfigured = isTawkConfigured();

  // Admin-controlled channel visibility + contact details
  const [channels, setChannels] = useState({
    tawk: true,
    whatsapp: true,
    telegram: true,
    email: true,
  });
  const [contacts, setContacts] = useState({
    whatsappNumber: SUPPORT_CONFIG.whatsapp.number,
    telegramUsername: SUPPORT_CONFIG.telegram.username,
    supportEmail: SUPPORT_CONFIG.email,
  });
  const [channelsLoading, setChannelsLoading] = useState(true);

  // ================================================
  // SUPPORT SETTINGS (admin enable/disable + details)
  // ================================================
  useEffect(() => {
    let cancelled = false;

    const loadChannels = async () => {
      try {
        const { data } = await api.get("/support-settings");
        if (!cancelled && data?.settings) {
          setChannels({
            tawk: data.settings.tawk !== false,
            whatsapp: data.settings.whatsapp !== false,
            telegram: data.settings.telegram !== false,
            email: data.settings.email !== false,
          });
          setContacts({
            whatsappNumber:
              data.settings.whatsappNumber || SUPPORT_CONFIG.whatsapp.number,
            telegramUsername:
              data.settings.telegramUsername || SUPPORT_CONFIG.telegram.username,
            supportEmail: data.settings.supportEmail || SUPPORT_CONFIG.email,
          });
        }
      } catch {
        // fail-open — default sab dikhao
      } finally {
        if (!cancelled) setChannelsLoading(false);
      }
    };

    loadChannels();
    return () => {
      cancelled = true;
    };
  }, [dispatch]);

  // ================================================
  // TAWK.TO LIVE CHAT WIDGET
  // Sirf tab load hota hai jab config IDs set hon
  // ================================================
  useEffect(() => {
    if (!tawkConfigured || !channels.tawk || tawkLoadedRef.current) return;

    tawkLoadedRef.current = true;

    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_LoadStart = new Date();

    const script = document.createElement("script");
    script.src = `https://embed.tawk.to/${SUPPORT_CONFIG.tawk.propertyId}/${SUPPORT_CONFIG.tawk.widgetId}`;
    script.async = true;
    script.onload = () => setTawkReady(true);
    script.onerror = () => setTawkError(true);
    document.body.appendChild(script);
  }, [tawkConfigured, channels.tawk]);

  // ================================================
  // TAWK BUBBLE SIRF IS PAGE PAR + CHHOTA SIZE
  // Page chhodo to widget hide, wapas aao to show
  // ================================================
  useEffect(() => {
    const style = document.createElement("style");
    style.id = "tawk-support-page-style";
    style.textContent = `
      iframe[title="Chat widget"] { border-radius: 0 !important; }
    `;
    document.head.appendChild(style);

    // Tawk ke iframes khin fixed positioned hain (random ids) —
    // unhe directly uthate hain: footer se upar + chhota size.
    const applyStyles = () => {
      for (const iframe of document.querySelectorAll('iframe[title="Chat widget"]')) {
        if (iframe.dataset.tawkAdjusted) continue;
        const rect = iframe.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) continue;
        iframe.dataset.tawkAdjusted = "1";

        const currentBottom = parseFloat(getComputedStyle(iframe).bottom) || 0;
        iframe.style.bottom = `${currentBottom + 95}px`;
        iframe.style.transform = "scale(0.75)";
        iframe.style.transformOrigin = "bottom right";
      }
    };

    applyStyles();
    const interval = setInterval(applyStyles, 800);

    // Widget visible karo (mount)
    if (window.Tawk_API?.showWidget) {
      window.Tawk_API.showWidget();
    } else if (window.Tawk_API) {
      window.Tawk_API.show?.();
    }

    return () => {
      // Page chhoda — widget hide + styles saaf
      style.remove();
      clearInterval(interval);
      for (const iframe of document.querySelectorAll('iframe[data-tawk-adjusted="1"]')) {
        iframe.style.bottom = "";
        iframe.style.transform = "";
        iframe.style.transformOrigin = "";
        delete iframe.dataset.tawkAdjusted;
      }
      if (window.Tawk_API?.hideWidget) {
        window.Tawk_API.hideWidget();
      } else if (window.Tawk_API?.hide) {
        window.Tawk_API.hide();
      }
    };
  }, []);

  const openTawkChat = () => {
    if (window.Tawk_API?.maximize) {
      window.Tawk_API.maximize();
    }
  };

  const supportChannels = [
    {
      key: "whatsapp",
      enabled: channels.whatsapp,
      title: "WhatsApp Support",
      description: "Chat with us on WhatsApp — fastest response",
      link: `https://wa.me/${contacts.whatsappNumber}?text=${encodeURIComponent(
        SUPPORT_CONFIG.whatsapp.defaultMessage,
      )}`,
      external: true,
      gradient: "from-[#25D366] to-[#128C7E]",
      border: "border-[#25D366]/40",
      responseTime: "Typically replies in minutes",
    },
    {
      key: "telegram",
      enabled: channels.telegram,
      title: "Telegram Support",
      description: "Message our official Telegram support handle",
      link: `https://t.me/${contacts.telegramUsername}`,
      external: true,
      gradient: "from-[#37AEE2] to-[#1E96C8]",
      border: "border-[#37AEE2]/40",
      responseTime: "Typically replies in minutes",
    },
    {
      key: "email",
      enabled: channels.email,
      title: "Email Support",
      description: contacts.supportEmail,
      link: `mailto:${contacts.supportEmail}`,
      external: false,
      gradient: "from-[#B45CFF] to-[#7418F5]",
      border: "border-[#9B59B6]/40",
      responseTime: "Replies within 24 hours",
    },
  ].filter((c) => c.enabled);

  return (
    <div className="relative min-h-screen bg-[#0B0410] overflow-hidden">
      {/* Decorative background orbs */}
      <div className="pointer-events-none absolute -top-24 -right-20 w-72 h-72 bg-[#9B59B6]/20 rounded-full blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -left-24 w-64 h-64 bg-[#8E44AD]/15 rounded-full blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 w-80 h-80 bg-[#9B59B6]/10 rounded-full blur-3xl" />

      <div className="relative px-4 sm:px-6 py-6">
        <div className="max-w-md w-full mx-auto">
          {/* ============================================= */}
          {/* HEADER                                        */}
          {/* ============================================= */}
          <div className="mb-5 flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="w-11 h-11 rounded-2xl bg-[#1C0F2B] border border-[#2a1b3d] flex items-center justify-center flex-shrink-0 hover:bg-[#2a1b3d] transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5 text-gray-300" />
            </button>
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-white leading-tight">
                Support
              </h1>
              <p className="text-[11px] text-gray-400">
                We're here to help you 24×7
              </p>
            </div>
          </div>

          {/* ============================================= */}
          {/* HERO CARD                                     */}
          {/* ============================================= */}
          <div className="mb-5 bg-[#1C0F2B] rounded-2xl border border-[#2a1b3d] shadow-[0_4px_16px_rgba(0,0,0,0.5)] p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#9B59B6]/10 rounded-full blur-2xl" />
            <div className="relative flex items-start gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#B45CFF] via-[#7418F5] to-[#3A00C9] border border-[#C77AFF] shadow-[0_0_8px_#B45CFF,0_0_18px_rgba(139,43,255,0.75),inset_0_2px_4px_rgba(255,255,255,0.45),inset_0_-5px_8px_rgba(30,0,100,0.45)] flex items-center justify-center flex-shrink-0">
                <Headphones className="w-6 h-6 text-white" />
              </div>
              <div className="min-w-0">
                <h2 className="text-base font-bold text-white leading-snug">
                  How can we help?
                </h2>
                <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
                  Pick a channel below and our support team will get back to
                  you as soon as possible.
                </p>
              </div>
            </div>

            <div className="relative mt-4 flex items-center gap-2 bg-[#12061C] border border-[#2a1b3d] rounded-xl px-3 py-2">
              <ShieldCheck className="w-3.5 h-3.5 text-[#00E676] flex-shrink-0" />
              <p className="text-[10px] text-gray-400">
                We never ask for your password or OTP. Stay safe from
                imposters.
              </p>
            </div>
          </div>

          {/* ============================================= */}
          {/* LIVE CHAT (Tawk.to)                           */}
          {/* ============================================= */}
          {channels.tawk && (
          <div className="mb-5 bg-[#1C0F2B] rounded-2xl border border-[#2a1b3d] shadow-[0_4px_16px_rgba(0,0,0,0.5)] p-5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#B45CFF] to-[#7418F5] border border-[#C77AFF] flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white">Live Chat</h3>
                  {tawkReady && (
                    <span className="flex items-center gap-1 text-[9px] font-semibold text-[#00E676] bg-[#00E676]/10 border border-[#00E676]/30 px-2 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00E676] animate-pulse" />
                      Online
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Chat live with our support agents
                </p>
              </div>
            </div>

            {tawkReady && (
              <button
                type="button"
                onClick={openTawkChat}
                className="mt-4 w-full font-semibold py-3 px-4 rounded-xl text-sm flex items-center justify-center gap-2 bg-gradient-to-br from-[#B45CFF] via-[#7418F5] to-[#3A00C9] border border-[#C77AFF] shadow-[0_0_8px_#B45CFF,0_0_18px_rgba(139,43,255,0.75),inset_0_2px_4px_rgba(255,255,255,0.45),inset_0_-5px_8px_rgba(30,0,100,0.45)] text-white active:scale-[0.98] transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                Open Live Chat
              </button>
            )}

            {!tawkConfigured ? (
              <div className="mt-4 flex items-start gap-2 bg-[#12061C] border border-[#2a1b3d] rounded-xl p-3">
                <AlertCircle className="w-3.5 h-3.5 text-[#F1C40F] flex-shrink-0 mt-0.5" />
                <p className="text-[10px] text-gray-400 leading-relaxed">
                  Live chat is being set up. Please use WhatsApp or Telegram
                  below for now.
                </p>
              </div>
            ) : tawkError ? (
              <div className="mt-4 flex items-start gap-2 bg-[#12061C] border border-[#2a1b3d] rounded-xl p-3">
                <AlertCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-[10px] text-gray-400 leading-relaxed">
                  Live chat failed to load. Please use WhatsApp or Telegram
                  below.
                </p>
              </div>
            ) : (
              !tawkReady && (
                <p className="mt-4 text-[10px] text-gray-500 leading-relaxed">
                  Connecting you to live chat...
                </p>
              )
            )}
          </div>
          )}

          {/* ============================================= */}
          {/* CHANNELS                                      */}
          {/* ============================================= */}
          <div className="space-y-3 mb-5">
            {supportChannels.map((channel) => (
              <a
                key={channel.key}
                href={channel.link}
                target={channel.external ? "_blank" : undefined}
                rel={channel.external ? "noopener noreferrer" : undefined}
                className="flex items-center gap-3 bg-[#1C0F2B] rounded-2xl border border-[#2a1b3d] shadow-[0_4px_16px_rgba(0,0,0,0.5)] p-4 hover:border-[#9B59B6]/50 hover:bg-[#2a1b3d]/40 transition-all active:scale-[0.99] group"
              >
                <div
                  className={`w-11 h-11 rounded-xl bg-gradient-to-br ${channel.gradient} border ${channel.border} flex items-center justify-center flex-shrink-0 shadow-md`}
                >
                  {channel.key === "whatsapp" && (
                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
                      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 004.79 1.22h.01c5.46 0 9.9-4.45 9.9-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0012.04 2zm0 18.15h-.01a8.2 8.2 0 01-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 01-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 012.41 5.83c0 4.54-3.7 8.23-8.23 8.23zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.25-.64.81-.78.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.14.16-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.06-.1-.23-.16-.48-.28z" />
                    </svg>
                  )}
                  {channel.key === "telegram" && (
                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
                      <path d="M9.04 15.51l-.38 5.32c.54 0 .78-.23 1.06-.51l2.55-2.44 5.28 3.87c.97.53 1.66.25 1.92-.89L22.93 4.4c.31-1.42-.51-1.98-1.45-1.63L2.28 9.85c-1.39.54-1.37 1.31-.24 1.66l4.69 1.46L18.36 6.2c.51-.34.98-.15.6.19L9.04 15.51z" />
                    </svg>
                  )}
                  {channel.key === "email" && (
                    <Mail className="w-5 h-5 text-white" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-bold text-white">
                    {channel.title}
                  </h3>
                  <p className="text-[11px] text-gray-400 truncate mt-0.5">
                    {channel.description}
                  </p>
                  <p className="text-[10px] text-gray-500 flex items-center gap-1 mt-1">
                    <Clock className="w-2.5 h-2.5" />
                    {channel.responseTime}
                  </p>
                </div>

                <Send className="w-4 h-4 text-gray-500 group-hover:text-[#B45CFF] rotate-[-35deg] flex-shrink-0 transition-colors" />
              </a>
            ))}
          </div>

          {/* ============================================= */}
          {/* FAQ / TIPS                                    */}
          {/* ============================================= */}
          <div className="mb-6 bg-[#1C0F2B] rounded-2xl border border-[#2a1b3d] shadow-[0_4px_16px_rgba(0,0,0,0.5)] p-5">
            <h3 className="flex items-center gap-2 text-xs font-semibold text-gray-300 uppercase tracking-wide mb-3">
              <AlertCircle className="w-3.5 h-3.5 text-[#9B59B6]" />
              Before you contact us
            </h3>
            <ul className="space-y-2 text-[11px] text-gray-400 leading-relaxed">
              <li className="flex gap-2">
                <span className="text-[#B45CFF] font-bold">•</span>
                Deposit/Withdrawal pending? Check the processing time shown on
                the request page first.
              </li>
              <li className="flex gap-2">
                <span className="text-[#B45CFF] font-bold">•</span>
                Always keep your transaction ID (UTR) ready — it helps us
                find your payment faster.
              </li>
              <li className="flex gap-2">
                <span className="text-[#B45CFF] font-bold">•</span>
                For game balance issues, try the "Credit" button on the
                Account page before contacting support.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportChat;
