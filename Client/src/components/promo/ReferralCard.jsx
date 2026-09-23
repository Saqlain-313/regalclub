import { Copy } from "lucide-react";
import { useSelector } from "react-redux";

const ReferralCard = () => {
  const { user } = useSelector((state) => state.auth);
  const baseUrl = window.location.origin;
  const referralLink = `${baseUrl}/register/?ref=${user?.referralCode || "alex777"}`;

  // TopX Purple gradient
  const purpleGradient =
    "bg-gradient-to-br from-[#B45CFF] via-[#7418F5] to-[#3A00C9] border border-[#C77AFF] shadow-[0_0_8px_#B45CFF,0_0_18px_rgba(139,43,255,0.75),inset_0_2px_4px_rgba(255,255,255,0.45),inset_0_-5px_8px_rgba(30,0,100,0.45)]";

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      const btn = document.getElementById("copyBtn");
      const originalText = btn.innerHTML;
      btn.innerHTML =
        '<span class="flex items-center gap-1.5"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg> Copied</span>';
      setTimeout(() => {
        btn.innerHTML = originalText;
      }, 2000);
    } catch (error) {
      console.error("Failed to copy: ", error);
      const textArea = document.createElement("textarea");
      textArea.value = referralLink;
      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand("copy");
      } catch (err) {
        alert("Failed to copy link. Please copy manually.");
      }
      document.body.removeChild(textArea);
    }
  };

  return (
    <div className="rounded-3xl bg-[#1C0F2B] border border-[#2a1b3d] shadow-[0_4px_16px_rgba(0,0,0,0.5)] p-5 relative overflow-hidden">
      {/* Decorative purple glow */}
      <div className="pointer-events-none absolute -top-16 -left-16 w-40 h-40 bg-[#9B59B6]/20 rounded-full blur-3xl" />

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
          id="copyBtn"
          onClick={copyLink}
          className={`flex items-center gap-1.5 rounded-lg ${purpleGradient} px-4 py-2 text-sm font-bold text-white active:scale-95 transition-all whitespace-nowrap`}
        >
          Copy
          <Copy size={14} />
        </button>
      </div>
    </div>
  );
};

export default ReferralCard;
