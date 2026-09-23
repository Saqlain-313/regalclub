import { useDispatch, useSelector } from "react-redux";
import { MdRefresh } from "react-icons/md";
import { FaSpinner } from "react-icons/fa";
import { checkGamecredit } from "../reducer/gameSlice";
import { useEffect, useState } from "react";
import creditPopup from "./creditPopup";

const GamecreditCheckButton = () => {
  const dispatch = useDispatch();

  const {
    iscreditLoading,
    creditMessage,
    creditStatus,
  } = useSelector((state) => state.game);

  const [showPopup, setShowPopup] = useState(false);

  const handleCheckcredit = () => {
    dispatch(checkGamecredit());
  };

  useEffect(() => {
    if (creditMessage) {
      setShowPopup(true);
    }
  }, [creditMessage]);

  return (
    <>
      <button
        onClick={handleCheckcredit}
        disabled={iscreditLoading}
        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg 
                   flex items-center gap-2 disabled:opacity-60"
      >
        {iscreditLoading ? (
          <>
            <FaSpinner className="animate-spin" />
            Checking...
          </>
        ) : (
          <>
            <MdRefresh />
            Check credit
          </>
        )}
      </button>

      {showPopup && (
        <creditPopup
          message={creditMessage}
          status={creditStatus}
          onClose={() => setShowPopup(false)}
        />
      )}
    </>
  );
};

export default GamecreditCheckButton;
