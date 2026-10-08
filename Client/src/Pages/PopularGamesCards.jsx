import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { api } from "../redux/slices/api";
import NoticeBar from "../components/home/NoticeBar";
import powerballAustraliaIMG from "../assets/Home/powerball-australia.png";
import powerballIndiaIMG from "../assets/Home/powerball-india.png";
import matkaIMG from "../assets/Home/matka-new.png";
import minesIMG from "../assets/Home/mines-new.png";
import tradingIMG from "../assets/Home/trading-new.png";
import wingoIMG from "../assets/Home/wingo-new.png";

const popularCards = [
  {
    id: 1,
    key: "wingo",
    name: "Wingo",
    img: wingoIMG,
    to: "/wingo",
  },
  {
    id: 2,
    key: "trading",
    name: "Trading",
    img: tradingIMG,
    to: "/trading",
    external: false,
  },
  {
    id: 3,
    key: "mines",
    name: "Mines",
    img: minesIMG,
    to: "/mine-games",
  },
  {
    id: 4,
    key: "powerball_india",
    name: "Powerball India",
    img: powerballIndiaIMG,
    to: "/powerhit",
  },
  {
    id: 5,
    key: "matka",
    name: "Matka",
    img: matkaIMG,
    to: "/matka/markets",
  },
  {
    id: 6,
    key: "powerball_australia",
    name: "Powerball Australia",
    img: powerballAustraliaIMG,
    to: "/powerhit",
  },
];

const PopularGamesCards = () => {
  const user = useSelector((state) => state.auth.user);

  // Admin-changeable images — the API returns { key: imageUrl } for games
  // the admin has customized. Missing keys keep the bundled defaults.
  const [imgOverrides, setImgOverrides] = useState({});

  useEffect(() => {
    let cancelled = false;

    api
      .get("/game-images")
      .then(({ data }) => {
        if (!cancelled && data?.success && data.data) {
          setImgOverrides(data.data);
        }
      })
      .catch(() => {
        // API down / not deployed yet — bundled defaults keep working
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Card: image full cover, koi text overlay nahi — images me hi
  // naam design kiya hua hai
  const cardClass =
    "relative w-full h-[130px] sm:h-[150px] md:h-[170px] overflow-hidden rounded-2xl border border-[#2a1b3d] bg-[#1C0F2B] shadow-[0_4px_12px_rgba(0,0,0,0.5)] transition duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_8px_20px_rgba(155,89,182,0.35)] group-hover:border-[#B45CFF]/60 active:scale-[.98]";

  return (
    <section className="w-full bg-[#0B0410] px-4 py-6 sm:px-2">
      <div className="mx-auto">
        {/* Announcement bar — Popular Games text ki jagah */}
        <div className="mb-4">
          <NoticeBar />
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 ">
          {popularCards.map((game) => {
            const isTrading = game.id === 2;
            const needsLogin = isTrading && !user;

            const gameImage = imgOverrides[game.key] || game.img;

            const Tile = (
              <div className={cardClass}>
                <img
                  src={gameImage}
                  alt={game.name}
                  className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
            );

            if (game.external && user) {
              return (
                <a
                  key={game.id}
                  href={game.to}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block w-full"
                >
                  {Tile}
                </a>
              );
            }

            const linkTo = needsLogin ? "/login" : game.to;

            return (
              <Link
                key={game.id}
                to={linkTo}
                state={needsLogin ? { from: game.to } : undefined}
                className="group block w-full"
              >
                {Tile}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PopularGamesCards;
