import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  checkGamecredit,
  fetchLiveGameBalance,
} from "../redux/slices/gameSlice";
import { getProfile } from "../redux/slices/authSlice";

/* ======================================================
   GAME AUTO SYNC — global wallet recovery

   Problem: returning via the game iframe's own back button
   triggers GamePlayModal.handleClose() which syncs the wallet,
   BUT if the user:
   - presses the PHONE's BROWSER back button (bypasses the modal)
   - switches apps and returns (tab background/foreground)
   - closes the browser and reopens the site
   ...the modal close code never runs and the money stays
   stuck in the API wallet.

   Fix: this component mounts ONCE in App and listens to:
   - visibilitychange (tab visible again)
   - pageshow (bfcache restore — common mobile back path)
   - window focus
   - popstate (SPA history back)
   - initial mount (page reload / site reopen)

   On each event: if a game was launched recently
   (localStorage marker), run checkGamecredit + getProfile —
   pulling the API wallet balance back into the main wallet.
   Double-credit is already prevented by the backend's atomic
   lock (users.transferring), and the MIN_GAP debounce keeps
   the number of calls low.
===================================================== */

const MARKER_KEY = "rg_last_game_session";

// Marker kitni der tak valid — uske baad auto-sync band
const MARKER_TTL = 2 * 60 * 60 * 1000; // 2 hours

// Do sync attempts ke beech minimum gap (debounce)
const MIN_GAP = 8 * 1000; // 8 seconds

const getLastGameSession = () =>
  Number(localStorage.getItem(MARKER_KEY) || 0);

export const clearLastGameSession = () => {
  try {
    localStorage.removeItem(MARKER_KEY);
  } catch {
    /* storage unavailable */
  }
};

const GameAutoSync = () => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(
    (state) => state.auth.isAuthenticated,
  );
  const gameUrl = useSelector((state) => state.game.gameUrl);

  const lastAttemptRef = useRef(0);
  const inFlightRef = useRef(false);

  // gameUrl ka fresh value event handlers me chahiye — ref sync
  const gameUrlRef = useRef(gameUrl);
  gameUrlRef.current = gameUrl;

  useEffect(() => {
    if (!isAuthenticated) return undefined;

    const maybeSync = async () => {
      if (inFlightRef.current) return;

      // Game modal is still open = the user is currently playing.
      // Pulling the balance mid-session would break the game — skip.
      if (gameUrlRef.current) return;

      const lastSession = getLastGameSession();
      if (!lastSession) return;

      // Marker expired — no longer needed
      if (Date.now() - lastSession > MARKER_TTL) {
        clearLastGameSession();
        return;
      }

      // Debounce — avoid spamming on back-to-back events
      if (Date.now() - lastAttemptRef.current < MIN_GAP) return;

      lastAttemptRef.current = Date.now();
      inFlightRef.current = true;

      try {
        await dispatch(checkGamecredit()).unwrap();
        await dispatch(getProfile()).unwrap();
      } catch {
        // Silent — network failure / 401 etc. The next event
        // retries; the money is safe on the provider side.
      } finally {
        inFlightRef.current = false;
      }
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") maybeSync();
    };

    const onPageShow = () => maybeSync();
    const onFocus = () => maybeSync();
    const onPopState = () => maybeSync();

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("pageshow", onPageShow);
    window.addEventListener("focus", onFocus);
    window.addEventListener("popstate", onPopState);

    // Initial mount — if the user closed the browser and
    // reopened the site, sync the pending game balance
    maybeSync();

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("pageshow", onPageShow);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("popstate", onPopState);
    };
  }, [isAuthenticated, dispatch]);

  /* ======================================================
     IN-GAME LIVE WALLET POLLING
     While an API game is active (gameUrl set), poll the
     provider balance every 5s so the navbar credit
     reflects bets/wins instantly via liveGameBalance.
  ====================================================== */
  useEffect(() => {
    if (!isAuthenticated || !gameUrl) return undefined;

    const poll = () => {
      if (document.visibilityState === "visible") {
        dispatch(fetchLiveGameBalance());
      }
    };

    poll();
    const interval = setInterval(poll, 5000);

    return () => clearInterval(interval);
  }, [isAuthenticated, gameUrl, dispatch]);

  return null;
};

export default GameAutoSync;
