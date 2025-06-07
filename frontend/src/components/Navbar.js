"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CgArrowRightO, CgHomeAlt, CgHeart, CgProfile } from "react-icons/cg";

const Navbar = () => {
  const router = useRouter();
  const [city, setCity] = useState("");
  const [error, setError] = useState("");
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isFeaturesOpen, setIsFeaturesOpen] = useState(false);
  const loginRef = useRef();
  const featuresRef = useRef();

  // Dışarı tıklanınca dropdown kapatma
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        loginRef.current &&
        !loginRef.current.contains(event.target) &&
        isLoginOpen
      ) {
        setIsLoginOpen(false);
      }
      if (
        featuresRef.current &&
        !featuresRef.current.contains(event.target) &&
        isFeaturesOpen
      ) {
        setIsFeaturesOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isLoginOpen, isFeaturesOpen]);

  // Arama fonksiyonu
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!city) {
      setError("Bir il girin.");
      return;
    }
    // Şehre göre ana sayfada filtre uygulayacak query string ile yönlendir
    router.push(`/?city=${encodeURIComponent(city)}`);
  };

  return (
    <nav className="bg-[white] border-b border-gray-200 px-4 py-5 flex flex-wrap items-center justify-between">
      {/* Sol taraf */}
      <div className="flex flex-wrap items-center gap-4 flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-4 flex-1 min-w-0">
          <img src="/tinyhouse.svg" alt="Logo" className="w-90 h-15" />
        </div>

        {/* Home */}
        <div>
          <Link href="/" className="flex items-center gap-1 text-[black] ml-5">
            <span>Home</span>
            <CgHomeAlt className="text-[#260B01] text-lg" />
          </Link>
        </div>

        {/* Arama Çubuğu */}
        <form
          onSubmit={handleSearch}
          className="relative flex-grow max-w-xl w-full min-w-[200px] ml-20"
        >
          <input
            type="text"
            placeholder="Aramak istediğiniz şehri seçiniz..."
            value={city}
            onChange={(e) => {
              setCity(e.target.value);
              setError("");
            }}
            className="w-full border border-gray-300 rounded-full px-4 py-3 text-sm pr-10"
          />
          <button
            type="submit"
            className="absolute inset-y-0 right-3 flex items-center text-[#C99297]"
          >
            <CgArrowRightO className="text-xl" />
          </button>
          {error && <p className="text-red-500 mt-1 text-sm">{error}</p>}
        </form>
      </div>
      {/* Sağ taraf */}
      <div className="relative mt-3 sm:mt-0" ref={loginRef}>
        <button
          onClick={() => setIsLoginOpen(!isLoginOpen)}
          className="text-[#C99297] flex items-center"
        >
          <span className="text-4xl mr-4 ml-25">
            <CgProfile />
          </span>
        </button>
        {isLoginOpen && (
          <div className="absolute mt-2 right-0 w-40 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
            <Link href="/login" className="block px-4 py-2 hover:bg-gray-100">
              Giriş Yap
            </Link>
            <Link href="/signup" className="block px-4 py-2 hover:bg-gray-100">
              Kaydol
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
