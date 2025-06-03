"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function MyReservations() {
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const email = typeof window !== "undefined" ? localStorage.getItem("email") : "";
    const router = useRouter();

    useEffect(() => {
        if (!email) {
            setLoading(false);
            setError("Giriş yapmadınız.");
            return;
        }

        setLoading(true);
        fetch(`http://localhost:5254/api/reservations/by-user?email=${email}`)
            .then((res) => {
                if (!res.ok) throw new Error("Veri alınamadı!");
                return res.json();
            })
            .then((data) => {
                setReservations(data);
                setLoading(false);
            })
            .catch((err) => {
                setError("Rezervasyonlar alınamadı.");
                setLoading(false);
            });
    }, [email]);

    function toLocalDateString(dateString) {
        if (!dateString) return "-";
        const date = new Date(dateString);
        return date.toLocaleDateString("tr-TR");
    }

    return (
        <div className="min-h-screen bg-[#F7F5F2]">
            <div className="max-w-3xl mx-auto py-12">
                <h1 className="text-3xl font-bold mb-8 text-[#260B01]">Rezervasyonlarım</h1>
                {loading ? (
                    <p className="text-[#260B01]">Yükleniyor...</p>
                ) : error ? (
                    <p className="text-red-600">{error}</p>
                ) : reservations.length === 0 ? (
                    <p className="text-[#260B01]">Henüz rezervasyonunuz yok.</p>
                ) : (
                    <ul className="space-y-4">
                        {reservations.map((r) => (
                            <li
                                key={r.id}
                                className="bg-white p-4 rounded shadow flex justify-between items-center"
                                style={{ color: "#260B01" }}
                            >
                                <span>
                                    Ev: <b>{r.houseLocation || r.houseName || r.houseId}</b> <br />
                                    Tarih: {toLocalDateString(r.startDate)} - {toLocalDateString(r.endDate)} <br />
                                    Tutar: ₺{r.totalPrice}
                                </span>
                                <div className="flex flex-col gap-2 items-end">
                                    {/* Yorum ekle butonu */}
                                    <button
                                        className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-800 text-sm"
                                        onClick={() => router.push(`/add-review?houseId=${r.houseId}`)}
                                    >
                                        Yorum Ekle
                                    </button>
                                    {/* İptal Et butonu */}
                                    <button
                                        className="text-red-600 font-bold hover:underline text-sm"
                                        onClick={async () => {
                                            if (window.confirm("Bu rezervasyonu iptal etmek istediğinize emin misiniz?")) {
                                                const resp = await fetch(`http://localhost:5254/api/reservations/${r.id}`, {
                                                    method: "DELETE",
                                                });
                                                if (resp.ok) {
                                                    setReservations((prev) => prev.filter((item) => item.id !== r.id));
                                                } else {
                                                    alert("İptal işlemi başarısız oldu!");
                                                }
                                            }
                                        }}
                                    >
                                        İptal Et
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
