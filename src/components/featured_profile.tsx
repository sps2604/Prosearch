export default function FeaturedProfiles() {
  const profiles = [
    {
      name: "Aarav Sharma",
      role: "Full Stack Developer", 
      image: "https://randomuser.me/api/portraits/men/75.jpg",
    },
    {
      name: "Priya Mehta",
      role: "UI/UX Designer",
      image: "https://randomuser.me/api/portraits/women/65.jpg",
    },
    {
      name: "Rahul Verma",
      role: "Digital Marketer",
      image: "https://randomuser.me/api/portraits/men/45.jpg",
    },
  ];

  return (
    <section className="w-full py-12 sm:py-16 bg-gray-50">
      <div className="w-full max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-10">
          Featured Profiles
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
          {profiles.map((profile, index) => (
            <div
              key={index}
              className="bg-white shadow-md rounded-2xl p-4 sm:p-6 text-center hover:shadow-lg transition"
            >
              <img
                src={profile.image}
                alt={profile.name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full mx-auto mb-3 sm:mb-4 object-cover"
              />
              <h3 className="text-lg sm:text-xl font-semibold">{profile.name}</h3>
              <p className="text-gray-600 text-sm sm:text-base">{profile.role}</p>
              <button className="mt-3 sm:mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-sm sm:text-base transition-colors">
                View Profile
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
