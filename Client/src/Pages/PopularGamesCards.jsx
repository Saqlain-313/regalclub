import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import matkaIMG from "../assets/Home/matka.png";
import minesIMG from "../assets/Home/mines.png";
import tradingIMG from "../assets/Home/trading.png";
import wingoIMG from "../assets/Home/wingoo.png";

const PopularGamesCards = () => {
  const user = useSelector((state) => state.auth.user);

  const popularCards = [
    { id: 1, name: "Wingo", img: wingoIMG, to: "/wingo" },
    {
      id: 2,
      name: "Trading",
      img: tradingIMG,
      to: "https://lotterry.trade.marinclub.site/",
      external: true,
    },
    { id: 3, name: "Mines", img: minesIMG, to: "/mine-games" },
    { id: 4, name: "Matka", img: matkaIMG, to: "/matka/markets" },
  ];

  // TopX Theme Card Style: Dark background, subtle border, neon shadow on hover
  const cardClass =
    "relative aspect-square w-full overflow-hidden rounded-xl border border-[#2a1b3d] bg-[#1C0F2B] shadow-[0_4px_12px_rgba(0,0,0,0.5)] transition duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_8px_20px_rgba(0,230,118,0.15)] group-hover:border-[#00E676]/50 active:scale-[.98]";

  return (
    <section className="w-full bg-[#0B0410] px-4 py-5 sm:px-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[22px]">🔥</span>
          <h2 className="text-[20px] font-extrabold tracking-tight text-white sm:text-[24px]">
            Popular Games
          </h2>
        </div>
        <Link
          to="/games"
          className="flex items-center gap-1 text-sm font-bold text-gray-300 bg-[#1C0F2B] border border-[#2a1b3d] px-3 py-1.5 rounded-lg hover:bg-[#2a1b3d] hover:text-white transition-all sm:text-base"
        >
          View all
          <span className="text-lg">›</span>
        </Link>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {popularCards.map((game) => {
          const isTrading = game.id === 2;
          const needsLogin = isTrading && !user;

          // External link (Trading)
          if (game.external && user) {
            return (
              <a
                key={game.id}
                href={game.to}
                target="_blank"
                rel="noopener noreferrer"
                className="group block w-full"
              >
                <div className={cardClass}>
                  <img
                    src={game.img}
                    alt={game.name}
                    className="h-full w-full object-cover opacity-90 transition group-hover:opacity-100"
                    loading="lazy"
                  />
                </div>
              </a>
            );
          }

          // Login redirect (Trading + no user) ya internal links
          const linkTo = needsLogin ? "/login" : game.to;

          return (
            <Link
              key={game.id}
              to={linkTo}
              state={needsLogin ? { from: game.to } : undefined}
              className="group block w-full"
            >
              <div className={cardClass}>
                <img
                  src={game.img}
                  alt={game.name}
                  className="h-full w-full object-cover opacity-90 transition group-hover:opacity-100"
                  loading="lazy"
                />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default PopularGamesCards;
