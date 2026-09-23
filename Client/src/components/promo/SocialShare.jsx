import { MessageCircle, MoreHorizontal, Send, Share2 } from "lucide-react";

const options = [
  { label: "WhatsApp", icon: MessageCircle, bg: "bg-green-500" },
  { label: "Telegram", icon: Send, bg: "bg-sky-500" },
  { label: "Share", icon: Share2, bg: "bg-indigo-500" },
  { label: "More", icon: MoreHorizontal, bg: "bg-gray-400" },
];

const SocialShare = () => {
  return (
    <div className="flex items-center justify-around">
      {options.map((opt) => {
        const Icon = opt.icon;
        return (
          <button
            key={opt.label}
            className="flex flex-col items-center gap-2 group"
          >
            <div
              className={`w-12 h-12 rounded-full ${opt.bg} flex items-center justify-center text-white shadow-sm group-active:scale-90 transition-transform`}
            >
              <Icon size={20} />
            </div>
            <span className="text-xs font-medium text-gray-600">
              {opt.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default SocialShare;
