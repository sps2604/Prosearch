export default function Stats() {
  const data = [
    { number: "10K+", label: "Professionals" },
    { number: "5K+", label: "Jobs Posted" },
    { number: "1K+", label: "Companies" },
  ];

  return (
    <section className="w-full py-8 sm:py-12 bg-white">
      <div className="w-full max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 text-center gap-6 sm:gap-8">
          {data.map((item, i) => (
            <div key={i} className="p-4 sm:p-6">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-600">{item.number}</h2>
              <p className="text-gray-600 text-sm sm:text-base mt-1">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
