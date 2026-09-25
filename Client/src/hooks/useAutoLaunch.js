import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { launchGame } from "../redux/slices/gameSlice";

/**
 * Auto-launch game if Home page ne bheja hai with state.autoLaunch = true
 */
const useAutoLaunch = ({ setSelectedGame, gameList = [] }) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const hasLaunched = useRef(false);

  useEffect(() => {
    // ✅ Sirf tab chale jab state.autoLaunch true ho aur pehle launch na hua ho
    if (
      location.state?.autoLaunch &&
      location.state?.gameUid &&
      !hasLaunched.current
    ) {
      hasLaunched.current = true;

      // ✅ Agar gameList di gayi hai to usme se game dhoondein
      const foundGame = gameList.find(
        (g) => g.game_uid === location.state.gameUid,
      );

      const gameToLaunch =
        foundGame || { game_uid: location.state.gameUid, game_name: "Game" };

      setSelectedGame(gameToLaunch);

      dispatch(launchGame({ gameId: gameToLaunch.game_uid }));
    }
  }, [location.state, dispatch, gameList, setSelectedGame]);
};

export default useAutoLaunch;