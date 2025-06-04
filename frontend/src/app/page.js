"use client";
import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { IoIosArrowDown } from "react-icons/io";
import { FiSearch } from "react-icons/fi";
import { FaBed, FaBath, FaStar, FaUserCircle } from "react-icons/fa";

const HomePage = () => {
    const searchParams = useSearchParams();
    const cityQuery = searchParams.get("city") || "";

    // Arama ve filtre state'leri
    const [showGuestDropdown, setShowGuestDropdown] = useState(false);
    const [adultCount, setAdultCount] = useState(1);
    const [childCount, setChildCount] = useState(0);
    const dropdownRef = useRef(null);

    // Evler state
    const [dbHouses, setDbHouses] = useState([]);
    const [popularHouses, setPopularHouses] = useState([]);
    const [filteredHouses, setFilteredHouses] = useState([]);
    const [loadingPopular, setLoadingPopular] = useState(true);

    const [locationQuery, setLocationQuery] = useState("");
    const [checkIn, setCheckIn] = useState("");
    const [checkOut, setCheckOut] = useState("");
    const totalGuests = adultCount + childCount;

    // Arama butonu tıklanınca filtreli evleri getir
    const handleSearch = () => {
        const query = new URLSearchParams();
        if (locationQuery.trim()) query.append("city", locationQuery);
        if (totalGuests > 0) query.append("capacity", totalGuests);
        if (checkIn) query.append("startDate", checkIn);
        if (checkOut) query.append("endDate", checkOut);

        fetch(`http://localhost:5254/api/houses/filter?${query.toString()}`)
            .then(res => res.json())
            .then(data => setFilteredHouses(data));
    };

    // Tüm evleri veritabanından çek
    useEffect(() => {
        fetch(`http://localhost:5254/api/houses/all`)
            .then(res => res.json())
            .then(data => setDbHouses(data));
    }, []);

    // Popüler evleri çek
    useEffect(() => {
        fetch(`http://localhost:5254/api/houses/popular`)
            .then(res => res.json())
            .then(data => setPopularHouses(data))
            .catch(() => setPopularHouses([]))
            .finally(() => setLoadingPopular(false));
    }, []);

    // Kişi sayısı dropdownunu dış tıklayınca kapat
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowGuestDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Tüm evleri objeye çevir ve filtre uygula
    const allHouses = dbHouses.map((ev) => ({
        id: ev.id,
        city: ev.city,
        country: ev.country,
        bedroomCount: ev.bedroomCount,
        bathroomCount: ev.bathroomCount,
        pricePerNight: ev.pricePerNight,
        averageRating: ev.averageRating,
        capacity: ev.capacity,
        coverImageUrl: ev.coverImageUrl ? "http://localhost:5254" + ev.coverImageUrl : "/placeholder.jpg",
        location: ev.city && ev.country ? `${ev.city}, ${ev.country}` : "" // DAİMA location oluştur
    }));



    // Filtre parametresine göre (veya ilk açıldığında) filtreli evleri ayarla
    useEffect(() => {
        if (!cityQuery.trim()) {
            setFilteredHouses(allHouses); // Tüm evleri göster
            setLocationQuery("");
        } else {
            setFilteredHouses(
                allHouses.filter((house) =>
                    house.location.toLowerCase().includes(cityQuery.toLowerCase())
                )
            );
            setLocationQuery(cityQuery);
        }
    }, [cityQuery, dbHouses]);


    return (
        <div
            className="flex flex-col items-center px-4 py-8 min-h-screen"
            style={{ backgroundColor: "#FFF6F6" }}
        >
            <h1 className="text-4xl font-bold mb-6 text-[black]">TİNY HOUSE</h1>

            {/* Arama Alanı */}
            <div className="flex flex-wrap gap-4 p-4 rounded-md w-full max-w-4xl justify-center" style={{ backgroundColor: "#FFDADB" }}>
                {/* Yer */}
                <div className="flex flex-col items-start w-40">
                    <label htmlFor="location" className="text-[black]">Yer</label>
                    <input
                        type="text"
                        id="location"
                        placeholder="Yer"
                        value={locationQuery}
                        onChange={e => setLocationQuery(e.target.value)}
                        className="border px-3 py-2 rounded w-full text-[#260B01]"
                        style={{ backgroundColor: "#FFF6F6" }}
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
                        value={checkIn}
                        onChange={e => setCheckIn(e.target.value)}
                        className="border px-3 py-2 rounded w-full text-[#260B01]"
                        style={{ backgroundColor: "#FFF6F6" }}
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
                        value={checkOut}
                        onChange={e => setCheckOut(e.target.value)}
                        className="border px-3 py-2 rounded w-full text-[#260B01]"
                        style={{ backgroundColor: "#FFF6F6" }}
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
                        style={{ backgroundColor: "#FFF6F6" }}
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

                <button className="bg-[#260B01] text-white px-3 py-1 rounded hover:bg-[#3d1703] flex items-center gap-2" onClick={handleSearch}>
                    <FiSearch className="text-[#260B01] bg-white rounded-full p-1" size={20} /> Ara
                </button>
            </div>

            {/* Popüler Evler */}
            <div className="mb-10">
                <h2 className="text-2xl font-semibold mb-4 text-[#260B01]">Popüler Evler</h2>
                {loadingPopular ? (
                    <div>Yükleniyor...</div>
                ) : popularHouses.length === 0 ? (
                    <div>Henüz popüler ev yok.</div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {popularHouses.map((house) => (
                            <Link key={house.id} href={`/houses/${house.id}`}
                                className="block bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow">
                                <img src={"http://localhost:5254" + house.coverImageUrl} alt={house.city} className="w-full h-48 object-cover" />
                                <div className="p-4">
                                    <h2 className="text-xl font-semibold mb-1">{house.city}, {house.country}</h2>
                                    <div className="flex items-center gap-3 text-sm mb-2">
                                        <div className="flex items-center gap-1"><FaBed /> {house.bedroomCount}</div>
                                        <div className="flex items-center gap-1"><FaBath /> {house.bathroomCount}</div>
                                        <div className="flex items-center gap-1"><FaUserCircle /> {house.capacity} Kişi</div>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="font-bold">₺{house.pricePerNight}/gece</span>
                                        <span className="flex items-center gap-1 text-yellow-500"><FaStar /> {house.averageRating}</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
            {/* Ev Kartları */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10 w-full max-w-6xl text-[#260B01]">
                {filteredHouses.length === 0 ? (
                    <div className="col-span-3 text-center text-lg font-semibold">
                        Aradığınız şehre uygun ev bulunamadı.
                    </div>
                ) : (
                    filteredHouses.map((house, index) => (
                        <Link key={house.id + "_" + index}
                            href={`/houses/${house.id}`}
                            className="block bg-white rounded-lg overflow-hidden shadow-md relative cursor-pointer hover:shadow-xl transition-shadow "
                        >
                            <img
                                src={house.coverImageUrl || house.image || "/placeholder.jpg"}
                                alt={`Ev ${house.id}`}
                                className="w-full h-48 object-cover"
                            />
                            <div className="p-4">
                                <div>
                                    <h2 className="text-base font-semibold mb-1 truncate">{house.city ? `${house.city}, ${house.country}` : house.location}</h2>
                                    <div className="flex items-center gap-2 text-sm mb-2">
                                        <div className="flex items-center gap-1"><FaBed /> {house.bedroomCount || house.beds} Yatak Odası</div>
                                        <div className="flex items-center gap-1"><FaBath /> {house.bathroomCount || house.baths} Banyo</div>
                                        <div className="flex items-center gap-1"><FaUserCircle /> {house.capacity} Kişi</div>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="font-bold">₺{house.pricePerNight || house.price}/gece</span>
                                    <span className="flex items-center gap-1 text-yellow-500"><FaStar /> {house.averageRating}</span>
                                </div>
                            </div>
                        </Link>
                    ))
                )}
            </div>

        </div>
    );
};

export default HomePage;
