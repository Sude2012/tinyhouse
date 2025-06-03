"use client";
import { useEffect, useState } from "react";

export default function MyReviews() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const userEmail = typeof window !== "undefined" ? localStorage.getItem("email") : "";

    useEffect(() => {
        if (!userEmail) {
            setError("Giriş yapmadınız.");
            setLoading(false);
            return;
        }
        fetch(`http://localhost:5254/api/reviews/by-user?email=${userEmail}`)
            .then(res => {
                if (!res.ok) throw new Error("Yorumlar alınamadı.");
                return res.json();
            })
            .then(data => setReviews(data))
            .catch(() => setError("Yorumlar alınamadı."))
            .finally(() => setLoading(false));
    }, [userEmail]);

    const handleDelete = async (id) => {
        if (!window.confirm("Bu yorumu silmek istiyor musunuz?")) return;
        const resp = await fetch(`http://localhost:5254/api/reviews/${id}`, { method: "DELETE" });
        if (resp.ok) {
            setReviews((prev) => prev.filter((r) => r.id !== id));
        } else {
            alert("Silinemedi!");
        }
    };

    return (
        <div className="min-h-screen bg-[#F7F5F2] px-2">
            <div className="max-w-3xl mx-auto py-12">
                <h1 className="text-3xl font-bold mb-8 text-[#260B01]">Yorumlarım</h1>
                {loading ? (
                    <p className="text-[#260B01]">Yükleniyor...</p>
                ) : error ? (
                    <p className="text-red-600">{error}</p>
                ) : reviews.length === 0 ? (
                    <p className="text-[#260B01]">Henüz yorumunuz yok.</p>
                ) : (
                    <ul className="space-y-4">
                        {reviews.map(r => (
                            <li
                                key={r.id}
                                className="bg-white p-4 rounded shadow flex justify-between items-center"
                                style={{ color: "#260B01" }}
                            >
                                <span>
                                    <b>{r.houseLocation}</b> – <span className="font-semibold">{r.rating}⭐</span>
                                    <br />
                                    {r.comment}
                                </span>
                                <button
                                    onClick={() => handleDelete(r.id)}
                                    className="text-red-600 font-bold hover:underline"
                                >
                                    Sil
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
