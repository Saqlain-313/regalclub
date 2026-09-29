import { useEffect, useState } from "react";
import {
  Headphones,
  Loader2,
  Mail,
  MessageCircle,
  Phone,
  Save,
  Send,
} from "lucide-react";
import { toast } from "react-toastify";
import { api } from "../redux/api";

const CHANNELS = [
  {
    key: "tawk",
    label: "Live Chat (Tawk.to)",
    description: "User panel ke Support page par live chat widget",
    icon: <Headphones className="w-4 h-4" />,
  },
  {
    key: "whatsapp",
    label: "WhatsApp Support",
    description: "wa.me par WhatsApp chat",
    icon: <Phone className="w-4 h-4" />,
  },
  {
    key: "telegram",
    label: "Telegram Support",
    description: "t.me par Telegram support handle",
    icon: <Send className="w-4 h-4" />,
  },
  {
    key: "email",
    label: "Email Support",
    description: "Email support channel",
    icon: <Mail className="w-4 h-4" />,
  },
];

const Settings = () => {
  const [settings, setSettings] = useState({
    tawk: true,
    whatsapp: true,
    telegram: true,
    email: true,
  });
  const [contacts, setContacts] = useState({
    whatsappNumber: "",
    telegramUsername: "",
    supportEmail: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get("/support-settings");
        if (data?.settings) {
          setSettings({
            tawk: data.settings.tawk,
            whatsapp: data.settings.whatsapp,
            telegram: data.settings.telegram,
            email: data.settings.email,
          });
          setContacts({
            whatsappNumber: data.settings.whatsappNumber || "",
            telegramUsername: data.settings.telegramUsername || "",
            supportEmail: data.settings.supportEmail || "",
          });
        }
      } catch {
        toast.error("Failed to load support settings");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const toggle = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleContactChange = (e) => {
    const { name, value } = e.target;
    setContacts((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await api.put("/support-settings", {
        ...settings,
        ...contacts,
      });
      if (data?.settings) {
        setSettings({
          tawk: data.settings.tawk,
          whatsapp: data.settings.whatsapp,
          telegram: data.settings.telegram,
          email: data.settings.email,
        });
        setContacts({
          whatsappNumber: data.settings.whatsappNumber || "",
          telegramUsername: data.settings.telegramUsername || "",
          supportEmail: data.settings.supportEmail || "",
        });
      }
      toast.success("✅ Support settings saved successfully!");
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to update support settings",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-5">Settings</h1>

      {/* ============================================= */}
      {/* SUPPORT CHANNELS                              */}
      {/* ============================================= */}
      <div className="bg-white rounded-lg shadow p-5 mb-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-purple-600" />
            Support Channels
          </h2>
          <p className="text-xs text-gray-500 hidden sm:block">
            Enable karke user panel ke Support page par dikhao
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {CHANNELS.map((channel) => (
                <button
                  key={channel.key}
                  type="button"
                  onClick={() => toggle(channel.key)}
                  className={`flex items-center gap-3 text-left border rounded-xl px-4 py-3 transition-all ${
                    settings[channel.key]
                      ? "border-purple-400 bg-purple-50"
                      : "border-gray-200 bg-gray-50 opacity-70"
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      settings[channel.key]
                        ? "bg-purple-600 text-white"
                        : "bg-gray-200 text-gray-400"
                    }`}
                  >
                    {channel.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-800">
                      {channel.label}
                    </p>
                    <p className="text-[11px] text-gray-500 truncate">
                      {channel.description}
                    </p>
                  </div>
                  {/* Toggle */}
                  <span
                    className={`relative w-10 h-5 rounded-full flex-shrink-0 transition-colors ${
                      settings[channel.key] ? "bg-purple-600" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${
                        settings[channel.key] ? "left-[22px]" : "left-0.5"
                      }`}
                    />
                  </span>
                </button>
              ))}
            </div>

            {/* Contact detail inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-gray-200">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  WhatsApp Number{" "}
                  <span className="text-gray-400 font-normal">
                    (with country code)
                  </span>
                </label>
                <input
                  type="text"
                  name="whatsappNumber"
                  value={contacts.whatsappNumber}
                  onChange={handleContactChange}
                  placeholder="e.g. 919876543210"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Telegram Username{" "}
                  <span className="text-gray-400 font-normal">(no @)</span>
                </label>
                <input
                  type="text"
                  name="telegramUsername"
                  value={contacts.telegramUsername}
                  onChange={handleContactChange}
                  placeholder="e.g. regalclub_support"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Support Email
                </label>
                <input
                  type="email"
                  name="supportEmail"
                  value={contacts.supportEmail}
                  onChange={handleContactChange}
                  placeholder="e.g. support@example.com"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="mt-4 inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save Changes
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Settings;
