// pages/GameHistory.jsx
//
// /game-history — same design and features as /deposit-history:
// type tabs (game names), Win/Lose status filter, date filter,
// cards with a colored tag + status and detail rows.

import { Gamepad2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getGameHistory } from "../redux/slices/gameSlice";
import HistoryShell, {
  DetailRow,
  formatDateTime,
  formatINR,
  statusText,
} from "../components/HistoryShell";

// Defensive field mapping for provider history rows
const pick = (item, keys) => {
  for (const key of keys) {
    if (item?.[key] !== undefined && item?.[key] !== null && item?.[key] !== "")
      return item[key];
  }
  return null;
};

const STATUS_OPTIONS = [
  { id: "all", label: "All" },
  { id: "win", label: "Won" },
  { id: "lose", label: "Lost" },
];

const GameHistory = () => {
  const dispatch = useDispatch();
  const { gameHistory, loading, error } = useSelector((state) => state.game);
  const [page, setPage] = useState(1);

  const [typeTab, setTypeTab] = useState("all");
  const [statusTab, setStatusTab] = useState("all");
  const [dateTab, setDateTab] = useState("all");

  const rows = Array.isArray(gameHistory) ? gameHistory : [];

  useEffect(() => {
    dispatch(getGameHistory({ page, limit: 20 }));
  }, [dispatch, page]);

  const normalized = useMemo(
    () =>
      rows.map((item, index) => {
        const gameName =
          pick(item, [
            "game_name",
            "gameName",
            "game_title",
            "name",
            "game",
          ]) || "Casino Game";
        const provider = pick(item, ["provider", "provider_name"]);
        const betAmount = Number(
          pick(item, [
            "bet_amount",
            "betAmount",
            "bet",
            "stake",
            "turnover",
            "amount",
          ]) || 0,
        );
        const winAmount = Number(
          pick(item, [
            "win_amount",
            "winAmount",
            "win",
            "payout",
            "prize",
          ]) || 0,
        );
        const time = pick(item, [
          "created_at",
          "createdAt",
          "date",
          "bet_time",
          "timestamp",
        ]);
        return {
          key: pick(item, ["_id", "id", "tx_id", "bet_id"]) || index,
          gameName,
          provider,
          betAmount,
          winAmount,
          net: winAmount - betAmount,
          isWin: winAmount > betAmount,
          time,
          betId: pick(item, ["tx_id", "bet_id", "_id", "id"]) || "",
        };
      }),
    [rows],
  );

  // Type tabs — All + each game the user played
  const tabs = useMemo(() => {
    const names = [];
    normalized.forEach((r) => {
      if (!names.includes(r.gameName)) names.push(r.gameName);
    });
    return [
      { id: "all", label: "All" },
      ...names.map((n) => ({ id: n, label: n })),
    ];
  }, [normalized]);

  const filtered = useMemo(() => {
    let list = normalized;

    if (typeTab !== "all") {
      list = list.filter((r) => r.gameName === typeTab);
    }

    if (statusTab !== "all") {
      list = list.filter((r) =>
        statusTab === "win" ? r.isWin : !r.isWin,
      );
    }

    if (dateTab !== "all") {
      const now = new Date();
      let startDate = null;
      if (dateTab === "today") {
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      } else if (dateTab === "7days") {
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      } else if (dateTab === "30days") {
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }
      if (startDate) {
        list = list.filter((r) => new Date(r.time) >= startDate);
      }
    }

    return list;
  }, [normalized, typeTab, statusTab, dateTab]);

  return (
    <HistoryShell
      title="Game history"
      tabs={tabs}
      activeTab={typeTab}
      onTab={(id) => setTypeTab(id)}
      statusOptions={STATUS_OPTIONS}
      status={statusTab}
      onStatus={setStatusTab}
      date={dateTab}
      onDate={setDateTab}
      loading={loading && rows.length === 0}
      error={rows.length === 0 ? error : null}
      emptyTitle="No games played yet"
      emptyText="Play games from the home page and your bets will appear here."
      emptyIcon={
        <Gamepad2 className="mx-auto mb-2 h-8 w-8 text-[#B45CFF]/70" />
      }
    >
      {filtered.length > 0 && (
        <div className="space-y-3">
          {filtered.map((r) => {
            const status = statusText(r.isWin ? "won" : "lost");

            return (
              <div
                key={r.key}
                className="rounded-2xl border border-[#2a1b3d] bg-[#1C0F2B] p-3.5 transition-all hover:border-[#9B59B6]/50"
              >
                {/* top row — tag + status */}
                <div className="mb-2.5 flex items-center justify-between gap-2">
                  <span className="rounded-md bg-gradient-to-r from-[#B45CFF] to-[#7418F5] px-2.5 py-1 text-[10px] font-bold text-white">
                    Bet
                  </span>
                  <span className={`text-[11px] font-bold ${status.cls}`}>
                    {status.label}
                  </span>
                </div>

                {/* detail rows */}
                <div className="space-y-1 text-[11px]">
                  <DetailRow
                    label="Game"
                    value={
                      r.provider ? `${r.gameName} • ${r.provider}` : r.gameName
                    }
                  />
                  <DetailRow
                    label="Bet amount"
                    value={formatINR(r.betAmount)}
                  />
                  <DetailRow
                    label="Win amount"
                    value={formatINR(r.winAmount)}
                  />
                  <DetailRow
                    label="Net"
                    value={formatINR(r.net)}
                  />
                  <DetailRow label="Time" value={formatDateTime(r.time)} />
                  {r.betId && (
                    <DetailRow label="Bet ID" value={String(r.betId)} mono copyable />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination — provider API is page-based */}
      {rows.length > 0 && (
        <div className="mt-5 flex items-center justify-between">
          <button
            type="button"
            disabled={page <= 1 || loading}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded-xl border border-[#2a1b3d] bg-[#1C0F2B] px-5 py-2.5 text-xs font-bold text-gray-300 transition-colors hover:border-[#B45CFF]/50 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-[11px] font-bold uppercase tracking-widest text-gray-500">
            Page {page}
          </span>
          <button
            type="button"
            disabled={loading || rows.length < 20}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-xl border border-[#2a1b3d] bg-[#1C0F2B] px-5 py-2.5 text-xs font-bold text-gray-300 transition-colors hover:border-[#B45CFF]/50 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </HistoryShell>
  );
};

export default GameHistory;
