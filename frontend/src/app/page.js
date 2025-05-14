"use client";
import { useState, useEffect, useRef } from "react";
import { IoIosArrowDown } from "react-icons/io";
import { FiSearch } from "react-icons/fi";
import { FaBed, FaBath, FaStar, FaHeart, FaRegHeart } from "react-icons/fa";

const HomePage = () => {
  const [showGuestDropdown, setShowGuestDropdown] = useState(false);
  const [adultCount, setAdultCount] = useState(1);
  const [childCount, setChildCount] = useState(0);
  const dropdownRef = useRef(null);

  // Favori kalplerin durumlarını tutan state
  const [favorites, setFavorites] = useState([false, false, false]);

  const toggleFavorite = (index) => {
    const updatedFavorites = [...favorites];
    updatedFavorites[index] = !updatedFavorites[index];
    setFavorites(updatedFavorites);
  };

  const totalGuests = adultCount + childCount;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowGuestDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      className="flex flex-col items-center px-4 py-8 min-h-screen"
      style={{ backgroundColor: "#E6DCDC" }}
    >
      <h1 className="text-4xl font-bold mb-6 text-[#260B01]">TİNY HOUSE</h1>

      {/* Arama Alanı */}
      <div
        className="flex flex-wrap gap-4 p-4 rounded-md w-full max-w-4xl justify-center"
        style={{ backgroundColor: "#B39F8B" }}
      >
        {/* Yer */}
        <div className="flex flex-col items-start w-40">
          <label htmlFor="location" className="text-[#260B01]">
            Yer
          </label>
          <input
            type="text"
            id="location"
            placeholder="Yer"
            className="border px-3 py-2 rounded w-full text-[#260B01]"
            style={{ backgroundColor: "#B39F8B" }}
          />
        </div>

        {/* Giriş Tarihi */}
        <div className="flex flex-col items-start w-40">
          <label htmlFor="check-in" className="text-[#260B01]">
            Giriş Tarihi
          </label>
          <input
            type="date"
            id="check-in"
            className="border px-3 py-2 rounded w-full text-[#260B01]"
            style={{ backgroundColor: "#B39F8B" }}
          />
        </div>

        {/* Çıkış Tarihi */}
        <div className="flex flex-col items-start w-40">
          <label htmlFor="check-out" className="text-[#260B01]">
            Çıkış Tarihi
          </label>
          <input
            type="date"
            id="check-out"
            className="border px-3 py-2 rounded w-full text-[#260B01]"
            style={{ backgroundColor: "#B39F8B" }}
          />
        </div>

        {/* Kişi Sayısı */}
        <div
          className="flex flex-col items-start w-40 relative"
          ref={dropdownRef}
        >
          <label className="text-[#260B01]">Kişi Sayısı</label>
          <div
            className="border px-3 py-2 rounded w-full cursor-pointer flex justify-between items-center text-[#260B01]"
            style={{ backgroundColor: "#B39F8B" }}
            onClick={() => setShowGuestDropdown(!showGuestDropdown)}
          >
            <span>{totalGuests} kişi</span>
            <IoIosArrowDown />
          </div>

          {showGuestDropdown && (
            <div className="absolute z-10 top-full mt-2 left-0 w-full bg-white border rounded shadow-lg p-2 text-[#260B01]">
              <div className="flex justify-between items-center mb-2">
                <span>Yetişkin</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setAdultCount(Math.max(1, adultCount - 1))}
                    className="px-2 py-1 bg-gray-200 rounded text-[#260B01]"
                  >
                    -
                  </button>
                  <span>{adultCount}</span>
                  <button
                    onClick={() => setAdultCount(adultCount + 1)}
                    className="px-2 py-1 bg-gray-200 rounded text-[#260B01]"
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span>Çocuk</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setChildCount(Math.max(0, childCount - 1))}
                    className="px-2 py-1 bg-gray-200 rounded text-[#260B01]"
                  >
                    -
                  </button>
                  <span>{childCount}</span>
                  <button
                    onClick={() => setChildCount(childCount + 1)}
                    className="px-2 py-1 bg-gray-200 rounded text-[#260B01]"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Ara Butonu */}
        <button className="bg-[#260B01] text-white px-3 py-1 rounded hover:bg-[#3d1703] flex items-center gap-2">
          <FiSearch
            className="text-[#260B01] bg-white rounded-full p-1"
            size={20}
          />
          Ara
        </button>
      </div>

      {/* Ev Kartları */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10 w-full max-w-6xl text-[#260B01]">
        {[1, 2, 3].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-lg shadow-md overflow-hidden relative"
          >
            <img
              src="https://via.placeholder.com/400x250"
              alt={`Ev ${i + 1}`}
              className="w-full h-48 object-cover"
            />
            <div
              className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-md cursor-pointer"
              onClick={() => toggleFavorite(i)}
            >
              {favorites[i] ? (
                <FaHeart className="text-red-500 text-xl" />
              ) : (
                <FaRegHeart className="text-red-500 text-xl" />
              )}
            </div>
            <div className="p-4 text-[#260B01]">
              <h3 className="font-semibold text-lg mb-1">İzmir, Türkiye</h3>
              <p>
                <FaBed className="inline mr-1" />
                <span className="mr-4">2 Yatak</span>
                <FaBath className="inline mr-1" />
                <span>1 Banyo</span>
              </p>
              <p className="mt-2 font-bold">₺1.200 / gece</p>
              <p>
                <FaStar className="inline text-yellow-500 mr-1" /> 4.8
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Rezervasyonlar */}
      {/*<Reservations />*/}
    </div>
  );
};

export default HomePage;
