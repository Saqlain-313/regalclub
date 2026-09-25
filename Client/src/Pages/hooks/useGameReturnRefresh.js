// hooks/useGameReturnRefresh.js
import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import {
  checkGamecredit,
  resetGameState,
  setShouldRefreshOnReturn,
} from "../redux/slices/gameSlice";

/* ======================================================
   HELPER — detect game routes
====================================================== */
const isGameRoute = (path) => {
  return (
    path.startsWith("/game/") ||
    path === "/aviator" ||
    path === "/chicken" ||
    path === "/casino" ||
    path === "/slots"
  );
};

/* ======================================================
   HOOK 1 — TRACKER
   Call this ONCE at the top of your app (inside <BrowserRouter>).
   It watches the current path and sets the flag whenever
   the user is on a game route.
====================================================== */
export const useGameRouteTracker = () => {
  const location = useLocation();
  const dispatch = useDispatch();

  useEffect(() => {
    if (isGameRoute(location.pathname)) {
      dispatch(setShouldRefreshOnReturn(true));
    }
  }, [location.pathname, dispatch]);
};

/* ======================================================
   HOOK 2 — CONSUMER
   Call this inside Account.jsx (or wherever you want the
   auto-hit of checkGamecredit). It watches the flag and
   fires the API when the flag is true.
====================================================== */
export const useAutoCheckGameCreditOnReturn = ({
  onSuccess,
  onError,
} = {}) => {
  const dispatch = useDispatch();
  const { shouldRefreshOnReturn } = useSelector((state) => state.game);

  const runCheckCredit = useCallback(async () => {
    try {
      dispatch(resetGameState());
      const result = await dispatch(checkGamecredit()).unwrap();
      onSuccess?.(result);
    } catch (error) {
      onError?.(error);
    }
  }, [dispatch, onSuccess, onError]);

  useEffect(() => {
    if (shouldRefreshOnReturn) {
      dispatch(setShouldRefreshOnReturn(false)); // clear first
      runCheckCredit();                          // then hit
    }
  }, [shouldRefreshOnReturn, dispatch, runCheckCredit]);

  return { runCheckCredit };
};