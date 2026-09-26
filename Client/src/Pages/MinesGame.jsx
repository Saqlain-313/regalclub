import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import mineBlastSound from "../assets/faah.mp3";
import { getProfile } from "../redux/slices/authSlice";
import { getCurrencyRates } from "../redux/slices/currencyRateSlice";
import {
  cashoutMines,
  resetMinesGame,
  revealMine,
  startMinesGame,
  syncMinesSocketCashout,
  syncMinesSocketUpdate,
} from "../redux/slices/minesSlice";
import { socket } from "../services/socket";

// ============================================================
// CURRENCY - USER COUNTRY BASED
// ============================================================
const COUNTRY_ALIASES = {
  in: "IN",
  india: "IN",
  au: "AU",
  australia: "AU",
  np: "NP",
  nepal: "NP",
  pk: "PK",
  pakistan: "PK",
  bd: "BD",
  bangladesh: "BD",
  ae: "AE",
  uae: "AE",
  dubai: "AE",
  "united arab emirates": "AE",
};

const ALLOWED_GAME_COUNTRIES = new Set(["IN", "AU", "NP", "PK", "BD", "AE"]);

const CURRENCY_CONFIG = {
  IN: { code: "INR", symbol: "₹", locale: "en-IN" },
  AU: { code: "AUD", symbol: "A$", locale: "en-AU" },
  NP: { code: "NPR", symbol: "रू", locale: "en-NP" },
  PK: { code: "PKR", symbol: "Rs", locale: "en-PK" },
  BD: { code: "BDT", symbol: "৳", locale: "en-BD" },
  AE: { code: "AED", symbol: "د.إ", locale: "en-AE" },
};

const normalizeCountryCode = (country) => {
  if (!country) return "IN";
  const key = String(country).trim().toLowerCase();
  return COUNTRY_ALIASES[key] || key.toUpperCase();
};

const TOTAL_CELLS = 36;

export default function MinesGame() {
  const dispatch = useDispatch();

  const { game, loading, message } = useSelector((state) => state.mines);
  const authUser = useSelector((state) => state.auth?.user || null);
  const currencyRates = useSelector(
    (state) => state.currencyRate?.currencies || [],
  );

  const [betAmount, setBetAmount] = useState("50");
  const [betAmountInput, setBetAmountInput] = useState("50");
  const [amountError, setAmountError] = useState("");
  const [explosion, setExplosion] = useState(false);
  const [explosionCell, setExplosionCell] = useState(null);

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (currencyRates.length === 0) {
      dispatch(getCurrencyRates());
    }
  }, [dispatch, currencyRates.length]);

  useEffect(() => {
    if (!userId) return;

    socket.emit("join-user", userId);

    const handleUpdate = (data) => {
      dispatch(syncMinesSocketUpdate(data));
    };

    const handleCashout = (data) => {
      dispatch(syncMinesSocketCashout(data));
    };

    socket.on("mines-update", handleUpdate);
    socket.on("mines-cashout", handleCashout);

    return () => {
      socket.off("mines-update", handleUpdate);
      socket.off("mines-cashout", handleCashout);
    };
  }, [userId, dispatch]);

  useEffect(() => {
    if (game?.status !== "lost") return;
    if (explosionCell === null) {
      setExplosion(true);
    }
  }, [game?.status, explosionCell]);

  const startGame = async () => {
    if (!ALLOWED_GAME_COUNTRIES.has(userCountryCode)) {
      setAmountError(
        "Mines Game is available only in India, Australia, Nepal, Pakistan, Bangladesh and UAE (Dubai).",
      );
      return;
    }

    if (betAmount === "" || String(betAmount).trim() === "") {
      setAmountError("Please select or enter a game amount first.");
      return;
    }

    const amount = Number(betAmount);

    if (!Number.isFinite(amount) || amount <= 0) {
      setAmountError(
        `Please enter a valid ${currencyConfig.code} game amount.`,
      );
      return;
    }

    setAmountError("");

    dispatch(
      startMinesGame({
        minesCount: 20,
        virtualStake: amount,
      }),
    ).then((action) => {
      if (startMinesGame.fulfilled.match(action)) {
        // Join the socket room for this specific game
        socket.emit("join-mines-game", action.payload.game.id);

        // Refresh profile so the UI shows the freshly deducted credit.
        // If it was an existing game (no deduction), this is still safe.
        if (!action.payload.existingGame) {
          dispatch(getProfile());
        }
      }
    });
  };

  const playMineSound = () => {
    try {
      const audio = new Audio(mineBlastSound);
      audio.preload = "auto";
      audio.volume = 1;
      const promise = audio.play();
      if (promise?.catch) {
        promise.catch((error) => {
          console.warn("Mine sound playback was blocked:", error);
        });
      }
    } catch (error) {
      console.error("Mine sound error:", error);
    }
  };

  const triggerMineExplosion = (cell) => {
    setExplosionCell(cell);
    setExplosion(true);
    playMineSound();
  };

  const reveal = (cell) => {
    if (!game || game.status !== "playing") return;
    if (game.openedCells?.includes(cell)) return;

    dispatch(
      revealMine({
        gameId: game.id,
        cell,
      }),
    ).then((action) => {
      if (!revealMine.fulfilled.match(action)) return;

      const status = action.payload?.result?.status;

      if (status === "lost") {
        triggerMineExplosion(cell);
      }

      // Auto-win (all safe cells opened) — credit was added server-side.
      // Refresh profile so credit shows the win immediately.
      if (status === "won") {
        dispatch(getProfile());
      }
    });
  };

  const cashout = () => {
    if (!game || game.status !== "playing") return;
    if (Number(game.safeCells || 0) <= 0) return;

    dispatch(
      cashoutMines({
        gameId: game.id,
      }),
    ).then((action) => {
      if (cashoutMines.fulfilled.match(action)) {
        // Credit was credited server-side. Refresh profile.
        dispatch(getProfile());
      }
    });
  };

  const currentWin =
    Number(game?.entryAmount ?? game?.virtualStake ?? 0) *
    Number(game?.multiplier || 1);

  const profileUser = authUser || {};
  const currentCountry = profileUser?.country || "india";
  const userCountryCode = normalizeCountryCode(currentCountry);
  const isGameCountryAllowed = ALLOWED_GAME_COUNTRIES.has(userCountryCode);

  const currencyCountryCode = ALLOWED_GAME_COUNTRIES.has(userCountryCode)
    ? userCountryCode
    : "IN";

  const currencyConfig =
    CURRENCY_CONFIG[currencyCountryCode] || CURRENCY_CONFIG.IN;

  const userCurrencyRate = useMemo(() => {
    if (userCountryCode === "IN") return null;
    const rates = Array.isArray(currencyRates) ? currencyRates : [];
    return (
      rates.find((item) => {
        const itemCountry = String(
          item?.countryCode ?? item?.country_code ?? item?.country ?? "",
        )
          .trim()
          .toUpperCase();

        const rateCountryCode =
          currencyCountryCode === "AE" ? "AE" : currencyCountryCode;

        return itemCountry === rateCountryCode && item?.status !== false;
      }) || null
    );
  }, [currencyRates, userCountryCode, currencyCountryCode]);

  const convertToLocalAmount = (value) => {
    const amount = Number(value);
    return Number.isFinite(amount) ? amount : 0;
  };

  const money = (value, sign = "") => {
    const convertedAmount = convertToLocalAmount(value);
    const decimals = currencyConfig.code === "JPY" ? 0 : 2;
    const formatted = convertedAmount.toLocaleString(currencyConfig.locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
    return `${sign}${currencyConfig.symbol} ${formatted}`;
  };

  const formatInputAmount = (value) => {
    const convertedAmount = convertToLocalAmount(value);
    const decimals = currencyConfig.code === "JPY" ? 0 : 2;
    if (!Number.isFinite(convertedAmount)) return "";
    return convertedAmount.toFixed(decimals);
  };

  const currencySymbol = currencyConfig.symbol;

  useEffect(() => {
    if (betAmount === "50" && betAmountInput === "50") {
      setBetAmountInput(formatInputAmount(50));
    }
  }, [
    betAmount,
    betAmountInput,
    userCountryCode,
    currencyCountryCode,
    currencyConfig.code,
  ]);

  // ============================================================
  // COVERED TILE (Purple Theme)
  // ============================================================
  const coveredTile =
    "group relative aspect-square overflow-hidden rounded-[13px] " +
    "border-[2px] border-[#C77AFF] " +
    "bg-gradient-to-br from-[#B45CFF] via-[#7418F5] to-[#3A00C9] " +
    "shadow-[0_0_8px_#B45CFF,0_0_18px_rgba(139,43,255,0.75),inset_0_2px_4px_rgba(255,255,255,0.45),inset_0_-5px_8px_rgba(30,0,100,0.45)] " +
    "transition-all duration-150 " +
    "hover:-translate-y-[1px] hover:brightness-110 " +
    "active:translate-y-[2px]";

  const renderCoveredRock = () => (
    <>
      <span className="absolute inset-[6px] rounded-[9px] bg-[linear-gradient(135deg,rgba(255,255,255,.25),transparent_30%,rgba(58,0,201,.25)_57%,rgba(180,92,255,.35))]" />
      <span className="absolute left-[12%] top-[10%] h-[42%] w-[52%] rounded-[40%] bg-white/20 blur-[7px]" />
      <span className="absolute -left-[10%] bottom-[8%] h-[45%] w-[70%] rotate-[17deg] rounded-[50%] bg-[#3A00C9]/30 blur-[3px]" />
      <span className="absolute right-[7%] top-[27%] h-[24%] w-[28%] rotate-[35deg] bg-[#C77AFF]/40 [clip-path:polygon(50%_0,100%_35%,75%_100%,15%_80%,0_30%)]" />
      <span className="absolute bottom-[7%] right-[14%] h-[25%] w-[34%] -rotate-[20deg] bg-[#B45CFF]/50 [clip-path:polygon(20%_0,100%_30%,75%_100%,0_72%)]" />
    </>
  );

  const renderOpenTile = (isMine) => {
    const isBlastedMine = isMine && explosion && explosionCell !== null;

    return (
      <div
        className={`relative flex aspect-square items-center justify-center overflow-hidden rounded-[13px] border-[2px] transition-all duration-300 ${
          isBlastedMine
            ? "border-[#ff3b16] bg-gradient-to-br from-[#ffb02e] via-[#d93416] to-[#4a0905] shadow-[inset_0_2px_4px_rgba(255,255,255,.55),inset_0_-8px_14px_rgba(45,0,0,.65),0_0_18px_rgba(255,72,20,.65)]"
            : isMine
              ? "border-[#65140d] bg-gradient-to-br from-[#4b1712] via-[#2a0d0a] to-[#130807]"
              : "border-[#00E676]/50 bg-gradient-to-br from-[#0a2a1a] via-[#0d1f14] to-[#06120a]"
        } shadow-[inset_0_2px_3px_rgba(255,255,255,.12),inset_0_-7px_12px_rgba(0,0,0,.75),0_3px_6px_rgba(0,0,0,.55)]`}
      >
        {isBlastedMine && (
          <span className="absolute inset-0 z-[1] animate-pulse bg-[radial-gradient(circle_at_center,rgba(255,245,180,.82)_0%,rgba(255,111,0,.58)_25%,rgba(190,25,5,.45)_55%,transparent_80%)]" />
        )}

        <span className="absolute inset-[5px] z-[2] rounded-[9px] bg-black/20" />

        <span
          className="absolute inset-0 z-[2] opacity-80"
          style={{
            background: `
              linear-gradient(58deg,
                transparent 47%,
                rgba(255,255,255,.20) 48%,
                rgba(0,0,0,.55) 49%,
                transparent 51%
              ),
              linear-gradient(122deg,
                transparent 45%,
                rgba(255,255,255,.14) 46%,
                rgba(0,0,0,.6) 48%,
                transparent 50%
              ),
              linear-gradient(18deg,
                transparent 55%,
                rgba(0,0,0,.55) 56%,
                transparent 58%
              ),
              linear-gradient(150deg,
                transparent 62%,
                rgba(255,255,255,.10) 63%,
                rgba(0,0,0,.6) 65%,
                transparent 67%
              )
            `,
          }}
        />

        <span
          className="absolute left-1/2 top-1/2 z-[2] h-[55%] w-[55%] -translate-x-1/2 -translate-y-1/2 rotate-45 opacity-40"
          style={{
            clipPath:
              "polygon(50% 0%, 62% 35%, 100% 50%, 63% 64%, 50% 100%, 37% 64%, 0% 50%, 38% 35%)",
            background:
              "linear-gradient(135deg, rgba(255,255,255,.18), rgba(0,0,0,.65))",
          }}
        />

        <span className="absolute left-[20%] top-[25%] z-[3] h-[45%] w-[2px] rotate-[38deg] bg-black/60" />
        <span className="absolute right-[22%] top-[20%] z-[3] h-[42%] w-[2px] -rotate-[48deg] bg-black/60" />
        <span className="absolute bottom-[20%] left-[32%] z-[3] h-[38%] w-[2px] rotate-[72deg] bg-white/10" />

        <span className="relative z-10 text-3xl drop-shadow-[0_3px_4px_rgba(0,0,0,.8)] sm:text-4xl">
          {isMine ? "💣" : "💎"}
        </span>

        <span className="pointer-events-none absolute inset-0 z-[4] rounded-[11px] shadow-[inset_0_0_18px_rgba(0,0,0,.65)]" />
      </div>
    );
  };

  return (
    <>
      <style>{`
        @keyframes minesScreenShake {
          0%, 100% { transform: translate3d(0, 0, 0); }
          8% { transform: translate3d(-9px, 3px, 0) rotate(-0.3deg); }
          16% { transform: translate3d(10px, -4px, 0) rotate(0.3deg); }
          25% { transform: translate3d(-8px, -3px, 0); }
          34% { transform: translate3d(8px, 3px, 0); }
          44% { transform: translate3d(-6px, 1px, 0); }
          55% { transform: translate3d(6px, -2px, 0); }
          68% { transform: translate3d(-4px, 1px, 0); }
          82% { transform: translate3d(3px, -1px, 0); }
        }

        @keyframes blastCore {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(.1); }
          8% { opacity: 1; transform: translate(-50%, -50%) scale(.55); }
          17% { opacity: 1; transform: translate(-50%, -50%) scale(1.05); }
          28% { opacity: .95; transform: translate(-50%, -50%) scale(.9); }
          100% { opacity: .18; transform: translate(-50%, -50%) scale(1.35); }
        }

        @keyframes blastGlow {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(.1); }
          15% { opacity: .95; }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(2); }
        }

        @keyframes blastRing {
          0% { opacity: 1; transform: translate(-50%, -50%) scale(.2); }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(2.2); }
        }

        @keyframes debrisBurst {
          0% { opacity: 1; transform: translate(-50%, -50%) scale(.2) rotate(0deg); }
          100% {
            opacity: 0;
            transform:
              translate(calc(-50% + var(--dx)), calc(-50% + var(--dy)))
              scale(var(--scale))
              rotate(var(--rot));
          }
        }

        @keyframes smokePuff {
          0% { opacity: .65; transform: translate(-50%, -50%) scale(.35); }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(1.7); }
        }

        .mines-screen-shake { animation: minesScreenShake 1.15s cubic-bezier(.36,.07,.19,.97) both; }
        .blast-core { animation: blastCore 1.05s ease-out forwards; }
        .blast-glow { animation: blastGlow 1.2s ease-out forwards; }
        .blast-ring { animation: blastRing 1s ease-out forwards; }
        .debris { animation: debrisBurst 900ms cubic-bezier(.12,.72,.2,1) forwards; }
        .smoke-puff { animation: smokePuff 1.2s ease-out forwards; }

        @media (prefers-reduced-motion: reduce) {
          .mines-screen-shake, .blast-core, .blast-glow, .blast-ring, .debris, .smoke-puff {
            animation: none !important;
          }
        }
      `}</style>

      <div
        className={`min-h-screen bg-[#0B0410] text-white px-3 py-4 sm:px-5 ${
          explosion ? "mines-screen-shake" : ""
        }`}
      >
        <div className="mx-auto w-full max-w-5xl">
          {/* Title */}
          <div className="relative mb-5 flex items-center justify-center">
            <div className="absolute h-px w-full bg-gradient-to-r from-transparent via-[#9B59B6] to-transparent" />
            <div className="relative flex items-center gap-2 rounded-full border border-[#C77AFF] bg-gradient-to-br from-[#B45CFF] via-[#7418F5] to-[#3A00C9] px-6 py-2 shadow-[0_0_8px_#B45CFF,0_0_18px_rgba(139,43,255,0.75)]">
              <span>⛏️</span>
              <h1 className="text-xl font-black tracking-wide text-white sm:text-2xl">
                MINING GAME
              </h1>
              <span>⛏️</span>
            </div>
          </div>

          {game && (
            <>
              {/* Stats */}
              <div className="mb-4 grid grid-cols-3 gap-2 sm:gap-3">
                <div className="rounded-xl border border-[#2a1b3d] bg-[#1C0F2B] p-3 text-center shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400">
                    Total Mines
                  </p>
                  <p className="mt-1 text-xl font-black text-[#9B59B6]">
                    {game.minesCount || 15}
                  </p>
                </div>
                <div className="rounded-xl border border-[#2a1b3d] bg-[#1C0F2B] p-3 text-center shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400">
                    Current Reward
                  </p>
                  <p className="mt-1 text-xl font-black text-[#F1C40F]">
                    {money(currentWin)}
                  </p>
                </div>
                <div className="rounded-xl border border-[#2a1b3d] bg-[#1C0F2B] p-3 text-center shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400">
                    Safe Cells
                  </p>
                  <p className="mt-1 text-xl font-black text-[#00E676]">
                    {game.safeCells || 0}/
                    {TOTAL_CELLS - Number(game.minesCount || 0)}
                  </p>
                </div>
              </div>

              {/* Game info */}
              <div className="mb-3 flex items-center justify-between rounded-xl border border-[#2a1b3d] bg-[#12061C] px-3 py-2 shadow-[0_4px_12px_rgba(0,0,0,0.5)] sm:px-5">
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-gray-500">
                    Entry
                  </span>
                  <p className="font-black text-gray-200">
                    {money(game.entryAmount ?? game.virtualStake)}
                  </p>
                </div>
                <div className="text-center">
                  <span className="text-[9px] uppercase tracking-wider text-gray-500">
                    Multiplier
                  </span>
                  <p className="font-black text-[#F1C40F]">
                    {Number(game.multiplier || 1).toFixed(2)}x
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[9px] uppercase tracking-wider text-gray-500">
                    Win
                  </span>
                  <p className="font-black text-[#00E676]">
                    {money(currentWin)}
                  </p>
                </div>
              </div>

              {/* 6 x 6 board */}
              <section className="relative rounded-[22px] border border-[#2a1b3d] bg-[#1C0F2B] p-2.5 shadow-[0_8px_24px_rgba(0,0,0,0.6)] sm:p-4">
                <div className="mb-3 flex items-center justify-between rounded-xl border border-[#2a1b3d] bg-[#0B0410] px-3 py-2 text-[#9B59B6]">
                  <span className="text-[10px] font-bold uppercase tracking-[.18em]">
                    6 × 6 Mine Field
                  </span>
                  <span className="text-[10px] text-gray-400">
                    Find gold • avoid mines
                  </span>
                </div>

                <div className="relative grid grid-cols-6 gap-1.5 sm:gap-2.5">
                  {Array.from({ length: TOTAL_CELLS }).map((_, index) => {
                    const opened = game.openedCells?.includes(index);
                    const isMine = game.minePositions?.includes(index);

                    return (
                      <button
                        key={index}
                        disabled={
                          opened || game.status !== "playing" || loading
                        }
                        onClick={() => reveal(index)}
                        aria-label={`Mine cell ${index + 1}`}
                        className={`${opened ? "" : coveredTile} ${
                          !opened && game.status !== "playing"
                            ? "opacity-60"
                            : ""
                        }`}
                      >
                        {opened ? renderOpenTile(isMine) : renderCoveredRock()}
                      </button>
                    );
                  })}

                  {/* Explosion overlay */}
                  {explosion &&
                    explosionCell !== null &&
                    game?.status === "lost" && (
                      <>
                        <div
                          className="pointer-events-none absolute inset-0 z-[60]"
                          aria-live="assertive"
                          aria-label="Mine hit"
                        >
                          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,190,70,.12),transparent_52%)]" />

                          <div
                            className="absolute grid grid-cols-6 grid-rows-6 gap-1.5 sm:gap-2.5"
                            style={{ inset: "0", padding: "0" }}
                          >
                            <div
                              className="relative flex items-center justify-center"
                              style={{
                                gridColumn: (explosionCell % 6) + 1,
                                gridRow: Math.floor(explosionCell / 6) + 1,
                              }}
                            >
                              <span className="blast-ring absolute left-1/2 top-1/2 h-[78%] w-[78%] rounded-full border-[5px] border-[#ffd34e] shadow-[0_0_24px_10px_rgba(255,111,0,.5)]" />
                              <span className="smoke-puff absolute left-1/2 top-1/2 h-[88%] w-[88%] rounded-full bg-[radial-gradient(circle,rgba(55,35,22,.65),rgba(28,20,15,.3)_55%,transparent_72%)] blur-[3px]" />
                              <span className="blast-glow absolute left-1/2 top-1/2 h-[95%] w-[95%] rounded-full bg-[radial-gradient(circle,#fffbd5_0%,#ffd23d_18%,#ff8a00_40%,#ed3b16_62%,transparent_73%)] blur-[2px]" />
                              <span
                                className="blast-core absolute left-1/2 top-1/2 h-[78%] w-[78%] overflow-visible rounded-full"
                                style={{
                                  background:
                                    "radial-gradient(circle at 50% 50%, #fffbd5 0%, #ffd447 16%, #ff8b13 38%, #e33b16 59%, rgba(113,17,8,.8) 68%, transparent 70%)",
                                  clipPath:
                                    "polygon(50% 0%, 59% 17%, 72% 7%, 76% 25%, 94% 24%, 84% 40%, 100% 50%, 83% 59%, 94% 75%, 75% 76%, 72% 94%, 58% 83%, 50% 100%, 41% 83%, 25% 94%, 24% 76%, 6% 75%, 17% 59%, 0% 50%, 17% 40%, 6% 24%, 24% 25%, 28% 7%, 41% 17%)",
                                }}
                              />
                              <span
                                className="blast-core absolute left-1/2 top-1/2 h-[35%] w-[35%] rounded-full"
                                style={{
                                  background:
                                    "radial-gradient(circle, #ffffff 0%, #fff4a8 28%, #ffcf3a 55%, #ff7512 100%)",
                                  filter: "blur(1px)",
                                }}
                              />
                              <span className="absolute left-1/2 top-1/2 z-[25] -translate-x-1/2 -translate-y-1/2 text-2xl drop-shadow-[0_3px_5px_rgba(0,0,0,.9)] sm:text-3xl">
                                💣
                              </span>
                              {[
                                ["-92px", "-72px", "10px", "38deg", "#ffd65b"],
                                ["82px", "-78px", "8px", "-54deg", "#9b6a20"],
                                ["-112px", "-8px", "7px", "74deg", "#e24b1e"],
                                ["108px", "18px", "11px", "-35deg", "#ffb72e"],
                                ["-75px", "91px", "9px", "-70deg", "#6f4b25"],
                                ["76px", "96px", "7px", "45deg", "#f06b20"],
                                ["-38px", "-108px", "6px", "22deg", "#ffe58a"],
                                ["35px", "116px", "10px", "-30deg", "#c53d18"],
                                ["-128px", "48px", "6px", "88deg", "#d79b2c"],
                                ["132px", "-42px", "8px", "-72deg", "#ffcf4a"],
                                ["-18px", "128px", "5px", "54deg", "#8d6125"],
                                ["22px", "-130px", "7px", "-42deg", "#ed4b1a"],
                              ].map(([dx, dy, scale, rot, color], index) => (
                                <span
                                  key={index}
                                  className="debris absolute left-1/2 top-1/2 rounded-[2px] shadow-[0_0_5px_rgba(255,170,40,.55)]"
                                  style={{
                                    "--dx": dx,
                                    "--dy": dy,
                                    "--scale": scale === "5px" ? "0.9" : "1.15",
                                    "--rot": rot,
                                    width: scale,
                                    height: scale,
                                    background: color,
                                    animationDelay: `${index * 18}ms`,
                                  }}
                                />
                              ))}
                              <span className="absolute left-1/2 top-1/2 h-[52%] w-[52%] -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-black/45 bg-black/25 shadow-[inset_0_4px_8px_rgba(0,0,0,.75),0_0_12px_rgba(0,0,0,.5)]" />
                            </div>
                          </div>
                        </div>

                        <div className="absolute left-1/2 top-1/2 z-[70] flex w-[min(82%,320px)] -translate-x-1/2 -translate-y-1/2 flex-col items-center">
                          <div className="mb-3 w-full rounded-2xl border-2 border-[#ffb62b] bg-gradient-to-r from-[#1a0d08] via-[#3d1a0e] to-[#1a0d08] px-6 py-2.5 text-center shadow-[0_8px_30px_rgba(0,0,0,.5),0_0_40px_rgba(255,120,0,.2)] animate-pulse">
                            <div className="flex items-center justify-center gap-2">
                              <span className="h-2 w-2 animate-pulse rounded-full bg-[#ff4a2f] shadow-[0_0_10px_#ff4a2f]" />
                              <p className="text-sm font-black tracking-[.15em] text-[#ffe18a]">
                                💥 MINE HIT
                              </p>
                              <span className="h-2 w-2 animate-pulse rounded-full bg-[#ff4a2f] shadow-[0_0_10px_#ff4a2f]" />
                            </div>
                            <p className="text-[9px] font-bold uppercase tracking-[.2em] text-white/60">
                              Game Over • Start a New Game
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              setExplosion(false);
                              setExplosionCell(null);
                              dispatch(resetMinesGame());
                            }}
                            className="group relative w-full overflow-hidden rounded-2xl border border-[#C77AFF] bg-gradient-to-br from-[#B45CFF] via-[#7418F5] to-[#3A00C9] px-6 py-3.5 font-bold text-white shadow-[0_0_8px_#B45CFF,0_0_18px_rgba(139,43,255,0.75),inset_0_2px_4px_rgba(255,255,255,0.45),inset_0_-5px_8px_rgba(30,0,100,0.45)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.97] cursor-pointer"
                          >
                            <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                            <div className="relative flex items-center justify-center gap-3">
                              <span className="text-lg group-hover:rotate-180 transition-transform duration-500">
                                🔄
                              </span>
                              <span className="text-sm font-bold tracking-wide sm:text-base">
                                START NEW GAME
                              </span>
                              <span className="text-lg group-hover:translate-x-1 transition-transform duration-300">
                                →
                              </span>
                            </div>
                          </button>
                        </div>
                      </>
                    )}
                </div>

                {/* Cashout overlay - same position as Mine Hit */}
                {game?.status === "cashout" && !explosion && (
                  <div className="absolute inset-0 z-[70] flex items-center justify-center bg-[#0B0410]/55 px-4 backdrop-blur-[2px]">
                    <div className="flex w-[min(82%,320px)] flex-col items-center">
                      <div className="mb-3 w-full rounded-2xl border-2 border-[#00E676] bg-gradient-to-r from-[#07180f] via-[#0f2d1b] to-[#07180f] px-5 py-3 text-center shadow-[0_8px_30px_rgba(0,0,0,.5),0_0_35px_rgba(0,230,118,.18)]">
                        <div className="flex items-center justify-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-[#00E676] shadow-[0_0_10px_#00E676]" />
                          <p className="text-sm font-black tracking-[.12em] text-[#8dffbd]">
                            💰 CASHOUT SUCCESSFUL
                          </p>
                          <span className="h-2 w-2 rounded-full bg-[#00E676] shadow-[0_0_10px_#00E676]" />
                        </div>
                        <p className="mt-1 text-[9px] font-bold uppercase tracking-[.2em] text-white/60">
                          Winnings secured • Start a new game
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setExplosion(false);
                          setExplosionCell(null);
                          dispatch(resetMinesGame());
                        }}
                        className="group relative w-full overflow-hidden rounded-2xl border border-[#C77AFF] bg-gradient-to-br from-[#B45CFF] via-[#7418F5] to-[#3A00C9] px-6 py-3.5 font-bold text-white shadow-[0_0_8px_#B45CFF,0_0_18px_rgba(139,43,255,0.75),inset_0_2px_4px_rgba(255,255,255,0.45),inset_0_-5px_8px_rgba(30,0,100,0.45)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.97] cursor-pointer"
                      >
                        <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                        <div className="relative flex items-center justify-center gap-3">
                          <span className="text-lg transition-transform duration-500 group-hover:rotate-180">
                            🔄
                          </span>
                          <span className="text-sm font-bold tracking-wide sm:text-base">
                            START NEW GAME
                          </span>
                          <span className="text-lg transition-transform duration-300 group-hover:translate-x-1">
                            →
                          </span>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </section>

              {/* Controls */}
              <div className="mt-4 grid w-full grid-cols-1 gap-3">
                <button
                  type="button"
                  onClick={cashout}
                  disabled={
                    game.status !== "playing" ||
                    Number(game.safeCells || 0) <= 0 ||
                    loading
                  }
                  className="w-full rounded-2xl border border-[#C77AFF] bg-gradient-to-br from-[#B45CFF] via-[#7418F5] to-[#3A00C9] px-4 py-3 text-lg font-black text-white shadow-[0_0_8px_#B45CFF,0_0_18px_rgba(139,43,255,0.75),inset_0_2px_4px_rgba(255,255,255,0.45),inset_0_-5px_8px_rgba(30,0,100,0.45)] transition hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {loading
                    ? "PROCESSING..."
                    : `💰 CASHOUT ${money(currentWin)}`}
                </button>
              </div>

              {game.status !== "playing" && !explosion && (
                <div className="mt-4 rounded-2xl border border-[#2a1b3d] bg-[#1C0F2B] p-5 text-center shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
                  {game.status === "lost" && (
                    <>
                      <div className="text-4xl">💣</div>
                      <div className="mt-1 font-black text-red-400">
                        GAME LOST
                      </div>
                    </>
                  )}

                  {game.status === "won" && (
                    <>
                      <div className="text-4xl">🏆</div>
                      <div className="mt-1 font-black text-[#00E676]">
                        YOU WON!
                      </div>
                      <div className="mt-1 text-2xl font-black text-[#F1C40F]">
                        {money(game.virtualWin)}
                      </div>
                    </>
                  )}

                  {game.status === "cashout" && (
                    <>
                      <div className="text-4xl">💰</div>
                      <div className="mt-1 font-black text-[#00E676]">
                        CASHOUT SUCCESSFUL
                      </div>
                      <div className="mt-1 text-2xl font-black text-[#F1C40F]">
                        {money(game.virtualWin)}
                      </div>
                    </>
                  )}
                </div>
              )}

              {game.status !== "playing" &&
                !explosion &&
                game.status !== "cashout" && (
                  <button
                    type="button"
                    onClick={() => {
                      setExplosion(false);
                      setExplosionCell(null);
                      dispatch(resetMinesGame());
                    }}
                    className="mt-3 w-full rounded-xl border border-[#C77AFF] bg-gradient-to-br from-[#B45CFF] via-[#7418F5] to-[#3A00C9] py-3 font-bold text-white shadow-[0_0_8px_#B45CFF,0_0_18px_rgba(139,43,255,0.75),inset_0_2px_4px_rgba(255,255,255,0.45),inset_0_-5px_8px_rgba(30,0,100,0.45)] transition hover:scale-[1.02] active:scale-[0.98]"
                  >
                    🔄 NEW GAME
                  </button>
                )}

              {message && (
                <p className="mt-4 text-center text-sm font-semibold text-[#9B59B6]">
                  {message}
                </p>
              )}
            </>
          )}

          {/* Start screen */}
          {!game && (
            <section className="overflow-hidden rounded-[24px] border border-[#2a1b3d] bg-[#1C0F2B] shadow-[0_10px_35px_rgba(0,0,0,0.6)]">
              <div className="bg-gradient-to-r from-[#B45CFF] via-[#7418F5] to-[#3A00C9] px-5 py-4 text-center">
                <p className="text-xs font-bold uppercase tracking-[.3em] text-white/90">
                  TREASURE HUNT
                </p>
                <h2 className="mt-1 text-2xl font-black text-white">
                  6 × 6 MINING FIELD
                </h2>
              </div>

              <div className="p-5">
                <div className="mb-5 grid grid-cols-3 gap-2">
                  <div className="rounded-xl border border-[#2a1b3d] bg-[#12061C] p-3 text-center">
                    <div className="text-2xl">💎</div>
                    <p className="mt-1 text-[10px] font-bold text-gray-400">
                      FIND Diamond
                    </p>
                  </div>
                  <div className="rounded-xl border border-[#2a1b3d] bg-[#12061C] p-3 text-center">
                    <div className="text-2xl">⛏️</div>
                    <p className="mt-1 text-[10px] font-bold text-gray-400">
                      MINE TILES
                    </p>
                  </div>
                  <div className="rounded-xl border border-[#2a1b3d] bg-[#12061C] p-3 text-center">
                    <div className="text-2xl">💣</div>
                    <p className="mt-1 text-[10px] font-bold text-gray-400">
                      AVOID MINES
                    </p>
                  </div>
                </div>

                {!isGameCountryAllowed && (
                  <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-center text-xs font-bold text-red-400">
                    Mines Game is available only in India, Australia, Nepal,
                    Pakistan, Bangladesh and UAE (Dubai).
                  </div>
                )}

                <p className="mb-2 text-[10px] font-semibold text-gray-400">
                  Enter amount in your local currency or choose a quick amount
                </p>

                <div className="mb-4 grid grid-cols-4 gap-2">
                  {[10, 50, 100, 500].map((amount) => (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => {
                        setBetAmount(String(amount));
                        setBetAmountInput(formatInputAmount(amount));
                        setAmountError("");
                      }}
                      className={`rounded-xl border py-2.5 text-sm font-black transition ${
                        Number(betAmount) === amount
                          ? "border-[#C77AFF] bg-gradient-to-br from-[#B45CFF] via-[#7418F5] to-[#3A00C9] text-white shadow-[0_0_8px_#B45CFF,0_0_18px_rgba(139,43,255,0.75)]"
                          : "border-[#2a1b3d] bg-[#12061C] text-gray-300 hover:border-[#9B59B6]/50"
                      }`}
                    >
                      {money(amount)}
                    </button>
                  ))}
                </div>

                <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Game Amount
                </label>

                <div className="mb-3 flex items-center overflow-hidden rounded-xl border-2 border-[#9B59B6]/50 bg-[#12061C] shadow-inner">
                  <span className="px-4 text-lg font-black text-[#9B59B6]">
                    {currencySymbol}
                  </span>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    value={betAmountInput}
                    onChange={(e) => {
                      const value = e.target.value;
                      setBetAmountInput(value);

                      if (value === "") {
                        setBetAmount("");
                        setAmountError("");
                        return;
                      }

                      const localAmount = Number(value);

                      if (!Number.isFinite(localAmount)) {
                        setBetAmount("");
                        return;
                      }

                      setBetAmount(String(localAmount));

                      if (localAmount > 0) {
                        setAmountError("");
                      }
                    }}
                    onBlur={() => {
                      if (
                        betAmountInput !== "" &&
                        (!Number.isFinite(Number(betAmountInput)) ||
                          Number(betAmountInput) <= 0)
                      ) {
                        setBetAmount("");
                        setBetAmountInput("");
                      }
                    }}
                    className="min-w-0 flex-1 bg-transparent py-3 pr-3 text-lg font-black text-white outline-none"
                    aria-label={`Game amount in ${currencyConfig.code}`}
                  />
                </div>

                {amountError && (
                  <p className="mb-3 text-center text-xs font-bold text-red-400">
                    {amountError}
                  </p>
                )}

                <button
                  type="button"
                  onClick={startGame}
                  disabled={loading}
                  className="w-full rounded-2xl border border-[#C77AFF] bg-gradient-to-br from-[#B45CFF] via-[#7418F5] to-[#3A00C9] py-4 text-lg font-black text-white shadow-[0_0_8px_#B45CFF,0_0_18px_rgba(139,43,255,0.75),inset_0_2px_4px_rgba(255,255,255,0.45),inset_0_-5px_8px_rgba(30,0,100,0.45)] transition hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                >
                  {loading ? "STARTING..." : "⛏️ START MINING"}
                </button>

                {message && (
                  <p className="mt-4 text-center text-sm font-semibold text-[#9B59B6]">
                    {message}
                  </p>
                )}
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  );
}
