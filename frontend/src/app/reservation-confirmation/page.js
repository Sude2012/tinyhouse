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
        const cardNumberClean = cardNumber.replace(/\s/g, "");
        if (
            !/^\d{16}$/.test(cardNumberClean) ||
            !/^\d{2}\/\d{2}$/.test(expiryDate) ||
            !/^\d{3}$/.test(cvv)
        ) {
            alert("Lütfen kart numarası (16 rakam), son kullanma tarihi (AA/YY) ve CVV (3 rakam) alanlarını doğru girin.");
            return;
        }
        setPaymentReady(true); // Ödeme kısmı tamamlandı, rezervasyon yapılabilir
    };

    // Rezervasyon Kaydet
    const handleReservation = async () => {
        setLoading(true);
        const userEmail = localStorage.getItem("email") || "guest@example.com";
        try {
            const resp = await fetch("http://localhost:5254/api/reservations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    houseId: Number(houseId),
                    userEmail,
                    startDate: new Date(start).toLocaleDateString("sv-SE"),
                    endDate: new Date(end).toLocaleDateString("sv-SE"),
                    totalPrice: Number(total)
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
                        <h1 className="text-2xl font-bold text-center mb-6">Rezervasyon Özeti</h1>
                        <div className="bg-[#f5f5f5] p-4 rounded mb-6 text-sm">
                            <p><span className="font-semibold">Giriş Tarihi:</span> {formatDate(start)}</p>
                            <p><span className="font-semibold">Çıkış Tarihi:</span> {formatDate(end)}</p>
                            <p><span className="font-semibold">Toplam Tutar:</span> {total} ₺</p>
                        </div>
                        {/* Kart bilgileri alanı */}
                        {!paymentReady ? (
                            <div className="space-y-4 mb-6">
                                {/* Kart numarası (4'lü gruplar halinde) */}
                                <input
                                    type="text"
                                    placeholder="Kart Numarası"
                                    value={cardNumber}
                                    onChange={(e) => {
                                        let value = e.target.value.replace(/\D/g, "").slice(0, 16);
                                        value = value.replace(/(.{4})/g, "$1 ").trim(); // 4'lü gruplar
                                        setCardNumber(value);
                                    }}
                                    className="w-full border rounded px-3 py-2"
                                    maxLength={19} // 16 rakam + 3 boşluk
                                />
                                {/* Son kullanma tarihi (AA/YY) */}
                                <input
                                    type="text"
                                    placeholder="Son Kullanma (AA/YY)"
                                    value={expiryDate}
                                    onChange={(e) => {
                                        let value = e.target.value.replace(/\D/g, "");
                                        if (value.length > 4) value = value.slice(0, 4);
                                        if (value.length > 2) value = value.slice(0, 2) + "/" + value.slice(2);
                                        setExpiryDate(value);
                                    }}
                                    className="w-full border rounded px-3 py-2"
                                    maxLength={5}
                                />
                                {/* CVV */}
                                <input
                                    type="text"
                                    placeholder="CVV"
                                    value={cvv}
                                    onChange={(e) =>
                                        setCvv(e.target.value.replace(/\D/g, "").slice(0, 3))
                                    }
                                    className="w-full border rounded px-3 py-2"
                                    maxLength={3}
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
                        <h1 className="text-2xl font-bold text-center mb-6">Rezervasyon Başarılı 🎉</h1>
                        <div className="flex items-center gap-4 mb-4">
                            <FaCreditCard className="text-green-600 text-2xl" />
                            <div>
                                <p className="font-semibold">Online Rezervasyon Tamamlandı</p>
                                <p className="text-sm text-gray-600">Ödemeniz başarıyla alındı.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 mb-6">
                            <FaCheckCircle className="text-blue-600 text-2xl" />
                            <div>
                                <p className="font-semibold">Rezervasyon Onaylandı</p>
                                <p className="text-sm text-gray-600">Detaylar e-posta adresinize gönderildi.</p>
                            </div>
                        </div>
                        <button
                            onClick={() => router.push("/tenant2")}
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