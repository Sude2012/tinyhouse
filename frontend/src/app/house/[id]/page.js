import { useRouter } from "next/router";

const houses = [
  // aynı ev verisi burada da olabilir ya da dışarıdan import edilir
  // ... yukarıdaki houses dizisi
];

const HouseDetail = () => {
  const router = useRouter();
  const { id } = router.query;

  const house = houses.find((h) => h.id === parseInt(id));

  if (!house) {
    return <div>Ev bulunamadı.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">{house.location}</h1>
      <img
        src={house.image}
        alt={house.location}
        className="w-full h-64 object-cover rounded"
      />
      <div className="mt-4 text-[#260B01]">
        <p>
          <strong>Yatak:</strong> {house.beds}
        </p>
        <p>
          <strong>Banyo:</strong> {house.baths}
        </p>
        <p>
          <strong>Fiyat:</strong> ₺{house.price} / gece
        </p>
        <p>
          <strong>Değerlendirme:</strong> {house.rating} ⭐
        </p>
      </div>
      {/* Detay sayfasını istediğin gibi geliştirebiliriz */}
    </div>
  );
};

export default HouseDetail;
