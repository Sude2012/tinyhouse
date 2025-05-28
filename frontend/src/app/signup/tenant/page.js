"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import bcrypt from "bcryptjs"; // bcryptjs import et

export default function TenantSignupPage() {
  const router = useRouter();

  // Form inputları için state'ler
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();

    // Şifreyi hashle
    const hashedPassword = await bcrypt.hash(password, 10);

    // Backend'e gönderilecek veri
    const response = await fetch("http://localhost:5254/api/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: name, // Kullanıcı adı
        email: email, // Email
        passwordHash: hashedPassword, // Hashlenmiş şifre
      }),
    });

    const data = await response.json(); // API'den gelen yanıtı al

    if (response.ok) {
      alert("Kayıt başarılı!");
      router.push("/login"); // Kayıt başarılıysa login sayfasına yönlendir
    } else {
      alert(data.message || "Kayıt başarısız");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Kiracı Kaydı</h1>
        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block mb-1">İsim</label>
            <input
              type="text"
              className="w-full px-4 py-2 border rounded"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block mb-1">Email</label>
            <input
              type="email"
              className="w-full px-4 py-2 border rounded"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block mb-1">Şifre</label>
            <input
              type="password"
              className="w-full px-4 py-2 border rounded"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-[#C99297] text-white py-2 rounded hover:bg-[#906668]"
          >
            Kaydol
          </button>
        </form>
      </div>
    </div>
  );
}
