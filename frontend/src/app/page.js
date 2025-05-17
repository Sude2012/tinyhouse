"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { IoIosArrowDown } from "react-icons/io";
import { FiSearch } from "react-icons/fi";
import { FaBed, FaBath, FaStar, FaHeart, FaRegHeart } from "react-icons/fa";

const houses = [
  {
    id: 1,
    location: "İzmir, Türkiye",
    beds: 2,
    baths: 1,
    price: 1200,
    rating: 4.8,
    image: "/Unknown-49.jpg",
  },
  {
    id: 2,
    location: "Antalya, Türkiye",
    beds: 3,
    baths: 2,
    price: 1500,
    rating: 4.7,
    image: "/Unknown-57.jpg",
  },
  {
    id: 3,
    location: "Muğla, Türkiye",
    beds: 1,
    baths: 1,
    price: 1000,
    rating: 4.6,
    image: "/foto2.jpg",
  },
  {
    id: 4,
    location: "Kapadokya, Türkiye",
    beds: 2,
    baths: 1,
    price: 1300,
    rating: 4.9,
    image: "/foto9.jpg",
  },
  {
    id: 5,
    location: "Çanakkale, Türkiye",
    beds: 2,
    baths: 1,
    price: 1100,
    rating: 4.5,
    image: "/Unknown-48.jpg",
  },
  {
    id: 6,
    location: "Bolu, Türkiye",
    beds: 3,
    baths: 2,
    price: 1600,
    rating: 4.9,
    image: "/tinyhouse2.webp",
  },
  {
    id: 7,
    location: "Trabzon, Türkiye",
    beds: 2,
    baths: 1,
    price: 1150,
    rating: 4.4,
    image: "/Unknown-64.jpg",
  },
  {
    id: 8,
    location: "Mersin, Türkiye",
    beds: 1,
    baths: 1,
    price: 950,
    rating: 4.3,
    image: "/foto5.jpg",
  },
  {
    id: 9,
    location: "Eskişehir, Türkiye",
    beds: 2,
    baths: 1,
    price: 980,
    rating: 4.2,
    image: "/ev-resmi.jpeg",
  },
  {
    id: 10,
    location: "Nevşehir, Türkiye",
    beds: 3,
    baths: 2,
    price: 1250,
    rating: 4.6,
    image: "/foto10.jpg",
  },
  {
    id: 11,
    location: "Aydın, Türkiye",
    beds: 2,
    baths: 1,
    price: 1080,
    rating: 4.5,
    image: "/foto6.jpg",
  },
  {
    id: 12,
    location: "Rize, Türkiye",
    beds: 1,
    baths: 1,
    price: 890,
    rating: 4.7,
    image: "/tinyhouse3.jpeg",
  },
];

const HomePage = () => {
  const [showGuestDropdown, setShowGuestDropdown] = useState(false);
  const [adultCount, setAdultCount] = useState(1);
  const [childCount, setChildCount] = useState(0);
  const dropdownRef = useRef(null);

  const [favorites, setFavorites] = useState(houses.map(() => false));

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
        {houses.map((house, index) => (
          <Link
            key={house.id}
            href={`/houses/home${index + 1}`}
            className="block bg-white rounded-lg overflow-hidden shadow-md relative cursor-pointer hover:shadow-xl transition-shadow"
          >
            <img
              src={house.image}
              alt={`Ev ${house.id}`}
              className="w-full h-48 object-cover"
            />
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleFavorite(index);
              }}
              className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-md text-red-500 text-xl"
              aria-label="Favorilere ekle"
            >
              {favorites[index] ? <FaHeart /> : <FaRegHeart />}
            </button>
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-1">{house.location}</h2>
              <div className="flex items-center gap-4 text-sm mb-2">
                <div className="flex items-center gap-1">
                  <FaBed /> {house.beds} Yatak Odası
                </div>
                <div className="flex items-center gap-1">
                  <FaBath /> {house.baths} Banyo
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold">${house.price}/gece</span>
                <span className="flex items-center gap-1 text-yellow-500">
                  <FaStar /> {house.rating}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default HomePage;
