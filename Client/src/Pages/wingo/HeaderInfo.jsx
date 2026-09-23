import React, { useState } from "react";
import { BsFire } from "react-icons/bs";
import RefereshImg from "../../assets/refresh.png";
import Wallet from "../../assets/wallet.png";
import { Link, useNavigate } from "react-router-dom";

import Slider from "react-slick";
import { RiVolumeUpFill } from "react-icons/ri";
import { useSelector } from "react-redux";
import { IoIosArrowBack } from "react-icons/io";
import { MdSupportAgent } from "react-icons/md";
import VoiceImg from "../../assets/voice.png";
import VoiceOffImg from "../../assets/voice-off.png";

const HeaderInfo = ({ money, handleRefersh,handleVoice,activeVoice }) => {
  const { bannergetData } = useSelector((state) => state.user);

  const navigate = useNavigate();
  const notices = {
    infinite: true,
    slidesToShow: 1,
    slidesToScroll: 1,
    vertical: true,
    autoplay: true,
    autoplaySpeed: 5000, // Time between scrolls (adjust as needed)
    verticalSwiping: true,
    arrows: false, // No arrows
    cssEase: "cubic-bezier(0.25, 0.46, 0.45, 0.94)", // Smoother easing curve
    speed: 2000, // Transition duration (milliseconds)
  };

  return (
    <>
 <div className="nav-bg   sticky top-0 z-20 py-1">
        <div className="container-section flex  items-center relative">
          <button className="absolute">
            <Link to={"/"}>
              {" "}
              <IoIosArrowBack className="text-xl text-whites" />
            </Link>
          </button>
          <div className="text-center flex justify-center items-center m-auto">
            <img src={bannergetData?.gameall?.logo1} alt="" className="w-28" />
          </div>
          <p className="absolute right-1 flex items-center">
            <Link to={"/main/CustomerService"} className=" gray-50 ">
              <MdSupportAgent className="text-whites text-2xl" />
            </Link>
            <Link>
              <img
                src={activeVoice ? VoiceImg : VoiceOffImg}
                alt=""
                className="ms-1 w-7 h-7"
                onClick={handleVoice}
              />
            </Link>
          </p>
        </div>
      </div>


      <div className="nav-bg pb-24 rounded-b-[60px]">
        <div className="container-section pt-5">
          <div className="wallet-bg-section pb-4 rounded-2xl  flex flex-col justify-center items-center w-full">
            <div className="flex items-center ms-2 mt-4 mb-1">
              <h3 className="heaing-h3 text-lg font-bold text-whites">
                ₹{money
                  ? Number(money).toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })
                  : "0.00"}
              </h3>
              <img
                src={RefereshImg}
                alt=""
                className="w-4 ms-3 mb-[0px] brightness-50"
                onClick={handleRefersh}
              />
            </div>
            <div className="flex items-center">
              <img src={Wallet} alt="" className="w-4 mr-2 mb-[2px]" />
              <p className="fs-sm text-whites">Wallet credit</p>
            </div>
            <div className="flex w-full justify-around items-center mt-3">
              <button
                className="text-base flex justify-center items-center px-6 py-1 border-none font-bold red-linear rounded-full"
                onClick={() => navigate("/wallet/Withdraw")}
              >
                Withdraw
              </button>

              <button
                className=" text-base flex justify-center items-center px-6 py-1 border-none font-bold bgs-green rounded-full "
                onClick={() => navigate("/wallet/Recharge")}
              >
                Deposit
              </button>
            </div>
          </div>

          {/* notice board */}
          <div className="banner-notice bg-popup-nav mt-3  rounded-full flex items-center justify-between">
            <RiVolumeUpFill className="text-xl color-l absolute" />

            <div className="slider-container h-10 ms-6 mr-3 overflow-hidden">
              <Slider {...notices} className="text-whites">
                <div>
                  <h3 className="text-xs">
                    Welcome to the {bannergetData?.gameall?.name}! Greetings,
                    Gamers and Enthusiasts! The {bannergetData?.gameall?.name}{" "}
                    is more than just a platform for gaming. We invite you to
                    join us, you'll find a variety of games, promo, bonus,
                    luxury gold awards, Register now and win.
                  </h3>
                </div>
                <div>
                  <h3 className="text-xs">
                    If your deposit not receive, please send it directly to{" "}
                    {bannergetData?.gameall?.name} Self-service Center{" "}
                    {bannergetData?.gameall?.name} wait till already get
                    process, do not send to another person and trust anyone
                    claiming to represent {bannergetData?.gameall?.name}. Always
                    verify our website authenticity through the official
                    community channels. Your safety and trust is our prority.
                  </h3>
                </div>
                <div>
                  <h3 className="text-xs">
                    Please be sure to always use our official website for
                    playing the games with the following link,{" "}
                    {bannergetData?.gameall?.name}. Please always check our
                    official link to access our website and avoid scammers and
                    phishing links
                  </h3>
                </div>
              </Slider>
            </div>

            <span className="float-end text-xl  relative mr-2">
              <Link to={"/main/Notification"} className="flex items-center blue-linear p-1 rounded-full px-3 py-2">
                <BsFire className=" mr-1 fs-sm text-black" />{" "}
                <span className=" font-medium fs-sm">Details</span>
              </Link >

              {/* <div className="ponter-event"></div> */}
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

export default HeaderInfo;
