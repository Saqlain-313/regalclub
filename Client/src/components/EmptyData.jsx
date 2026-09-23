import React from "react";
import EmptyImg from "../assets/empty.png";
const EmptyData = () => {
  return (
    <>
      <img
        src={EmptyImg}
        alt=""
        className="w-64 flex items-center justify-center m-auto"
      />
      <p className="fs-sm text-whites text-center">No more</p>
    </>
  );
};

export default EmptyData;
