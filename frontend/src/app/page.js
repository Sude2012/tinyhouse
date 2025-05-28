"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { IoIosArrowDown } from "react-icons/io";
import { FiSearch } from "react-icons/fi";
import { FaBed, FaBath, FaStar } from "react-icons/fa";

const HomePage = () => {
  const [showGuestDropdown, setShowGuestDropdown] = useState(false);
  const [adultCount, setAdultCount] = useState(1);
  const [childCount, setChildCount] = useState(0);
  const dropdownRef = useRef(null);
  const [dbHouses, setDbHouses] = useState([]);
  const router = useRouter();

  const totalGuests = adultCount + childCount;

  useEffect(() => {
    fetch("http://localhost:5254/api/houses")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setDbHouses(data);
        } else {
          setDbHouses([]);
        }
      });
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowGuestDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCardClick = (houseId) => {
    const email = localStorage.getItem("email");
    if (!email) {
      router.push("/login");
    } else {
      router.push(`/houses/${houseId}`);
    }
  };

  return (
    <div
      className="flex flex-col items-center px-4 py-8 min-h-screen"
      style={{ backgroundColor: "#FFF6F6" }}
    >
      <h1 className="text-4xl font-bold mb-6 text-[black]">TİNY HOUSE</h1>

      {/* Arama Alanı */}
      <div
        className="flex flex-wrap gap-4 p-4 rounded-md w-full max-w-4xl justify-center"
        style={{ backgroundColor: "#FFD8DB" }}
      >
        {/* Yer */}
        <div className="flex flex-col items-start w-40">
          <label htmlFor="location" className="text-[black]">
            Yer
          </label>
          <input
            type="text"
            id="location"
            placeholder="Yer"
            className="border px-3 py-2 rounded w-full text-[black]"
            style={{ backgroundColor: "#FFF6F6" }}
          />
        </div>

        {/* Giriş ve Çıkış Tarihi */}
        <div className="flex flex-col items-start w-40">
          <label htmlFor="check-in" className="text-[#260B01]">
            Giriş Tarihi
          </label>
          <input
            type="date"
            id="check-in"
            className="border px-3 py-2 rounded w-full text-[black]"
            style={{ backgroundColor: "#FFF6F6" }}
          />
        </div>
        <div className="flex flex-col items-start w-40">
          <label htmlFor="check-out" className="text-[black]">
            Çıkış Tarihi
          </label>
          <input
            type="date"
            id="check-out"
            className="border px-3 py-2 rounded w-full text-[black]"
            style={{ backgroundColor: "#FFF6F6" }}
          />
        </div>

        {/* Kişi Sayısı */}
        <div
          className="flex flex-col items-start w-40 relative"
          ref={dropdownRef}
        >
          <label className="text-[black]">Kişi Sayısı</label>
          <div
            className="border px-3 py-2 rounded w-full cursor-pointer flex justify-between items-center text-[black]"
            style={{ backgroundColor: "#FFF6F6" }}
            onClick={() => setShowGuestDropdown(!showGuestDropdown)}
          >
            <span>{totalGuests} kişi</span>
            <IoIosArrowDown />
          </div>
          {showGuestDropdown && (
            <div className="absolute z-10 top-full mt-2 left-0 w-full bg-white border rounded shadow-lg p-2 text-[#260B01]">
              {/* Yetişkin */}
              <div className="flex justify-between items-center mb-2">
                <span>Yetişkin</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setAdultCount(Math.max(1, adultCount - 1))}
                    className="px-2 py-1 bg-gray-200 rounded"
                  >
                    -
                  </button>
                  <span>{adultCount}</span>
                  <button
                    onClick={() => setAdultCount(adultCount + 1)}
                    className="px-2 py-1 bg-gray-200 rounded"
                  >
                    +
                  </button>
                </div>
              </div>
              {/* Çocuk */}
              <div className="flex justify-between items-center">
                <span>Çocuk</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setChildCount(Math.max(0, childCount - 1))}
                    className="px-2 py-1 bg-gray-200 rounded"
                  >
                    -
                  </button>
                  <span>{childCount}</span>
                  <button
                    onClick={() => setChildCount(childCount + 1)}
                    className="px-2 py-1 bg-gray-200 rounded"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Ara */}
        <button className="bg-[#C99297] text-white px-3 py-1 rounded hover:bg-[#906668] flex items-center gap-2">
          <FiSearch
            className="text-[#260B01] bg-white rounded-full p-1"
            size={20}
          />
          Ara
        </button>
      </div>

      {/* Ev Kartları */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10 w-full max-w-6xl text-[#260B01]">
        {dbHouses.map((house) => (
          <div
            key={house.id}
            onClick={() => handleCardClick(house.id)}
            className="block bg-white rounded-lg overflow-hidden shadow-md relative cursor-pointer hover:shadow-xl transition-shadow"
          >
            <img
              src={`http://localhost:5254${house.coverImageUrl}`}
              alt={`Ev ${house.id}`}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-1">
                {house.city}, {house.country}
              </h2>
              <div className="flex items-center gap-4 text-sm mb-2">
                <div className="flex items-center gap-1">
                  <FaBed /> {house.bedroomCount} Yatak Odası
                </div>
                <div className="flex items-center gap-1">
                  <FaBath /> {house.bathroomCount} Banyo
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold">₺{house.pricePerNight}/gece</span>
                <span className="flex items-center gap-1 text-yellow-500">
                  <FaStar /> {house.rating}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomePage;
