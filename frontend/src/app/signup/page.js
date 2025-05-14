"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();

  // Form inputları için state'ler
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [ownerPassword, setOwnerPassword] = useState("");

  const [userType, setUserType] = useState(null);

  // Signup işlemi için handleSignup fonksiyonu
  const handleSignup = async (e) => {
    e.preventDefault(); // Sayfanın yenilenmesini engelle

    const response = await fetch("http://localhost:5254/api/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: name,
        email,
        password: password, // Send plain password for now
      }),
    });

    const data = await response.json();

    // API'den gelen cevabı konsola yazdırıyoruz
    console.log(data);

    if (response.ok) {
      alert("Kayıt başarılı!");
      router.push("/login"); // Başarılı girişte login sayfasına yönlendir
    } else {
      alert(data.message || "Kayıt başarısız");
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <img
        src="/tinyhouse3.jpeg"
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover opacity-82 z-0"
      />
      <div className="bg-white p-10 rounded shadow-md flex flex-col items-center space-y-4 relative z-8 w-full max-w-md">
        <h2 className="text-3xl font-bold mb-4 text-center">Kaydol</h2>

        {!userType && (
          <>
            <p className="text-center mb-6">
              Lütfen kaydolmak istediğiniz türü seçin:
            </p>

            <button
              onClick={() => setUserType("tenant")}
              className="w-64 bg-[#260B01] text-white py-3 rounded hover:bg-[#CDBEAF] transition mb-4"
            >
              Kiracı Olarak Kaydol
            </button>

            <button
              onClick={() => setUserType("owner")}
              className="w-64 bg-[#260B01] text-white py-3 rounded hover:bg-[#CDBEAF] transition"
            >
              İlan Sahibi Olarak Kaydol
            </button>
          </>
        )}

        {userType === "tenant" && (
          <form className="w-full" onSubmit={handleSignup}>
            <button
              type="button"
              onClick={() => setUserType(null)}
              className="text-sm text-black-500 hover:underline mb-4"
            >
              &larr; Geri
            </button>
            <h3 className="text-xl font-semibold mb-4 text-center">
              Kiracı Kaydı
            </h3>
            <div className="mb-4">
              <label className="block mb-1">İsim</label>
              <input
                type="text"
                className="w-full px-4 py-2 border rounded"
                placeholder="Adınız"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1">Email</label>
              <input
                type="email"
                className="w-full px-4 py-2 border rounded"
                placeholder="Email adresiniz"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1">Şifre</label>
              <input
                type="password"
                className="w-full px-4 py-2 border rounded"
                placeholder="Şifreniz"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="w-full bg-[#260B01] text-white py-3 rounded hover:bg-[#3e2010] transition"
            >
              Kaydol
            </button>
          </form>
        )}

        {userType === "owner" && (
          <form className="w-full">
            <button
              type="button"
              onClick={() => setUserType(null)}
              className="text-sm text-black-500 hover:underline mb-4"
            >
              &larr; Geri
            </button>
            <h3 className="text-xl font-semibold mb-4 text-center">
              İlan Sahibi Kaydı
            </h3>
            <div className="mb-4">
              <label className="block mb-1">Firma Adı</label>
              <input
                type="text"
                className="w-full px-4 py-2 border rounded"
                placeholder="Firma veya adınız"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1">Email</label>
              <input
                type="email"
                className="w-full px-4 py-2 border rounded"
                placeholder="Email adresiniz"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1">Şifre</label>
              <input
                type="password"
                className="w-full px-4 py-2 border rounded"
                placeholder="Şifreniz"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-[#260B01] text-white py-3 rounded hover:bg-[#CDBEAF] transition"
            >
              Kaydol
            </button>
          </form>
        )}

        <div className="text-center mt-4">
          <p className="text-sm">
            Zaten bir hesabınız var mı?{" "}
            <span
              onClick={() => router.push("/login")}
              className="text-[#260B01] cursor-pointer"
            >
              Giriş yapın
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
