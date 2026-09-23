import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getWinMultipliers,
  updateWinMultipliers,
  clearWinMultiplierMessage,
} from "../redux/winMultiplierSlice";

const AdminWinMultipliers = () => {
  const dispatch = useDispatch();

  const {
    multipliers,
    loading,
    updateLoading,
    error,
    success,
  } = useSelector((state) => state.winMultiplier);

  const [formData, setFormData] = useState({});
  const [editedFields, setEditedFields] = useState({});

  // ======================================================
  // FETCH DATA
  // ======================================================
  useEffect(() => {
    dispatch(getWinMultipliers());
  }, [dispatch]);

  // ======================================================
  // SET FORM DATA
  // ======================================================
  useEffect(() => {
    if (multipliers && Object.keys(multipliers).length > 0) {
      setFormData(multipliers);
    }
  }, [multipliers]);

  // ======================================================
  // CLEAR MESSAGE
  // ======================================================
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        dispatch(clearWinMultiplierMessage());
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [success, error, dispatch]);

  // ======================================================
  // INPUT CHANGE
  // ======================================================
  const handleChange = (gameType, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [gameType]: {
        ...prev[gameType],
        [field]: field === "value" ? Number(value) : value,
      },
    }));
    
    setEditedFields((prev) => ({
      ...prev,
      [gameType]: true,
    }));
  };

  // ======================================================
  // SUBMIT
  // ======================================================
  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(updateWinMultipliers(formData));
    setEditedFields({});
  };

  // ======================================================
  // LOADING
  // ======================================================
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <div className="text-lg font-semibold text-gray-700">
            Loading multipliers...
          </div>
        </div>
      </div>
    );
  }

  const hasChanges = Object.keys(editedFields).length > 0;

  return (
    <div className="p-4 md:p-6">

      {/* ==================================================
          HEADER
      ================================================== */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            Win Multipliers
          </h1>
          <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-2">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            Configure winning multipliers for each game type
          </p>
        </div>
        <button
          onClick={() => dispatch(getWinMultipliers())}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <svg className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* ==================================================
          SUCCESS
      ================================================== */}
      {success && (
        <div className="mb-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-2.5 flex items-center gap-2.5 animate-in slide-in-from-top-1 duration-200">
          <svg className="w-4 h-4 text-emerald-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Win multipliers updated successfully.
          <button 
            onClick={() => dispatch(clearWinMultiplierMessage())}
            className="ml-auto text-emerald-400 hover:text-emerald-600 transition-colors"
          >
            ✕
          </button>
        </div>
      )}

      {/* ==================================================
          ERROR
      ================================================== */}
      {error && (
        <div className="mb-4 rounded-xl bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 flex items-center gap-2.5 animate-in slide-in-from-top-1 duration-200">
          <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
          <button 
            onClick={() => dispatch(clearWinMultiplierMessage())}
            className="ml-auto text-red-400 hover:text-red-600 transition-colors"
          >
            ✕
          </button>
        </div>
      )}

      {/* ==================================================
          FORM
      ================================================== */}
      <form onSubmit={handleSubmit}>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">

          {/* TABLE HEADER */}
          <div className="grid grid-cols-12 gap-4 px-5 py-3 bg-gray-50/80 border-b border-gray-200">
            <div className="col-span-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              #
            </div>
            <div className="col-span-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Game Type
            </div>
            <div className="col-span-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Display Name
            </div>
            <div className="col-span-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Multiplier
            </div>
          </div>

          {/* ==================================================
              ROWS
          ================================================== */}
          {Object.entries(formData).map(
            ([gameType, item], index) => {
              const isEdited = editedFields[gameType];
              const gameColors = {
                'classic': 'bg-blue-50 text-blue-700 border-blue-200',
                'gold': 'bg-amber-50 text-amber-700 border-amber-200',
                'diamond': 'bg-cyan-50 text-cyan-700 border-cyan-200',
                'premium': 'bg-purple-50 text-purple-700 border-purple-200',
                'royal': 'bg-red-50 text-red-700 border-red-200',
              };
              const colorClass = gameColors[gameType] || 'bg-gray-50 text-gray-700 border-gray-200';
              
              return (
                <div
                  key={gameType}
                  className={`grid grid-cols-12 gap-4 px-5 py-3.5 border-b last:border-b-0 items-center transition-colors ${
                    isEdited ? 'bg-blue-50/40' : 'hover:bg-gray-50/50'
                  }`}
                >
                  {/* NUMBER */}
                  <div className="col-span-1">
                    <span className={`inline-flex items-center justify-center w-6 h-6 text-xs font-medium rounded ${
                      isEdited ? 'bg-blue-200 text-blue-700' : 'bg-gray-100 text-gray-400'
                    }`}>
                      {index + 1}
                    </span>
                  </div>

                  {/* GAME TYPE */}
                  <div className="col-span-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg border ${colorClass}`}>
                      <span className="text-sm">
                        {gameType === 'classic' && '🎮'}
                        {gameType === 'gold' && '⭐'}
                        {gameType === 'diamond' && '💎'}
                        {gameType === 'premium' && '👑'}
                        {gameType === 'royal' && '🏆'}
                        {!['classic','gold','diamond','premium','royal'].includes(gameType) && '🎯'}
                      </span>
                      {gameType.replaceAll("-", " ")}
                    </span>
                  </div>

                  {/* NAME */}
                  <div className="col-span-4">
                    <input
                      type="text"
                      value={item?.name || ""}
                      onChange={(e) =>
                        handleChange(
                          gameType,
                          "name",
                          e.target.value
                        )
                      }
                      className={`w-full border rounded-lg px-3 py-1.5 text-sm outline-none transition-all ${
                        isEdited
                          ? 'border-blue-400 ring-2 ring-blue-100 bg-white'
                          : 'border-gray-200 bg-gray-50/50 hover:bg-white focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100'
                      }`}
                      placeholder="Display name"
                    />
                  </div>

                  {/* VALUE */}
                  <div className="col-span-3">
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item?.value ?? ""}
                        onChange={(e) =>
                          handleChange(
                            gameType,
                            "value",
                            e.target.value
                          )
                        }
                        className={`w-full border rounded-lg px-3 py-1.5 pr-7 text-sm outline-none transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                          isEdited
                            ? 'border-blue-400 ring-2 ring-blue-100 bg-white'
                            : 'border-gray-200 bg-gray-50/50 hover:bg-white focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100'
                        }`}
                        placeholder="0.00"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium pointer-events-none">
                        ×
                      </span>
                    </div>
                  </div>
                </div>
              );
            }
          )}

          {/* ==================================================
              FOOTER
          ================================================== */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-4 bg-gray-50/80 border-t border-gray-200">
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1.5">
                <span className={`inline-block w-1.5 h-1.5 rounded-full transition-colors ${hasChanges ? 'bg-blue-500 animate-pulse' : 'bg-gray-300'}`}></span>
                {hasChanges ? `${Object.keys(editedFields).length} field${Object.keys(editedFields).length > 1 ? 's' : ''} changed` : 'No changes'}
              </span>
              {hasChanges && (
                <button
                  type="button"
                  onClick={() => {
                    setFormData(multipliers);
                    setEditedFields({});
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors underline-offset-2 hover:underline"
                >
                  Reset
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={updateLoading || !hasChanges}
              className={`px-6 py-2 rounded-lg text-sm font-semibold text-white transition-all ${
                updateLoading || !hasChanges
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 active:scale-[0.98] shadow-sm hover:shadow-md"
              }`}
            >
              {updateLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Updating...
                </span>
              ) : (
                "Save Multipliers"
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AdminWinMultipliers;