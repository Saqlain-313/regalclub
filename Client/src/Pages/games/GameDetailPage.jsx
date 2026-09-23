// src/pages/GameDetailPage.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import gamesData from '../Data/GamesData';
import { 
  MdArrowBack,
  MdStar,
  MdTimer,
  MdAttachMoney,
  MdInfo,
  MdPlayArrow,
  MdShare,
  MdFavorite,
  MdFavoriteBorder
} from 'react-icons/md';
import { 
  FaTicketAlt, 
  FaUsers,
  FaFire,
  FaTrophy,
  FaCoins,
  FaShieldAlt
} from 'react-icons/fa';
import { GiMoneyStack } from 'react-icons/gi';

export default function GameDetailPage() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const [game, setGame] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  // सभी गेम्स को एक array में combine करें
  const allGames = [
    ...gamesData.liveCasino,
    ...gamesData.lotteryGames,
    ...gamesData.slotGames
  ];
  
  useEffect(() => {
    // Game ID के according गेम ढूंढें
    const foundGame = allGames.find(g => g.id === gameId);
    
    if (foundGame) {
      setGame(foundGame);
      // Check if game is in favorites (localStorage से)
      const favorites = JSON.parse(localStorage.getItem('favoriteGames') || '[]');
      setIsFavorite(favorites.includes(gameId));
    } else {
      // Game नहीं मिला तो home page पर redirect
      navigate('/');
    }
  }, [gameId, navigate]);
  
  const handlePlayNow = () => {
    // Game खेलने का logic
    alert(`Starting ${game?.name}...`);
  };
  
  const toggleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem('favoriteGames') || '[]');
    
    if (isFavorite) {
      // Remove from favorites
      const newFavorites = favorites.filter(id => id !== gameId);
      localStorage.setItem('favoriteGames', JSON.stringify(newFavorites));
    } else {
      // Add to favorites
      favorites.push(gameId);
      localStorage.setItem('favoriteGames', JSON.stringify(favorites));
    }
    
    setIsFavorite(!isFavorite);
  };
  
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: game?.name,
        text: `Check out ${game?.name} on our platform!`,
        url: window.location.href,
      });
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };
  
  if (!game) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading game...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Back Button */}
      <div className="container mx-auto px-4 py-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
        >
          <MdArrowBack />
          Back to Games
        </button>
        
        {/* Game Header */}
        <div className="bg-gradient-to-r from-gray-800/70 to-gray-900/70 backdrop-blur-sm rounded-2xl border border-yellow-800/30 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Game Image */}
            <div className="lg:w-1/3">
              <div className="relative rounded-xl overflow-hidden aspect-video lg:aspect-square">
                <img 
                  src={game.image} 
                  alt={game.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://wver.sprintstaticdata.com/v193/static/front/img/casino/default-2.jpeg';
                  }}
                />
                {game.isHot && (
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-red-500/30 text-red-300 rounded-full flex items-center gap-1 text-sm">
                      <FaFire />
                      HOT
                    </span>
                  </div>
                )}
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-3 mt-4">
                <button
                  onClick={handlePlayNow}
                  className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold py-3 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                >
                  <MdPlayArrow className="text-xl" />
                  PLAY NOW
                </button>
                
                <button
                  onClick={toggleFavorite}
                  className="p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  {isFavorite ? (
                    <MdFavorite className="text-xl text-red-500" />
                  ) : (
                    <MdFavoriteBorder className="text-xl text-gray-400" />
                  )}
                </button>
                
                <button
                  onClick={handleShare}
                  className="p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <MdShare className="text-xl text-gray-400" />
                </button>
              </div>
            </div>
            
            {/* Game Info */}
            <div className="lg:w-2/3">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                    {game.name}
                  </h1>
                  <div className="flex items-center gap-4 text-gray-400">
                    <div className="flex items-center gap-1">
                      <MdStar className="text-yellow-500" />
                      <span>{game.rating || 4.5}/5</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <FaUsers />
                      <span>{game.players || game.ticketsSold?.toLocaleString() || '1000'}+ playing</span>
                    </div>
                  </div>
                </div>
                
                {/* Provider Badge */}
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-800 rounded-lg">
                  <div className="w-8 h-8">
                    <img 
                      src={`https://wver.sprintstaticdata.com/v193/static/front/img/icons/${game.provider || 'default'}.png`}
                      alt={game.provider}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className="text-sm text-gray-300 capitalize">
                    {game.provider?.replace('-', ' ') || 'Provider'}
                  </span>
                </div>
              </div>
              
              {/* Game Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {/* Jackpot/Min Bet */}
                {game.jackpot ? (
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <GiMoneyStack className="text-yellow-500" />
                      <span className="text-gray-400 text-sm">Jackpot</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{game.jackpot}</div>
                  </div>
                ) : game.minBet ? (
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <MdAttachMoney className="text-green-500" />
                      <span className="text-gray-400 text-sm">Min Bet</span>
                    </div>
                    <div className="text-2xl font-bold text-white">₹{game.minBet}</div>
                  </div>
                ) : null}
                
                {/* Draw Time/Volatility */}
                {game.drawTime ? (
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <MdTimer className="text-blue-500" />
                      <span className="text-gray-400 text-sm">Next Draw</span>
                    </div>
                    <div className="text-lg font-bold text-white">{game.drawTime}</div>
                  </div>
                ) : game.volatility ? (
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <FaCoins className="text-orange-500" />
                      <span className="text-gray-400 text-sm">Volatility</span>
                    </div>
                    <div className="text-lg font-bold text-white">{game.volatility}</div>
                  </div>
                ) : null}
                
                {/* Tickets/RTP */}
                {game.ticketsSold ? (
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <FaTicketAlt className="text-purple-500" />
                      <span className="text-gray-400 text-sm">Tickets Sold</span>
                    </div>
                    <div className="text-2xl font-bold text-white">
                      {game.ticketsSold.toLocaleString()}
                    </div>
                  </div>
                ) : game.rtp ? (
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <FaTrophy className="text-green-500" />
                      <span className="text-gray-400 text-sm">RTP</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{game.rtp}%</div>
                  </div>
                ) : null}
                
                {/* Security Badge */}
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <FaShieldAlt className="text-green-500" />
                    <span className="text-gray-400 text-sm">Security</span>
                  </div>
                  <div className="text-lg font-bold text-white">Certified</div>
                </div>
              </div>
              
              {/* Description */}
              <div className="mb-6">
                <p className="text-gray-300">
                  {game.description || 'Enjoy this exciting game with amazing features and huge winning potential.'}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="bg-gradient-to-r from-gray-800/70 to-gray-900/70 backdrop-blur-sm rounded-xl border border-yellow-800/30 p-4 mb-6">
          <div className="flex overflow-x-auto gap-2 pb-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                activeTab === 'overview'
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              <MdInfo className="inline mr-2" />
              Overview
            </button>
            
            {game.rules && (
              <button
                onClick={() => setActiveTab('rules')}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  activeTab === 'rules'
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                Rules
              </button>
            )}
            
            {game.features && (
              <button
                onClick={() => setActiveTab('features')}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  activeTab === 'features'
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                Features
              </button>
            )}
            
            {game.prizeBreakdown && (
              <button
                onClick={() => setActiveTab('prizes')}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  activeTab === 'prizes'
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                Prizes
              </button>
            )}
          </div>
          
          {/* Tab Content */}
          <div className="p-4">
            {activeTab === 'overview' && (
              <div className="text-gray-300 space-y-4">
                <h3 className="text-xl font-bold text-white mb-2">Game Overview</h3>
                <p>
                  {game.description || 'This is an exciting game with immersive gameplay and excellent winning opportunities.'}
                </p>
                
                {game.languages && (
                  <div>
                    <h4 className="font-bold text-white mb-2">Available Languages</h4>
                    <div className="flex flex-wrap gap-2">
                      {game.languages.map((lang, index) => (
                        <span key={index} className="px-3 py-1 bg-gray-800 rounded-lg">
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'rules' && game.rules && (
              <div className="space-y-3">
                <h3 className="text-xl font-bold text-white mb-2">Game Rules</h3>
                <ul className="space-y-2">
                  {game.rules.map((rule, index) => (
                    <li key={index} className="flex items-start gap-2 text-gray-300">
                      <span className="text-yellow-500 mt-1">•</span>
                      {rule}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {activeTab === 'features' && game.features && (
              <div className="space-y-3">
                <h3 className="text-xl font-bold text-white mb-2">Game Features</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {game.features.map((feature, index) => (
                    <div key={index} className="bg-gray-800/50 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <span className="text-white">{feature}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {activeTab === 'prizes' && game.prizeBreakdown && (
              <div className="space-y-3">
                <h3 className="text-xl font-bold text-white mb-2">Prize Breakdown</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-gray-300">
                    <thead>
                      <tr className="bg-gray-800">
                        <th className="p-3 text-left">Match</th>
                        <th className="p-3 text-left">Prize</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(game.prizeBreakdown).map(([match, prize], index) => (
                        <tr key={index} className="border-b border-gray-700">
                          <td className="p-3">{match}</td>
                          <td className="p-3 font-bold text-yellow-400">{prize}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Similar Games */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Similar Games</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {allGames
              .filter(g => g.category === game.category && g.id !== game.id)
              .slice(0, 6)
              .map(similarGame => (
                <a
                  key={similarGame.id}
                  href={`/game/${similarGame.id}`}
                  className="group block"
                >
                  <div className="relative rounded-xl overflow-hidden aspect-[3/4] bg-gradient-to-br from-gray-800 to-gray-900">
                    <img 
                      src={similarGame.image} 
                      alt={similarGame.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <h3 className="text-white font-bold text-sm truncate">
                        {similarGame.name}
                      </h3>
                    </div>
                  </div>
                </a>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}