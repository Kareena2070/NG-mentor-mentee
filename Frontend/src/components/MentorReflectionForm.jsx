import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getMentorMentees, submitMentorForm } from "../api/forms";

function MentorReflectionForm() {
  const { user } = useAuth();

  const [form, setForm] = useState({
    topicCovered: "",
    learningsFromMentee: "",
    menteeUnderstandingRating: 3,
    progressComparison: "Same",
    challengesNoticed: "",
    feedbackForMentee: "",
    starsRating: 3
  });
  const [mentees, setMentees] = useState([]);
  const [menteeId, setMenteeId] = useState("");

  useEffect(() => {
    const fetchMentees = async () => {
      try {
        const res = await getMentorMentees();
        const menteeList = res.data?.mentees || [];
        setMentees(menteeList);
        if (menteeList.length > 0) {
          setMenteeId(menteeList[0]._id);
        }
      } catch (error) {
        console.log("Failed to fetch mentees:", error.response?.data || error.message);
      }
    };

    fetchMentees();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    const payload = {
      ...form,
      mentor: user.id,
      menteeId
    };

    try {
      await submitMentorForm(payload);
      alert("Feedback submitted successfully");
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="w-full max-w-3xl">

      <form
        onSubmit={submitHandler}
        className="bg-white rounded-2xl shadow-xl p-6 md:p-8 space-y-6 w-full"
      >

        <h2 className="text-2xl font-semibold text-gray-800 text-center">
          Mentor Feedback
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

          <div className="flex flex-col gap-1 md:col-span-2">
            <label className="font-medium text-gray-700">
              Select Mentee
            </label>

            <select
              name="menteeId"
              value={menteeId}
              onChange={(e) => setMenteeId(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
              required
            >
              {mentees.length === 0 ? (
                <option value="">No mentees available</option>
              ) : (
                mentees.map((mentee) => (
                  <option key={mentee._id} value={mentee._id}>
                    {mentee.name} ({mentee.email})
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Topic Covered */}
          <div className="flex flex-col gap-1 md:col-span-2">
            <label className="font-medium text-gray-700">
              Topic Covered
            </label>

            <input
              type="text"
              name="topicCovered"
              value={form.topicCovered}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-400"
              required
            />
          </div>

          {/* Learnings */}
          <div className="flex flex-col gap-1 md:col-span-2">
            <label className="font-medium text-gray-700">
              What did you learn from mentee?
            </label>

            <textarea
              name="learningsFromMentee"
              value={form.learningsFromMentee}
              onChange={handleChange}
              rows="3"
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-400"
              required
            />
          </div>

          {/* Understanding Rating */}
          <div className="flex flex-col gap-1">
            <label className="font-medium text-gray-700">
              Mentee Understanding Rating
            </label>

            <input
              type="number"
              min="1"
              max="5"
              name="menteeUnderstandingRating"
              value={form.menteeUnderstandingRating}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          {/* Progress Comparison */}
          <div className="flex flex-col gap-1">
            <label className="font-medium text-gray-700">
              Progress Compared to Last Session
            </label>

            <select
              name="progressComparison"
              value={form.progressComparison}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="Improved">Improved</option>
              <option value="Same">Same</option>
              <option value="Needs Attention">Needs Attention</option>
            </select>
          </div>

          {/* Challenges */}
          <div className="flex flex-col gap-1 md:col-span-2">
            <label className="font-medium text-gray-700">
              Challenges noticed
            </label>

            <textarea
              name="challengesNoticed"
              value={form.challengesNoticed}
              onChange={handleChange}
              rows="3"
              className="w-full border rounded-lg px-3 py-2"
              required
            />
          </div>

          {/* Feedback */}
          <div className="flex flex-col gap-1 md:col-span-2">
            <label className="font-medium text-gray-700">
              Feedback for mentee
            </label>

            <textarea
              name="feedbackForMentee"
              value={form.feedbackForMentee}
              onChange={handleChange}
              rows="2"
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          {/* Session Rating */}
          <div className="flex flex-col gap-1">
            <label className="font-medium text-gray-700">
              Session Rating
            </label>

            <input
              type="number"
              min="1"
              max="5"
              name="starsRating"
              value={form.starsRating}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

        </div>

        {/* Submit */}
        <button
          disabled={mentees.length === 0}
          className="w-full py-3 rounded-lg font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:opacity-90 transition"
        >
          Submit Mentor Feedback
        </button>

      </form>

    </div>
  );
}

export default MentorReflectionForm;