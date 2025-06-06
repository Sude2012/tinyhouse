"use client";
import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function AddReviewPage() {
    const searchParams = useSearchParams();
    const houseId = searchParams.get("houseId");
    const router = useRouter();
    const [comment, setComment] = useState("");
    const [rating, setRating] = useState(5);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSuccess("");
        setError("");
        const userEmail = localStorage.getItem("email");
        if (!userEmail) {
            setError("Lütfen giriş yapınız.");
            setLoading(false);
            return;
        }
        try {
            const res = await fetch("http://localhost:5254/api/reviews", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    houseId: Number(houseId),
                    userEmail,
                    comment,
                    rating: Number(rating)
                }),
            });
            const data = await res.json();
            if (res.ok) {
                setSuccess("Yorum eklendi!");
                setTimeout(() => router.back(), 1500);
            } else {
                setError(data.message || "Bir hata oluştu.");
            }
        } catch (err) {
            setError("Sunucu hatası!");
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F7F5F2]">
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow w-full max-w-md">
                <h2 className="text-xl font-bold mb-4 text-black">Yorum Ekle</h2>
                <div className="mb-3">
                    <label className="block mb-1 text-black">Yorumunuz</label>
                    <textarea
                        value={comment}
                        onChange={e => setComment(e.target.value)}
                        className="w-full border rounded p-2 text-black"
                        rows={3}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label className="block mb-1 text-black">Puan (1-5)</label>
                    <input
                        type="number"
                        value={rating}
                        onChange={e => setRating(e.target.value)}
                        min={1}
                        max={5}
                        className="w-full border rounded p-2 text-black"
                        required
                    />
                </div>
                <button
                    type="submit"
                    className="text-white px-4 py-2 rounded"
                    style={{ backgroundColor: "#906668" }}
                    disabled={loading}
                >
                    {loading ? "Ekleniyor..." : "Yorumu Kaydet"}
                </button>
                {success && <p className="text-green-600 mt-2">{success}</p>}
                {error && <p className="text-red-600 mt-2">{error}</p>}
            </form>
        </div>
    );
}
