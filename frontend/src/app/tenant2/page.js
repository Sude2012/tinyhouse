"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { IoIosArrowDown } from "react-icons/io";
import { FiSearch } from "react-icons/fi";
import { FaBed, FaBath, FaStar, FaUserCircle } from "react-icons/fa";

const TenantPage = () => {
    const searchParams = useSearchParams();
    const cityQuery = searchParams.get("city") || "";
    const [showGuestDropdown, setShowGuestDropdown] = useState(false);
    const [adultCount, setAdultCount] = useState(1);
    const [childCount, setChildCount] = useState(0);
    const dropdownRef = useRef(null);
    const [popularHouses, setPopularHouses] = useState([]);
    const [loadingPopular, setLoadingPopular] = useState(true);
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);
    const [userEmail, setUserEmail] = useState("");
    const router = useRouter();
    const [dbHouses, setDbHouses] = useState([]);
    const [locationQuery, setLocationQuery] = useState("");
    const [filteredHouses, setFilteredHouses] = useState([]);
    const totalGuests = adultCount + childCount;

    // Kullanıcı emailini çek
    useEffect(() => {
        const email = localStorage.getItem("email");
        setUserEmail(email || "");
    }, []);

    // DB'den evleri çek
    useEffect(() => {
        const storedEmail = localStorage.getItem("email");
        if (storedEmail) {
            fetch("http://localhost:5254/api/houses/all")
                .then(res => res.json())
                .then(data => setDbHouses(data));
        }
    }, []);

    // Popüler evleri getir
    useEffect(() => {
        fetch("http://localhost:5254/api/houses/popular")
            .then(res => res.json())
            .then(data => setPopularHouses(data))
            .catch(() => setPopularHouses([]))
            .finally(() => setLoadingPopular(false));
    }, []);

    // Kişi dropdownunu dışarı tıklayınca kapat
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowGuestDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Veritabanı evlerini objeye çevir
    const allHouses = dbHouses.map((ev) => ({
        id: ev.id,
        location: `${ev.city}, ${ev.country}`,
        beds: ev.bedroomCount,
        baths: ev.bathroomCount,
        price: ev.pricePerNight,
        averageRating: ev.averageRating,
        capacity: ev.capacity,
        image: "http://localhost:5254" + ev.coverImageUrl,
    }));

    // allHouses her değiştiğinde filtreli evleri güncelle (sayfa ilk açıldığında tüm evler)
    useEffect(() => {
        if (!cityQuery.trim()) {
            setFilteredHouses(allHouses);
            setLocationQuery("");
        } else {
            setFilteredHouses(
                allHouses.filter((house) =>
                    house.location.toLowerCase().includes(cityQuery.toLowerCase())
                )
            );
            setLocationQuery(cityQuery);
        }
        // eslint-disable-next-line
    }, [cityQuery, dbHouses]);

    // Sayfa içindeki "Ara" butonu ile filtreleme (state üzerinden)
    const handleSearch = () => {
        if (!locationQuery.trim()) {
            setFilteredHouses(allHouses);
            return;
        }
        setFilteredHouses(
            allHouses.filter((house) =>
                house.location.toLowerCase().includes(locationQuery.toLowerCase())
            )
        );
    };

    return (
        <div
            className="flex flex-col items-center px-4 py-8 min-h-screen"
            style={{ backgroundColor: "#FFF6F6" }}
        >
            {/* SAĞ ÜST PROFİL */}
            <div className="w-full flex justify-end max-w-6xl mb-4">
                <div ref={menuRef} className="relative">
                    <button
                        className="flex items-center gap-2 bg-[#EDE3E2] px-4 py-2 rounded-full shadow text-[#260B01] hover:bg-[#e0c5c5]"
                        onClick={() => setMenuOpen(!menuOpen)}
                    >
                        <FaUserCircle className="text-2xl" />
                        <span className="font-semibold">{userEmail}</span>
                    </button>
                    {/* Dropdown Menü */}
                    {menuOpen && (
                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-2 border">
                            <button
                                className="block w-full text-left px-4 py-2 hover:bg-[#EDE3E2]"
                                onClick={() => {
                                    setMenuOpen(false);
                                    router.push("/my-reservations");
                                }}
                            >
                                Rezervasyonlarım
                            </button>
                            <button
                                className="block w-full text-left px-4 py-2 hover:bg-[#EDE3E2]"
                                onClick={() => {
                                    setMenuOpen(false);
                                    router.push("/my-reviews");
                                }}
                            >
                                Yorumlarım
                            </button>
                            <button
                                className="block w-full text-left px-4 py-2 hover:bg-[#f8d7da] text-red-700"
                                onClick={() => {
                                    setMenuOpen(false);
                                    localStorage.removeItem("email");
                                    router.push("/");
                                }}
                            >
                                Çıkış Yap
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Arama Alanı */}
            <div
                className="flex flex-wrap gap-4 p-4 rounded-md w-full max-w-4xl justify-center"
                style={{ backgroundColor: "#FFDADB" }}
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
                <button
                    className="bg-[#260B01] text-white px-3 py-1 rounded hover:bg-[#3d1703] flex items-center gap-2"
                    onClick={handleSearch}
                >
                    <FiSearch className="text-[#260B01] bg-white rounded-full p-1" size={20} />
                    Ara
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
                    <div className="col-span-3 text-center text-lg font-semibold">Aradığınız şehre uygun ev bulunamadı.</div>
                ) : (
                    filteredHouses.map((house, index) => (
                        <Link key={house.id + "_" + index} href={`/houses/${house.id}`}
                            className="block bg-white rounded-lg overflow-hidden shadow-md relative cursor-pointer hover:shadow-xl transition-shadow">
                            <img src={house.image} alt={`Ev ${house.id}`} className="w-full h-48 object-cover" />
                            <div className="p-4">
                                <h2 className="text-xl font-semibold mb-1">{house.location}</h2>
                                <div className="flex items-center gap-4 text-sm mb-2">
                                    <div className="flex items-center gap-1"><FaBed /> {house.beds} Yatak Odası</div>
                                    <div className="flex items-center gap-1"><FaBath /> {house.baths} Banyo</div>
                                    <div className="flex items-center gap-1">
                                        <FaUserCircle /> {house.capacity} Kişi
                                    </div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="font-bold">₺{house.price}/gece</span>
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

export default TenantPage;
