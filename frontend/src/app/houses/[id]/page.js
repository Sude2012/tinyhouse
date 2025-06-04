"use client";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { FaStar, FaBed, FaBath, FaUserCircle } from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { differenceInDays, isWithinInterval } from "date-fns";

export default function HouseDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = Number(params.id);

    const [comments, setComments] = useState([]);
    const [commentsLoading, setCommentsLoading] = useState(true);
    const [loginWarning, setLoginWarning] = useState(false);
    const [house, setHouse] = useState(null);
    const [bookedDates, setBookedDates] = useState([]);

    // Rezervasyon tarihleri
    useEffect(() => {
        fetch(`http://localhost:5254/api/reservations/by-house?id=${id}`)
            .then(res => res.json())
            .then(data => setBookedDates(data))
            .catch(() => setBookedDates([]));
    }, [id]);

    // Yorumlar
    useEffect(() => {
        setCommentsLoading(true);
        fetch(`http://localhost:5254/api/reviews/by-house?id=${id}`)
            .then(res => res.json())
            .then(data => setComments(data))
            .catch(() => setComments([]))
            .finally(() => setCommentsLoading(false));
    }, [id]);

    // Evin detaylarını veritabanından çek
    // Fetch edilen data örneğin:
    fetch(`http://localhost:5254/api/houses/${id}`)
        .then((res) => res.json())
        .then((data) => {
            if (data) {
                setHouse({
                    id: data.id,
                    location: `${data.city}, ${data.country}`,
                    beds: data.bedroomCount,
                    baths: data.bathroomCount,
                    pricePerNight: data.pricePerNight,
                    averageRating: data.averageRating ?? data.rating ?? "-",
                    description: data.description,
                    features: data.features || ["Wi-Fi", "Klima"],
                    photos: data.interiorImageUrls && data.interiorImageUrls.length > 0
                        ? data.interiorImageUrls
                        : [data.coverImageUrl],
                    capacity: data.capacity ?? 1
                });
            }
        });


    const [currentPhoto, setCurrentPhoto] = useState(0);
    const [dateRange, setDateRange] = useState([null, null]);
    const [adults, setAdults] = useState(1);
    const [children, setChildren] = useState(0);
    const [startDate, endDate] = dateRange;

    const nights = startDate && endDate ? differenceInDays(endDate, startDate) : 0;
    const totalPrice = nights * (house?.pricePerNight || 0);

    const nextPhoto = () =>
        setCurrentPhoto((prev) => (prev + 1) % (house?.photos?.length || 1));
    const prevPhoto = () =>
        setCurrentPhoto((prev) => (prev - 1 + (house?.photos?.length || 1)) % (house?.photos?.length || 1));

    const clearDates = () => setDateRange([null, null]);

    const isOverlapping = () => {
        if (!startDate || !endDate) return false;
        return bookedDates.some(({ start, end }) => (
            isWithinInterval(start, { start: startDate, end: endDate }) ||
            isWithinInterval(end, { start: startDate, end: endDate }) ||
            isWithinInterval(startDate, { start, end }) ||
            isWithinInterval(endDate, { start, end })
        ));
    };

    // Disable dates
    const disabledDates = [];
    bookedDates.forEach(({ start, end }) => {
        const date = new Date(start);
        while (date <= new Date(end)) {
            disabledDates.push(new Date(date));
            date.setDate(date.getDate() + 1);
        }
    });

    // Buton işlevi: Giriş yoksa uyarı ve yönlendirme
    const handleAddToCart = () => {
        const userEmail = typeof window !== "undefined" ? localStorage.getItem("email") : null;
        if (!userEmail) {
            setLoginWarning(true);
            return;
        }
        setLoginWarning(false);

        if (isOverlapping()) {
            alert("Seçtiğiniz tarihler dolu. Lütfen farklı tarihler seçin.");
            return;
        }
        if (!startDate || !endDate) {
            alert("Lütfen geçerli tarih aralığı seçin.");
            return;
        }
        const start = startDate.toISOString();
        const end = endDate.toISOString();
        const total = nights * (house?.pricePerNight || 0);
        router.push(`/reservation-confirmation?houseId=${house.id}&start=${start}&end=${end}&total=${total}`);
    };

    if (!house) {
        return <div>Yükleniyor...</div>;
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-6 text-[#260B01]" style={{ backgroundColor: "#E6DCDC" }}>
            {/* Fotoğraf Galerisi */}
            <div className="relative w-full h-[400px] mb-6 rounded overflow-hidden shadow-lg">
                <img
                    src={house.photos[currentPhoto]}
                    alt={`Fotoğraf ${currentPhoto + 1}`}
                    className="w-full h-full object-cover"
                />
                <button onClick={prevPhoto} className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-white bg-opacity-70 rounded-full p-2 shadow hover:bg-opacity-90">‹</button>
                <button onClick={nextPhoto} className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-white bg-opacity-70 rounded-full p-2 shadow hover:bg-opacity-90">›</button>
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-2">
                    {house.photos.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrentPhoto(i)}
                            className={`w-3 h-3 rounded-full ${i === currentPhoto ? "bg-[#260B01]" : "bg-gray-400"}`}
                        />
                    ))}
                </div>
            </div>

            {/* Ev Bilgileri */}
            <div className="bg-white p-4 rounded shadow mb-6">
                <h2 className="text-2xl font-semibold mb-2">{house.location}</h2>
                <div className="flex items-center gap-4 mb-2">
                    <div className="flex items-center gap-1"><FaBed /> {house.beds} Yatak Odası</div>
                    <div className="flex items-center gap-1"><FaBath /> {house.baths} Banyo</div>
                    <div className="flex items-center gap-1"><FaUserCircle /> {house.capacity || "-"} Kişi</div>
                    <div className="flex items-center gap-1 text-yellow-500">
                        <FaStar /> {typeof house.averageRating === "number" ? house.averageRating.toFixed(1) : house.averageRating || "-"}
                    </div>

                    <div className="flex items-center gap-1">{house.pricePerNight} ₺</div>
                </div>
                <p className="text-sm text-gray-700 mb-2">{house.description}</p>
                <ul className="list-disc pl-5 text-sm text-gray-800">
                    {house.features.map((feature, idx) => <li key={idx}>{feature}</li>)}
                </ul>
            </div>

            {/* Takvim ve Fiyat Hesaplama */}
            <div className="bg-white p-4 rounded shadow mb-6 flex flex-col gap-4">
                <label className="font-semibold">Giriş - Çıkış Tarihleri</label>
                <div className="flex gap-6 rounded border overflow-hidden w-fit">
                    <div>
                        <label className="block text-sm mb-1">Giriş Tarihi</label>
                        <DatePicker
                            selected={startDate}
                            onChange={(date) => {
                                setDateRange([date, endDate]);
                                if (endDate && date > endDate) setDateRange([date, null]);
                            }}
                            selectsStart startDate={startDate} endDate={endDate} minDate={new Date()} dateFormat="dd/MM/yyyy" inline excludeDates={disabledDates}
                        />
                    </div>
                    <div>
                        <label className="block text-sm mb-1">Çıkış Tarihi</label>
                        <DatePicker
                            selected={endDate}
                            onChange={(date) => setDateRange([startDate, date])}
                            selectsEnd startDate={startDate} endDate={endDate} minDate={startDate || new Date()} dateFormat="dd/MM/yyyy" inline excludeDates={disabledDates}
                        />
                    </div>
                </div>
                {startDate && endDate && (
                    <div className="mt-2 text-sm bg-[#f5f5f5] text-[#260B01] px-4 py-2 rounded shadow-sm w-fit">
                        <span className="font-medium">Seçilen Tarihler: </span>
                        {startDate.toLocaleDateString("tr-TR")} - {endDate.toLocaleDateString("tr-TR")}
                    </div>
                )}
                <div className="text-lg font-bold">
                    {nights > 0 ? `${nights} gece – Toplam: ${totalPrice}₺` : "Tarih seçiniz"}
                </div>
                {isOverlapping() && (
                    <p className="text-red-600 font-semibold">
                        Seçilen tarihler doludur. Lütfen başka bir aralık seçin.
                    </p>
                )}
                <button onClick={clearDates} className="text-sm text-red-600 hover:underline self-start mb-6">Tarihleri Temizle</button>
            </div>

            {/* Misafir Seçimi */}
            <div className="bg-white p-4 rounded shadow mb-6">
                <h3 className="text-xl font-semibold mb-4">Misafir Sayısı</h3>
                <div className="mb-4">
                    <label className="block font-medium text-sm">Yetişkin</label>
                    <input type="number" min={1} value={adults} onChange={(e) => { const val = parseInt(e.target.value); if (!isNaN(val) && val > 0) setAdults(val); }} className="border rounded px-3 py-2 w-full" />
                </div>
                <div>
                    <label className="block font-medium text-sm">Çocuk (0-12 yaş)</label>
                    <input type="number" min={0} value={children} onChange={(e) => { const val = parseInt(e.target.value); if (!isNaN(val) && val >= 0) setChildren(val); }} className="border rounded px-3 py-2 w-full" />
                </div>
            </div>
            <button
                onClick={handleAddToCart}
                disabled={!startDate || !endDate || isOverlapping()}
                className={`w-full py-3 font-semibold rounded text-white transition-colors ${!startDate || !endDate || isOverlapping() ? "bg-gray-400 cursor-not-allowed" : "bg-[#260B01] hover:bg-[#3b1902]"}`}
            >
                Rezervasyon Yap
            </button>
            {loginWarning && (
                <div className="text-red-500 text-center mt-2">
                    Rezervasyon yapmak için <b>giriş yapmalısınız!</b>
                </div>
            )}
            {/* Yorumlar */}
            <div className="mt-10 bg-white p-4 rounded shadow">
                <h3 className="text-xl font-semibold mb-4">Yorumlar</h3>
                {commentsLoading ? (
                    <p>Yorumlar yükleniyor...</p>
                ) : comments.length === 0 ? (
                    <p>Bu eve henüz yorum yapılmamış.</p>
                ) : (
                    comments.map(({ userEmail, comment, rating, createdAt }, idx) => (
                        <div key={idx} className="border-b border-gray-300 last:border-none py-4 flex gap-4 items-start">
                            <FaUserCircle className="text-4xl text-gray-500 flex-shrink-0" />
                            <div className="flex-1">
                                <p className="font-semibold">{userEmail}</p>
                                <div className="flex items-center text-yellow-500 mb-1">
                                    {[...Array(5)].map((_, i) => (
                                        <FaStar key={i} className={i < rating ? "fill-current" : "text-gray-300"} />
                                    ))}
                                </div>
                                <p className="text-gray-700">{comment}</p>
                                <div className="text-xs text-gray-400 mt-1">{createdAt && new Date(createdAt).toLocaleDateString("tr-TR")}</div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
