import React from "react";

import loader from "../assets/loader-out.png";
import { useSelector } from "react-redux";
const Loader = () => {
  const { user, loading, error, profileLoaded } = useSelector(
    (state) => state.auth,
  );
  return (
    <>
      <div className="loader z-50" role="status">
        <div className="outer-layer rounded-full">
          {" "}
          <img src={loader} alt="" className="h-full w-full imgs" />
        </div>

        <img src={user?.gameall?.logo1} alt="" className="imgs2"/>
      </div>
    </>
  );
};

export default Loader;
