// src/admin/pages/GameImages.jsx
//
// Change the home-page game card images (wingo / trading / mines /
// indian powerball / matka / australian powerball) from the admin panel.
// Each card: current image preview + file picker + save.

import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getGameImages,
  updateGameImage,
  GAME_IMAGE_KEYS,
} from "../redux/gameImageSlice";
import {
  Upload,
  Image as ImageIcon,
  CheckCircle,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { toast } from "react-toastify";

// ============================ GAME CARD ============================

const GameImageCard = ({ game, currentImage, saving, dispatch }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setShowPreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedFile(file);
      setShowPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!selectedFile) {
      return toast.error("Pehle image select karo");
    }

    const formData = new FormData();
    formData.append("image", selectedFile);

    dispatch(updateGameImage({ key: game.key, formData })).then((res) => {
      if (!res.error) {
        toast.success(`${game.label} image updated!`);
        setSelectedFile(null);
        setShowPreview(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    });
  };

  const shownImage = preview || currentImage;

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:border-purple-200 transition-all duration-300">
      {/* Current image preview — same aspect as the client cards */}
      <div className="relative h-[170px] bg-[#1C0F2B]">
        {shownImage ? (
          <img
            src={shownImage}
            alt={game.label}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 gap-2">
            <ImageIcon size={28} />
            <span className="text-xs">Default image (no custom upload)</span>
          </div>
        )}
        {saving && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-white border-t-transparent" />
          </div>
        )}
      </div>

      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-800">{game.label}</h3>
          {currentImage && !preview && (
            <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
              <CheckCircle size={14} />
              Custom
            </span>
          )}
        </div>

        {/* File picker */}
        <div className="relative">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={handleFileChange}
          />
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-3 text-center hover:border-purple-500 hover:bg-purple-50/40 transition-all duration-200">
            {preview ? (
              <div className="flex items-center justify-center gap-2 text-green-600">
                <CheckCircle size={16} />
                <span className="text-xs font-medium">
                  New image selected
                </span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 text-gray-500">
                <ImageIcon size={16} />
                <span className="text-xs">Click to select new image</span>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={!selectedFile || saving}
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl px-4 py-2.5 font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
          ) : (
            <>
              <Upload size={16} />
              Save Image
            </>
          )}
        </button>
      </div>
    </div>
  );
};

// ============================ MAIN ============================

const GameImages = () => {
  const dispatch = useDispatch();
  const { images, loading, savingKey } = useSelector(
    (state) => state.gameImages
  );

  useEffect(() => {
    dispatch(getGameImages());
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(getGameImages());
    toast.info("Refreshing game images...");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-3">
              <Sparkles className="text-purple-600" size={32} />
              Game Images
            </h1>
            <p className="text-gray-500 mt-1">
              Home page ke popular game cards ki images yahan se change karo
            </p>
          </div>

          <button
            onClick={handleRefresh}
            className="p-2.5 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 hover:rotate-180"
            title="Refresh"
          >
            <RefreshCw size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Cards */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {GAME_IMAGE_KEYS.map((g) => (
              <div
                key={g.key}
                className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse"
              >
                <div className="h-[170px] bg-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="h-5 bg-gray-200 rounded w-1/2" />
                  <div className="h-12 bg-gray-200 rounded-xl" />
                  <div className="h-10 bg-gray-200 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {GAME_IMAGE_KEYS.map((game) => (
              <GameImageCard
                key={game.key}
                game={game}
                currentImage={images[game.key]}
                saving={savingKey === game.key}
                dispatch={dispatch}
              />
            ))}
          </div>
        )}

        {/* Note */}
        <div className="mt-8 text-sm text-gray-400 text-center">
          Save karne ke baad client home page par nayi image turant dikh
          jayegi (page refresh par). Preview mein jo default image hai wo
          tab tak dikhti hai jab tak custom upload nahi hota.
        </div>
      </div>
    </div>
  );
};

export default GameImages;
