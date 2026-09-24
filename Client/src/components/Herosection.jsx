import { Gamepad2, ShieldCheck, Users, WalletCards } from "lucide-react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { getBanners } from "../redux/slices/bannerSlice";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const fallbackBanners = [
  {
    _id: "1",
    image:
      "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?auto=format&fit=crop&w=1200&q=85",
  },
  {
    _id: "2",
    image:
      "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=85",
  },
  {
    _id: "3",
    image:
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=85",
  },
];

export default function HeroSection() {
  const dispatch = useDispatch();

  const { banners, loading } = useSelector((state) => state.banner);

  useEffect(() => {
    dispatch(getBanners());
  }, [dispatch]);

  const displayBanners = banners?.length > 0 ? banners : fallbackBanners;

  const stats = [
    {
      value: "25,000+",
      label: "Players",
      icon: Users,
    },
    {
      value: "₹15Cr+",
      label: "Total Paid",
      icon: WalletCards,
    },
    {
      value: "100+",
      label: "Games",
      icon: Gamepad2,
    },
    {
      value: "99.9%",
      label: "Uptime",
      icon: ShieldCheck,
    },
  ];

  if (loading) {
    return (
      <section className="w-full dark-bg px-2 py-2 sm:px-3">
        <div className="h-[185px] sm:h-[240px] md:h-[300px] rounded-xl dark-bg animate-pulse" />
      </section>
    );
  }

  return (
    <section className="w-full bg-[#1C0F2B] px-2 py-2 sm:px-3 md:px-4">
      {/* ================= HERO BANNER ================= */}
      <div className="relative w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          navigation={{
            prevEl: ".hero-prev",
            nextEl: ".hero-next",
          }}
          pagination={{
            clickable: true,
          }}
          autoplay={{
            delay: 4000,
            disableOnInteraction: false,
          }}
          loop={displayBanners.length > 1}
          className="heroSwiper"
        >
          {displayBanners.map((banner, index) => (
            <SwiperSlide key={banner._id || index}>
              {/* Banner */}
              <div
                className="
                  relative
                  w-full
                  h-[185px]
                  sm:h-[200px]
                  md:h-[300px]
                  lg:h-[340px]
                  bg-white
                "
              >
                <img
                  src={banner.image}
                  alt={`Banner ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* LEFT ARROW */}
        {/* <button
          type="button"
          className="
            hero-prev
            absolute
            left-0
            sm:left-2
            top-1/2
            -translate-y-1/2
            z-20

            w-8 h-8
            sm:w-9 sm:h-9

            rounded-full
            border border-gray-200
            bg-white

            flex
            items-center
            justify-center

            text-gray-700

            shadow-sm
            hover:bg-gray-50
            active:scale-95
            transition
          "
        >
          <ChevronLeft size={18} />
        </button> */}

        {/* RIGHT ARROW */}
        {/* <button
          type="button"
          className="
            hero-next
            absolute
            right-0
            sm:right-2
            top-1/2
            -translate-y-1/2
            z-20

            w-8 h-8
            sm:w-9 sm:h-9

            rounded-full
            border border-gray-200
            bg-white

            flex
            items-center
            justify-center

            text-gray-700

            shadow-sm
            hover:bg-gray-50
            active:scale-95
            transition
          "
        >
          <ChevronRight size={18} />
        </button> */}
      </div>

      {/* ================= SWIPER STYLE ================= */}
      <style>{`

        .heroSwiper {
          width: 100%;
          height: 100%;
        }

        .heroSwiper .swiper-slide {
          background: #ffffff;
        }

        /* Pagination */

        .heroSwiper .swiper-pagination {
          bottom: 7px !important;
        }

        .heroSwiper .swiper-pagination-bullet {
          width: 6px !important;
          height: 6px !important;

          margin: 0 3px !important;

          background: #d1d5db !important;

          opacity: 1 !important;

          transition: all 0.25s ease;
        }

        .heroSwiper .swiper-pagination-bullet-active {
          width: 8px !important;
          height: 8px !important;

          background: #facc15 !important;
        }

        /* Disable default swiper arrows */

        .heroSwiper .swiper-button-next,
        .heroSwiper .swiper-button-prev {
          display: none !important;
        }

        @media (min-width: 640px) {

          .heroSwiper .swiper-pagination {
            bottom: 10px !important;
          }

          .heroSwiper .swiper-pagination-bullet {
            width: 7px !important;
            height: 7px !important;
          }

          .heroSwiper .swiper-pagination-bullet-active {
            width: 9px !important;
            height: 9px !important;
          }

        }

      `}</style>
    </section>
  );
}
