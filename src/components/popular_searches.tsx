export default function PopularSearches() {
  const searches = [
    "Web Developer",
    "Graphic Designer", 
    "Digital Marketer",
    "Data Analyst",
    "Content Writer",
    "UI/UX Designer",
    "Consultant",
    "Photographer",
  ];

  return (
    <section className="w-full py-8 sm:py-12 bg-gray-50">
      <div className="w-full max-w-full  px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">
          Popular Searches
        </h2>
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
          {searches.map((item, i) => (
            <button
              key={i}
              className="px-3 sm:px-4 py-2 bg-white rounded-full shadow hover:bg-blue-50 text-gray-700 border border-gray-200 text-sm sm:text-base transition-colors"
            >
              {item}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
