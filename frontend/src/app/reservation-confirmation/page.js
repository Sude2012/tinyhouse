"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { FaCheckCircle, FaCreditCard } from "react-icons/fa";

export default function ReservationConfirmation() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const start = searchParams.get("start");
  const end = searchParams.get("end");
  const total = searchParams.get("total");
  const houseId = searchParams.get("houseId");

  const [reservationDone, setReservationDone] = useState(false);
  const [loading, setLoading] = useState(false);

  // Kart bilgileri için state
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [paymentReady, setPaymentReady] = useState(false);

  const formatDate = (isoString) => {
    if (!isoString) return "-";
    const date = new Date(isoString);
    return date.toLocaleDateString("tr-TR");
  };

  // Sahte ödeme işlemi
  const handlePayment = () => {
    if (cardNumber && expiryDate && cvv) {
      setPaymentReady(true); // Ödeme kısmı tamamlandı, rezervasyon yapılabilir
    } else {
      alert("Lütfen tüm kart bilgilerini doldurun.");
    }
  };

  // Rezervasyon Kaydet
  const handleReservation = async () => {
    setLoading(true);
    const userEmail = localStorage.getItem("email") || "guest@example.com";
    try {
      const resp = await fetch("http://localhost:5254/api/reservations/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          houseId: Number(houseId),
          userEmail,
          startDate: start,
          endDate: end,
          totalPrice: Number(total),
        }),
      });
      if (resp.ok) {
        setReservationDone(true);
      } else {
        alert("Rezervasyon kaydedilemedi! Lütfen tekrar deneyin.");
      }
    } catch {
      alert("Bir hata oluştu!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f3f0ee] px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-[#260B01]">
        {!reservationDone ? (
          <>
            <h1 className="text-2xl font-bold text-center mb-6">
              Rezervasyon Özeti
            </h1>
            <div className="bg-[#f5f5f5] p-4 rounded mb-6 text-sm">
              <p>
                <span className="font-semibold">Giriş Tarihi:</span>{" "}
                {formatDate(start)}
              </p>
              <p>
                <span className="font-semibold">Çıkış Tarihi:</span>{" "}
                {formatDate(end)}
              </p>
              <p>
                <span className="font-semibold">Toplam Tutar:</span> {total} ₺
              </p>
            </div>
            {/* Kart bilgileri alanı */}
            {!paymentReady ? (
              <div className="space-y-4 mb-6">
                <input
                  type="text"
                  placeholder="Kart Numarası"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                />
                <input
                  type="text"
                  placeholder="Son Kullanma (AA/YY)"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                />
                <input
                  type="text"
                  placeholder="CVV"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                />
                <button
                  onClick={handlePayment}
                  className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition font-semibold"
                >
                  Ödemeyi Tamamla
                </button>
              </div>
            ) : (
              <button
                onClick={handleReservation}
                disabled={loading}
                className="w-full bg-[#260B01] text-white py-2 rounded-lg hover:bg-[#3d1703] transition font-semibold"
              >
                {loading ? "Kaydediliyor..." : "Rezervasyonu Tamamla"}
              </button>
            )}
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-center mb-6">
              Rezervasyon Başarılı 🎉
            </h1>
            <div className="flex items-center gap-4 mb-4">
              <FaCreditCard className="text-green-600 text-2xl" />
              <div>
                <p className="font-semibold">Online Rezervasyon Tamamlandı</p>
                <p className="text-sm text-gray-600">
                  Ödemeniz (örnek) başarıyla alındı.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 mb-6">
              <FaCheckCircle className="text-blue-600 text-2xl" />
              <div>
                <p className="font-semibold">Rezervasyon Onaylandı</p>
                <p className="text-sm text-gray-600">
                  Detaylar e-posta adresinize gönderildi.
                </p>
              </div>
            </div>
            <button
              onClick={() => router.push("/")}
              className="w-full bg-[#260B01] text-white py-2 rounded-lg hover:bg-[#3d1703] transition font-semibold"
            >
              Ana Sayfaya Dön
            </button>
          </>
        )}
      </div>
    </div>
  );
}
