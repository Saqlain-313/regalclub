import { Copy, Check, Share2, Send, MessageCircle, Share } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { showErrorToast, showSuccessToast } from "../../hooks/toast";
import { getActivityContent } from "../../redux/slices/activityBannerSlice";

// Default share image — used until the admin uploads one
const DEFAULT_SHARE_IMAGE =
  "https://i.ibb.co/V0THwFvm/banner1.png";

const ReferralCard = () => {
  const { user } = useSelector((state) => state.auth);
  const shareImage = useSelector(
    (state) => state.activityBanner?.referralShareImage || "",
  );
  const [copied, setCopied] = useState(false);
  const [canShareFiles, setCanShareFiles] = useState(false);
  const [imageFile, setImageFile] = useState(null);

  const baseUrl = window.location.origin;
  const referralLink = `${baseUrl}/register/?ref=${user?.referralCode || "alex777"}`;
  const finalImage = shareImage || DEFAULT_SHARE_IMAGE;

  const shareText = `🎮 Join me on RegalClub & get your SIGN UP BONUS!
✅ Refer & Earn — invite friends, earn together
🎁 Sign up bonus + 100% first deposit bonus

Register with my link: ${referralLink}`;

  useEffect(() => {
    // Prepare the share image file for native sharing
    const loadImage = async () => {
      try {
        const response = await fetch(finalImage, { mode: "cors" });
        const blob = await response.blob();
        const file = new File([blob], "referral-banner.png", {
          type: blob.type || "image/png",
        });
        setImageFile(file);
        // Web Share API level-2 — file share support check
        setCanShareFiles(
          Boolean(
            navigator.canShare && navigator.canShare({ files: [file] }),
          ),
        );
      } catch {
        setImageFile(null);
        setCanShareFiles(false);
      }
    };

    loadImage();
  }, [finalImage]);

  // =======================
  // COPY
  // =======================
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      showSuccessToast("Link Copied", "Referral link copied to clipboard.");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      const textArea = document.createElement("textarea");
      textArea.value = referralLink;
      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand("copy");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        showErrorToast("Copy Failed", "Please copy the link manually.");
      }
      document.body.removeChild(textArea);
    }
  };

  // =======================
  // NATIVE SHARE (link + image)
  // =======================
  const nativeShare = async () => {
    try {
      if (canShareFiles && imageFile) {
        // Image + text + link are all shared together
        await navigator.share({
          title: "Join me on RegalClub",
          text: shareText,
          files: [imageFile],
        });
      } else {
        await navigator.share({
          title: "Join me on RegalClub",
          text: shareText,
          url: referralLink,
        });
      }
    } catch (error) {
      if (error?.name !== "AbortError") {
        // Native share fail -> WhatsApp fallback
        whatsappShare();
      }
    }
  };

  // =======================
  // WHATSAPP
  // =======================
  const whatsappShare = () => {
    window.open(
      `https://wa.me/?text=${encodeURIComponent(shareText)}`,
      "_blank",
    );
  };

  // =======================
  // TELEGRAM
  // =======================
  const telegramShare = () => {
    window.open(
      `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent("🎮 Join me on RegalClub! Sign up bonus + 100% first deposit bonus 🎁")}`,
      "_blank",
    );
  };

  // =======================
  // FACEBOOK
  // =======================
  const facebookShare = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`,
      "_blank",
    );
  };

  // TopX Purple gradient
  const purpleGradient =
    "bg-gradient-to-br from-[#B45CFF] via-[#7418F5] to-[#3A00C9] border border-[#C77AFF] shadow-[0_0_8px_#B45CFF,0_0_18px_rgba(139,43,255,0.75),inset_0_2px_4px_rgba(255,255,255,0.45),inset_0_-5px_8px_rgba(30,0,100,0.45)]";

  const shareBtnClass =
    "flex flex-1 flex-col items-center justify-center gap-1 rounded-xl border py-2.5 text-[10px] font-bold active:scale-95 transition-all";

  return (
    <div className="rounded-3xl bg-[#1C0F2B] border border-[#2a1b3d] shadow-[0_4px_16px_rgba(0,0,0,0.5)] p-5 relative overflow-hidden">
      {/* Decorative purple glow */}
      <div className="pointer-events-none absolute -top-16 -left-16 w-40 h-40 bg-[#9B59B6]/20 rounded-full blur-3xl" />

      {/* Referral share image (admin-managed) */}
      {finalImage && (
        <div className="relative z-10 mb-3 overflow-hidden rounded-2xl border border-[#2a1b3d]">
          <img
            src={finalImage}
            alt="Refer & Earn"
            className="w-full object-cover"
          />
        </div>
      )}

      <p className="relative z-10 text-sm font-semibold text-white mb-2">
        Your Referral Link
      </p>

      <div className="relative z-10 rounded-xl bg-[#12061C] border border-[#2a1b3d] p-1.5 flex items-center gap-2">
        <input
          readOnly
          value={referralLink}
          className="flex-1 bg-transparent outline-none text-sm text-gray-300 font-medium min-w-0 truncate pl-2"
        />

        <button
          onClick={copyLink}
          className={`flex items-center gap-1.5 rounded-lg ${purpleGradient} px-4 py-2 text-sm font-bold text-white active:scale-95 transition-all whitespace-nowrap`}
        >
          {copied ? (
            <>
              Copied
              <Check size={14} />
            </>
          ) : (
            <>
              Copy
              <Copy size={14} />
            </>
          )}
        </button>
      </div>

      {/* Share buttons */}
      <div className="relative z-10 mt-3 flex gap-2">
        <button
          type="button"
          onClick={whatsappShare}
          className={`${shareBtnClass} border-[#25D366]/40 bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20`}
        >
          <MessageCircle size={18} />
          WhatsApp
        </button>

        <button
          type="button"
          onClick={telegramShare}
          className={`${shareBtnClass} border-[#29A9EB]/40 bg-[#29A9EB]/10 text-[#29A9EB] hover:bg-[#29A9EB]/20`}
        >
          <Send size={18} />
          Telegram
        </button>

        <button
          type="button"
          onClick={facebookShare}
          className={`${shareBtnClass} border-[#1877F2]/40 bg-[#1877F2]/10 text-[#1877F2] hover:bg-[#1877F2]/20`}
        >
          <Share size={18} />
          Facebook
        </button>

        {typeof navigator !== "undefined" && navigator.share && (
          <button
            type="button"
            onClick={nativeShare}
            className={`${shareBtnClass} ${purpleGradient} text-white`}
          >
            <Share2 size={18} />
            Share All
          </button>
        )}
      </div>

      <p className="relative z-10 mt-2 text-center text-[9px] text-gray-500">
        "Share All" sends the link together with the referral banner image
      </p>
    </div>
  );
};

export default ReferralCard;
