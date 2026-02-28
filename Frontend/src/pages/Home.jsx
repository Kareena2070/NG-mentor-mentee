import reflectionImg from "../assets/reflection.png";
import feedbackImg from "../assets/feedback.png";
import growthImg from "../assets/growth.png";

function Home() {
  const explinList = [
    {
      icone: reflectionImg,
      title: "Daily Reflection",
      description:
        "Log what you learned each day to improve retention and track your growth journey",
    },
    {
      icone: feedbackImg,
      title: "Mutual Feedback",
      description:
        "Give and receive feedback to build confidence and accountability in your learning.",
    },
    {
      icone: growthImg,
      title: "Visual Growth",
      description:
        "See your progress with charts, levels, and streaks that make learning motivating.",
    },
  ];

  return (
    <div className="min-h-[90vh] flex flex-col bg-[#f7f8fa] font-sans">
      {/* Header Section */}
      <div className="flex-1 flex flex-col justify-center items-center text-center px-5 py-8 bg-gradient-to-r from-[#6a82fb] to-[#744ca5] text-white">
        <h1 className="lg:text-6xl md:text-5xl sm:text-4xl text-2xl font-bold mb-4 break-words">
          Welcome to NavGurukul
        </h1>

        <p className="text-lg md:text-base sm:text-sm max-w-[600px] my-2 leading-relaxed">
          Mentor-Mentee Progress Tracker
        </p>

        <p className="text-lg md:text-base sm:text-sm max-w-[600px] my-2 leading-relaxed">
          Track your learning journey, measure growth, and celebrate progress
          together. Built for pair programming excellence at NavGurukul.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <button className="px-6 py-3 text-base sm:text-sm font-semibold rounded-lg bg-white text-[#9c69da] hover:-translate-y-1 transition">
            Add Today's Learning
          </button>

          <button className="px-6 py-3 text-base sm:text-sm font-semibold rounded-lg border-2 border-white bg-transparent text-white hover:-translate-y-1 transition">
            View Progress
          </button>
        </div>
      </div>

      {/* Cards Section */}
      <div className="flex justify-center items-center flex-wrap gap-4 p-8  ">
        {explinList.map((explain, id) => (
          <div
            key={id}
            className="bg-white rounded-lg p-5 w-full max-w-[400px] md:max-w-[320px] sm:max-w-full flex flex-col items-center text-center shadow-md hover:shadow-xl hover:-translate-y-1 transition"
          >
            <img
              src={explain.icone}
              alt={explain.title}
              className="w-[220px] h-[220px] sm:w-[150px] sm:h-[150px] object-cover rounded-full mb-3"
            />

            <h2 className="text-2xl sm:text-xl text-gray-800 mb-2 break-words">
              {explain.title}
            </h2>

            <p className="text-sm sm:text-xs text-gray-600 leading-snug">
              {explain.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;
