"use client";
import { useState, useEffect, useRef } from "react";
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
    image: "https://via.placeholder.com/400x250",
  },
  {
    id: 2,
    location: "Antalya, Türkiye",
    beds: 3,
    baths: 2,
    price: 1500,
    rating: 4.7,
    image: "https://via.placeholder.com/400x250",
  },
  {
    id: 3,
    location: "Muğla, Türkiye",
    beds: 1,
    baths: 1,
    price: 1000,
    rating: 4.6,
    image: "https://via.placeholder.com/400x250",
  },
  {
    id: 4,
    location: "Kapadokya, Türkiye",
    beds: 2,
    baths: 1,
    price: 1300,
    rating: 4.9,
    image: "https://via.placeholder.com/400x250",
  },
  {
    id: 5,
    location: "Çanakkale, Türkiye",
    beds: 2,
    baths: 1,
    price: 1100,
    rating: 4.5,
    image: "https://via.placeholder.com/400x250",
  },
  {
    id: 6,
    location: "Bolu, Türkiye",
    beds: 3,
    baths: 2,
    price: 1600,
    rating: 4.9,
    image: "https://via.placeholder.com/400x250",
  },
  {
    id: 7,
    location: "Trabzon, Türkiye",
    beds: 2,
    baths: 1,
    price: 1150,
    rating: 4.4,
    image: "https://via.placeholder.com/400x250",
  },
  {
    id: 8,
    location: "Mersin, Türkiye",
    beds: 1,
    baths: 1,
    price: 950,
    rating: 4.3,
    image: "https://via.placeholder.com/400x250",
  },
  {
    id: 9,
    location: "Eskişehir, Türkiye",
    beds: 2,
    baths: 1,
    price: 980,
    rating: 4.2,
    image: "https://via.placeholder.com/400x250",
  },
  {
    id: 10,
    location: "Nevşehir, Türkiye",
    beds: 3,
    baths: 2,
    price: 1250,
    rating: 4.6,
    image: "https://via.placeholder.com/400x250",
  },
  {
    id: 11,
    location: "Aydın, Türkiye",
    beds: 2,
    baths: 1,
    price: 1080,
    rating: 4.5,
    image: "https://via.placeholder.com/400x250",
  },
  {
    id: 12,
    location: "Rize, Türkiye",
    beds: 1,
    baths: 1,
    price: 890,
    rating: 4.7,
    image: "https://via.placeholder.com/400x250",
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
        {houses.map((house, i) => (
          <div
            key={house.id}
            className="bg-white rounded-lg shadow-md overflow-hidden relative"
          >
            <img
              src={house.image}
              alt={`Ev ${house.id}`}
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
              <h3 className="font-semibold text-lg mb-1">{house.location}</h3>
              <p>
                <FaBed className="inline mr-1" />
                <span className="mr-4">{house.beds} Yatak</span>
                <FaBath className="inline mr-1" />
                <span>{house.baths} Banyo</span>
              </p>
              <p className="mt-2 font-bold">₺{house.price} / gece</p>
              <p>
                <FaStar className="inline text-yellow-500 mr-1" />{" "}
                {house.rating}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomePage;
