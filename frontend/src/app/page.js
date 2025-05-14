export default function SehirPage({ params }) {
  const { sehir } = params;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Şehir: {decodeURIComponent(sehir)}</h1>
      <p>Bu şehir için listelenecek Tiny House ilanları burada yer alacak.</p>
    </div>
  );
}
