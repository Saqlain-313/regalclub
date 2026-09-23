import { Link } from "react-router-dom";

const games = [
  // MATKA
  // {
  //   title: "WORLD WIDE",
  //   name: "MATKA",
  //   image: "https://i.ibb.co/jPm1b0df/card-1.png",
  //   link: "/matka",
  //   bg: "from-purple-500 to-violet-400",
  // },

  // COUNTRIES
  {
    title: "UAE",
    name: "POWERBALL",
    image: "https://i.ibb.co/Myhgh4P9/UAE.png",
    link: "/powerhit",
    bg: "from-lime-500 to-green-400",
  },
  {
    title: "INDIA",
    name: "POWERBALL",
    image: "https://i.ibb.co/5x9z7CHT/INDIA.png",
    link: "/powerhit",
    bg: "from-blue-500 to-cyan-400",
  },
  {
    title: "AUSTRALIA",
    name: "POWERBALL",
    image: "https://i.ibb.co/mC3vNYmp/australia.png",
    link: "/powerhit",
    bg: "from-red-500 to-orange-400",
  },
  {
    title: "BANGLADESH",
    name: "POWERBALL",
    image: "https://i.ibb.co/b52g7h2N/bangladesh.png",
    link: "/powerhit",
    bg: "from-orange-500 to-yellow-400",
  },
  {
    title: "PAKISTAN",
    name: "POWERBALL",
    image: "https://i.ibb.co/rGzbp7fq/pakistan.png",
    link: "/powerhit",
    bg: "from-pink-500 to-rose-400",
  },
  {
    title: "NEPAL",
    name: "POWERBALL",
    image: "https://i.ibb.co/VY87Xqjh/nepal.png",
    link: "/powerhit",
    bg: "from-indigo-500 to-blue-400",
  },
];

export default function PopularGames() {
  const getGameLink = (game) => {
    // MATKA
    if (game.link === "/matka") {
      return "/matka";
    }

    // Country-wise Powerball
    return `/powerhit?country=${encodeURIComponent(game.title.toLowerCase())}`;
  };

  return (
    <section className="bg-[#0B0410] py-6 md:py-12">
      <div className="max-w-8xl mx-auto px-3 md:px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <span className="text-xl">🔥</span>

            <h2 className="text-lg md:text-2xl font-bold uppercase text-white">
              Powerball Games
            </h2>
          </div>

          {/* Grey View All Button - TopX Theme */}
          <button
            type="button"
            className="border border-[#3a2a4d] bg-[#1C0F2B] rounded-lg px-4 py-1.5 text-sm font-medium text-gray-300 hover:bg-[#2a1b3d] hover:text-white transition-all shadow-[0_2px_6px_rgba(0,0,0,0.4)]"
          >
            View All
          </button>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-3 gap-3 mr-3">
          {games.map((game, index) => (
            <Link
              key={`${game.title}-${index}`}
              to={getGameLink(game)}
              className="group relative rounded-xl overflow-hidden bg-[#1C0F2B] border border-[#2a1b3d] shadow-[0_4px_12px_rgba(0,0,0,0.5)] block transition duration-300 hover:border-[#00E676]/50 hover:shadow-[0_6px_18px_rgba(0,230,118,0.15)]"
              style={{
                height: "130px",
                width: "107%",
              }}
            >
              {/* Background Image */}
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100"
                style={{
                  backgroundImage: `url(${game.image})`,
                }}
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
