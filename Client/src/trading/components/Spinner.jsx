import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
const Spinner = ({ path = "" }) => {
    const [count, setCount] = useState(3);
    const navigate = useNavigate();
    const location = useLocation();
    const { userInfo } = useSelector((state) => state.auth);
    
    useEffect(() => {
        const interval = setInterval(() => {
            setCount((prevValue) => --prevValue);
        }, 500);
        if(userInfo){
            navigate({
                state: location.pathname,
            });
        }
        count === 0 &&
            navigate(`/${path}`, {
                state: location.pathname,
            });
        return () => clearInterval(interval);
    }, [count, navigate, location, path]);
    return (
        <>
        {count !== 0 ?
          /* From Uiverse.io by clarencedion */ 
<div className="flex items-center justify-center fixed h-full w-full bg-[#00000032]">
<div class="flex-col gap-4 w-full flex items-center justify-center h-full">
  <div
    class="w-28 h-28 border-4 border-transparent text-green-400 text-4xl animate-spin flex items-center justify-center border-t-green-500 rounded-full"
  >
    <div
      class="w-24 h-24 border-4 border-transparent text-red-500 text-2xl animate-spin flex items-center justify-center border-t-red-500 rounded-full"
    ></div>
  </div>
</div>
</div>

        : ""}
        </>
    );
};

export default Spinner;