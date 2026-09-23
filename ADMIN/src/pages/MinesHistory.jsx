import { useEffect, useState } from "react";
import { socket } from "../services/socket";

const API = "http://localhost:8097/api/mines/admin/history";

export default function MinesHistory() {
  const [games, setGames] = useState([]);

  const loadHistory = async () => {
    const token = localStorage.getItem("token");

    const res = await fetch(API, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    if (data.success) {
      setGames(data.games);
    }
  };

  useEffect(() => {
    loadHistory();

    socket.emit("join-admin");

    const refresh = () => {
      loadHistory();
    };

    socket.on("mines-game-created", refresh);
    socket.on("mines-game-finished", refresh);

    return () => {
      socket.off("mines-game-created", refresh);
      socket.off("mines-game-finished", refresh);
    };
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Mines Game History</h1>

      <div className="overflow-x-auto">
        <table className="w-full border">
          <thead>
            <tr className="border-b">
              <th className="p-3 text-left">User</th>
              <th className="p-3">Mines</th>
              <th className="p-3">Safe</th>
              <th className="p-3">Multiplier</th>
              <th className="p-3">Stake</th>
              <th className="p-3">Win</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>

          <tbody>
            {games.map((game) => (
              <tr key={game._id} className="border-b">
                <td className="p-3">
                  {game.user?.username ||
                    game.user?.name ||
                    game.user?.email ||
                    "-"}
                </td>

                <td className="p-3 text-center">{game.minesCount}</td>

                <td className="p-3 text-center">{game.safeCells}</td>

                <td className="p-3 text-center">{game.multiplier}x</td>

                <td className="p-3 text-center">{game.virtualStake}</td>

                <td className="p-3 text-center">{game.virtualWin}</td>

                <td className="p-3 text-center">{game.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
