import { CircleCheckBig } from "lucide-react";

const rules = [
  "Only valid users are eligible.",
  "Commission is credited automatically.",
  "Users must complete recharge.",
  "Fake referrals will be removed.",
  "Unlimited referral earnings.",
];

const ReferralRules = () => {
  return (
    <div className="mt-6 bg-[#1C0F2B] rounded-3xl shadow-[0_4px_16px_rgba(0,0,0,0.5)] border border-[#2a1b3d] p-5">
      <h2 className="text-lg font-bold mb-5 text-white">Referral Rules</h2>

      <div className="space-y-4">
        {rules.map((rule, index) => (
          <div key={index} className="flex items-start gap-3">
            <CircleCheckBig
              className="text-[#00E676] mt-1 flex-shrink-0"
              size={18}
            />

            <p className="text-sm text-gray-400">{rule}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReferralRules;
