import { Link, NavLink, useLocation } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import {
  X,
  LayoutDashboard,
  Users,
  Wallet,
  CreditCard,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Settings,
  Image,
  Bell,
  DollarSign,
  Calculator,
  Zap as ZapIcon,
  Award,
  Gift,
  HelpCircle,
  BarChart3,
  ListOrdered,
  Gamepad2,
  Target,
  Trophy,
  Flag,
  Network,
  Globe,
  Zap as ZapIcon2,
} from "lucide-react";

/**
 * Static color -> Tailwind class lookup.
 * Tailwind's compiler only picks up classes it can see as literal strings,
 * so template strings like `bg-${color}-600` never actually generate CSS.
 * Every color used anywhere in this file must have an entry here.
 */
const COLOR_STYLES = {
  blue: { text: "text-blue-400", grad: "from-blue-600/20 to-blue-600/10", border: "border-blue-500", dot: "bg-blue-500", ring: "ring-blue-500/40" },
  green: { text: "text-green-400", grad: "from-green-600/20 to-green-600/10", border: "border-green-500", dot: "bg-green-500", ring: "ring-green-500/40" },
  purple: { text: "text-purple-400", grad: "from-purple-600/20 to-purple-600/10", border: "border-purple-500", dot: "bg-purple-500", ring: "ring-purple-500/40" },
  emerald: { text: "text-emerald-400", grad: "from-emerald-600/20 to-emerald-600/10", border: "border-emerald-500", dot: "bg-emerald-500", ring: "ring-emerald-500/40" },
  orange: { text: "text-orange-400", grad: "from-orange-600/20 to-orange-600/10", border: "border-orange-500", dot: "bg-orange-500", ring: "ring-orange-500/40" },
  cyan: { text: "text-cyan-400", grad: "from-cyan-600/20 to-cyan-600/10", border: "border-cyan-500", dot: "bg-cyan-500", ring: "ring-cyan-500/40" },
  red: { text: "text-red-400", grad: "from-red-600/20 to-red-600/10", border: "border-red-500", dot: "bg-red-500", ring: "ring-red-500/40" },
  gray: { text: "text-gray-300", grad: "from-gray-600/20 to-gray-600/10", border: "border-gray-500", dot: "bg-gray-400", ring: "ring-gray-500/40" },
  amber: { text: "text-amber-400", grad: "from-amber-600/20 to-amber-600/10", border: "border-amber-500", dot: "bg-amber-500", ring: "ring-amber-500/40" },
  yellow: { text: "text-yellow-400", grad: "from-yellow-600/20 to-yellow-600/10", border: "border-yellow-500", dot: "bg-yellow-500", ring: "ring-yellow-500/40" },
};

const colorOf = (color) => COLOR_STYLES[color] || COLOR_STYLES.gray;

/**
 * Menu tree. Every collapsible node gets an explicit `key` — this is what
 * broke the old sidebar: "Matka Game" was turned into "matkagame" at
 * render time, which never matched the "matka" key used to expand it.
 */
const MENUS = [
  { name: "Dashboard", path: "/admin/dashboard", icon: <LayoutDashboard size={20} />, color: "blue" },
  { name: "Users", path: "/admin/users", icon: <Users size={20} />, color: "green" },
  { name: "Banners", path: "/admin/banners", icon: <Image size={20} />, color: "purple" },
  { name: "Deposits", path: "/admin/deposits", icon: <Wallet size={20} />, color: "emerald" },
  { name: "Withdrawals", path: "/admin/withdrawals", icon: <CreditCard size={20} />, color: "orange" },
  {
    name: "Matka Game",
    key: "matka",
    icon: <Gamepad2 size={20} />,
    color: "amber",
    subMenus: [
      { name: "Markets", path: "/admin/markets", icon: <Target size={16} /> },
      { name: "Bids", path: "/admin/bids", icon: <Target size={16} /> },
      { name: "Results", path: "/admin/results", icon: <Trophy size={16} /> },
      { name: "Win Multipliers", path: "/admin/win-multipliers", icon: <Calculator size={16} /> },
    ],
  },
  { name: "Mines", path: "/admin/mines", icon: <Gamepad2 size={20} />, color: "red" },
  { name: "Bet Admin", path: "/admin/bet-admin", icon: <BarChart3 size={20} />, color: "cyan" },
  { name: "wingo Bets", path: "/admin/admin-wingo-bets", icon: <BarChart3 size={20} />, color: "cyan" },
  { name: "Wingo Commission", path: "/admin/wingo-commission", icon: <Globe size={20} />, color: "gray" },

  {
    name: "Powerhit",
    key: "powerhit",
    icon: <ZapIcon2 size={20} />,
    color: "yellow",
    subMenus: [
      { name: "Australia", countryKey: "australia", icon: <Flag size={16} />, isCountry: true },
      { name: "Pakistan", countryKey: "pakistan", icon: <Flag size={16} />, isCountry: true },
      { name: "Bangladesh", countryKey: "bangladesh", icon: <Flag size={16} />, isCountry: true },
      { name: "India", countryKey: "india", icon: <Flag size={16} />, isCountry: true },
      { name: "Nepal", countryKey: "nepal", icon: <Flag size={16} />, isCountry: true },
      { name: "UAE", countryKey: "uae", icon: <Flag size={16} />, isCountry: true },
    ].map((country) => ({
      ...country,
      subMenus: [
        { name: "Game Counts", path: `/admin/${country.countryKey}/gamecounts`, icon: <ListOrdered size={14} /> },
        { name: "Game Entries", path: `/admin/${country.countryKey}/gameEntries`, icon: <ZapIcon size={14} /> },
        { name: "Powerball Result", path: `/admin/${country.countryKey}/powerball-result`, icon: <Trophy size={14} /> },
        { name: "Powerball Divisions", path: `/admin/${country.countryKey}/powerball-divisions`, icon: <ListOrdered size={14} /> },
      ],
    })),
  },
  {
    name: "Settings",
    key: "settings",
    icon: <Settings size={20} />,
    color: "gray",
    subMenus: [
      { name: "Deposit Settings", path: "/admin/deposit-settings", icon: <DollarSign size={16} /> },
      { name: "Withdrawal Settings", path: "/admin/withdrawal-settings", icon: <CreditCard size={16} /> },
      { name: "Ticket Settings", path: "/admin/ticketsetiings", icon: <Award size={16} /> },
      { name: "Referral Levels", path: "/admin/referral-levels", icon: <Network size={16} /> },
      { name: "Betting Bonus", path: "/admin/betting-bonus", icon: <Gift size={16} /> },
      { name: "Currency Rates", path: "/admin/currency-rates", icon: <Globe size={16} /> },
    ],
  },
];

/** Walk the tree and return every collapsible node's key that sits on the path to the active route. */
function collectExpandKeys(nodes, pathname) {
  let keys = [];
  for (const node of nodes) {
    if (!node.subMenus) continue;
    const nodeKey = node.key || node.countryKey;
    const childKeys = collectExpandKeys(node.subMenus, pathname);
    const directHit = node.subMenus.some((sm) => sm.path === pathname);
    if (directHit || childKeys.length) {
      if (nodeKey) keys.push(nodeKey);
      keys = keys.concat(childKeys);
    }
  }
  return keys;
}

const Sidebar = ({ isOpen = false, onClose = () => { } }) => {
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState({ matka: true, powerhit: true, settings: false });

  const activeExpandKeys = useMemo(
    () => collectExpandKeys(MENUS, location.pathname),
    [location.pathname]
  );

  useEffect(() => {
    if (!activeExpandKeys.length) return;
    setExpandedMenus((prev) => {
      const next = { ...prev };
      let changed = false;
      activeExpandKeys.forEach((k) => {
        if (!next[k]) {
          next[k] = true;
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [activeExpandKeys]);

  const toggleMenu = (menuKey) =>
    setExpandedMenus((prev) => ({ ...prev, [menuKey]: !prev[menuKey] }));

  const isPathActive = (path) => location.pathname === path;

  // Renders a leaf link (real route, no children).
  const renderLeafLink = (item, color, depth) => {
    const active = isPathActive(item.path);
    const c = colorOf(color);
    return (
      <Link
        key={item.path}
        to={item.path}
        onClick={onClose}
        aria-current={active ? "page" : undefined}
        className={`
          group flex items-center gap-3 rounded-lg py-2 pr-3 text-sm transition-colors duration-150
          ${depth === 0 ? "pl-6 mx-2" : "pl-4"}
          ${active
            ? `bg-gradient-to-r ${c.grad} text-white border-r-2 ${c.border}`
            : "text-gray-400 hover:bg-gray-800/40 hover:text-white"}
        `}
      >
        <span className={active ? c.text : "text-gray-500 group-hover:text-gray-300"}>
          {item.icon}
        </span>
        <span className="truncate">{item.name}</span>
        {active && <span className={`ml-auto h-1.5 w-1.5 rounded-full ${c.dot}`} />}
      </Link>
    );
  };

  // Renders a collapsible node (has subMenus) — used for country groups inside Powerhit.
  const renderCountryGroup = (country, color) => {
    const c = colorOf(color);
    const expanded = !!expandedMenus[country.countryKey];
    const active = country.subMenus.some((sm) => isPathActive(sm.path));

    return (
      <div key={country.countryKey}>
        <button
          type="button"
          onClick={() => toggleMenu(country.countryKey)}
          aria-expanded={expanded}
          className={`
            flex w-full items-center justify-between rounded-lg py-2 pl-4 pr-3 text-sm
            transition-colors duration-150 hover:bg-gray-800/40 hover:text-white
            ${expanded || active ? "bg-gray-800/30 text-white" : "text-gray-300"}
          `}
        >
          <span className="flex items-center gap-2">
            <span className={expanded || active ? c.text : "text-gray-400"}>{country.icon}</span>
            {country.name}
          </span>
          {expanded ? (
            <ChevronDown size={14} className="text-gray-400" />
          ) : (
            <ChevronRight size={14} className="text-gray-400" />
          )}
        </button>

        {(expanded || active) && (
          <div className="ml-6 border-l border-gray-700/40 pl-1">
            {country.subMenus.map((child) => renderLeafLink(child, color, 1))}
          </div>
        )}
      </div>
    );
  };

  const renderSubMenus = (subMenus, color) =>
    subMenus.map((item) =>
      item.isCountry ? renderCountryGroup(item, color) : renderLeafLink(item, color, 1)
    );

  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`
          fixed left-0 top-0 z-50 flex h-screen w-64 flex-col
          bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950 text-white shadow-2xl
          transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:static lg:translate-x-0
        `}
      >
        <div className="h-1 shrink-0 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500" />

        <div className="flex h-20 shrink-0 items-center justify-between border-b border-gray-700/50 px-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 p-2">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-xl font-bold text-transparent">
                Admin Panel
              </h1>
              <p className="text-[10px] uppercase tracking-wider text-gray-400">
                Control Dashboard
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close sidebar"
            className="rounded-xl p-2 text-gray-400 transition-colors duration-150 hover:bg-gray-700/50 hover:text-white lg:hidden"
          >
            <X size={22} />
          </button>
        </div>

        <nav className="scrollbar-hide flex-1 overflow-y-auto py-4">
          {MENUS.map((menu) => {
            if (!menu.subMenus) {
              const c = colorOf(menu.color);
              return (
                <NavLink
                  key={menu.path}
                  to={menu.path}
                  onClick={onClose}
                  className={({ isActive }) => `
                    mx-2 mb-1 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium
                    transition-colors duration-150
                    ${isActive
                      ? `bg-gradient-to-r ${c.grad} text-white border-r-2 ${c.border}`
                      : "text-gray-300 hover:bg-gray-800/30 hover:text-white"}
                  `}
                >
                  <span className={isPathActive(menu.path) ? c.text : "text-gray-400"}>{menu.icon}</span>
                  <span>{menu.name}</span>
                  {isPathActive(menu.path) && <span className={`ml-auto h-1.5 w-1.5 rounded-full ${c.dot}`} />}
                </NavLink>
              );
            }

            const c = colorOf(menu.color);
            const expanded = !!expandedMenus[menu.key];
            const active = menu.subMenus.some(
              (sub) =>
                (sub.path && isPathActive(sub.path)) ||
                (sub.subMenus && sub.subMenus.some((child) => isPathActive(child.path)))
            );

            return (
              <div key={menu.key} className="mb-1">
                <button
                  type="button"
                  onClick={() => toggleMenu(menu.key)}
                  aria-expanded={expanded}
                  className={`
                    flex w-full items-center justify-between px-6 py-3 text-sm font-medium
                    text-gray-300 transition-colors duration-150
                    hover:bg-gray-800/50 hover:text-white
                    ${expanded || active ? "bg-gray-800/30 text-white" : ""}
                  `}
                >
                  <span className="flex items-center gap-3">
                    <span className={expanded || active ? c.text : "text-gray-400"}>{menu.icon}</span>
                    {menu.name}
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="rounded bg-gray-700/50 px-1.5 py-0.5 text-[10px] text-gray-400">
                      {menu.subMenus.length}
                    </span>
                    {expanded ? (
                      <ChevronDown size={16} className="text-gray-400" />
                    ) : (
                      <ChevronRight size={16} className="text-gray-400" />
                    )}
                  </span>
                </button>

                {(expanded || active) && (
                  <div className="ml-6 border-l-2 border-gray-700/30">
                    {renderSubMenus(menu.subMenus, menu.color)}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="shrink-0 border-t border-gray-700/50 bg-gray-900/80 p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
              Online
            </div>
            <div className="flex gap-2">
              <button type="button" className="rounded-lg p-1.5 text-gray-400 transition-colors duration-150 hover:bg-gray-700/50 hover:text-white">
                <HelpCircle size={16} />
              </button>
              <button type="button" className="rounded-lg p-1.5 text-gray-400 transition-colors duration-150 hover:bg-gray-700/50 hover:text-white">
                <Bell size={16} />
              </button>
            </div>
          </div>
          <div className="mt-2 text-center text-[10px] text-gray-500">v2.1.0</div>
        </div>

        <style>{`
          .scrollbar-hide::-webkit-scrollbar { display: none; }
          .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>
      </aside>
    </>
  );
};

export default Sidebar;
