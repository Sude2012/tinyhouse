import Image from "next/image"; // Doğru import

export default function ManageListings() {
  const listings = [
    {
      id: 1,
      title: "Modern Tiny House",
      description: "Şehir merkezine çok yakın, modern bir tiny house.",
      price: "1500 TL / Gece",
      image: "/tinyhouse3.jpeg",
    },
    {
      id: 2,
      title: "Kır Evi",
      description: "Doğayla iç içe, huzurlu bir kır evi.",
      price: "2000 TL / Gece",
      image: "/tinyhouse2.webp",
    },
    {
      id: 3,
      title: "Deniz Kenarı Villa",
      description: "Okyanus manzaralı lüks villa.",
      price: "5000 TL / Gece",
      image: "/TinyHouse.jpeg",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {listings.map((listing) => (
        <div
          key={listing.id}
          className="bg-white rounded-lg shadow-md overflow-hidden"
        >
          <Image
            src={listing.image}
            alt={listing.title}
            width={300}
            height={200}
            className="w-full h-48 object-cover"
          />
          <div className="p-4">
            <h3 className="text-xl font-semibold">{listing.title}</h3>
            <p className="text-gray-600 mt-2">{listing.description}</p>
            <p className="text-lg font-bold text-blue-600 mt-4">
              {listing.price}
            </p>
            <button className="w-full mt-4 py-2 bg-black text-white rounded hover:bg-[#CDBEAF]">
              Düzenle
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
