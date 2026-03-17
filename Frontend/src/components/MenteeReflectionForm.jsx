import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getMenteeMentors, submitMenteeForm } from "../api/forms";

function MenteeReflectionForm() {
    const { user } = useAuth();
    const [successMessage, setSuccessMessage] = useState("");

    const [form, setForm] = useState({
        topicCovered: "",
        learningsFromMentor: "",
        confidenceRating: 3,
        appliedPracticed: "No",
        practiceExample: "",
        difficultiesEncountered: "",
        needsBetterExplanation: "",
        starsRating: 3
    });
    const [mentors, setMentors] = useState([]);
    const [mentorId, setMentorId] = useState("");

    useEffect(() => {
        const fetchMentors = async () => {
            try {
                const res = await getMenteeMentors();

                const mentorList = res.data?.mentors || [];
                
                setMentors(mentorList);
                if (mentorList.length > 0) {
                    setMentorId(mentorList[0]._id);
                }
            } catch (error) {
                console.log("Failed to fetch mentors:", error.response?.data || error.message);
            }
        };

        fetchMentors();
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
            mentorId
        };
        console.log("Payload:", payload);

        try {
            await submitMenteeForm(payload);

            setSuccessMessage("Reflection submitted successfully");

            setForm(initialFormState);

            if (mentors.length > 0) {
                setMentorId(mentors[0]._id);
            }

            // auto-hide after 3 sec
            timeoutRef.current = setTimeout(() => {
                setSuccessMessage("");
            }, 3000);

        } catch (err) {
            console.log("Server error:", err.response?.data);
        }
    };

    return (
        <div className="w-full max-w-3xl">
            {successMessage && (
                <div className="bg-green-100 text-green-700 px-4 py-2 rounded-lg text-center">
                    {successMessage}
                </div>
            )}

            <form
                onSubmit={submitHandler}
                className="bg-white rounded-2xl shadow-xl p-6 md:p-8 space-y-6 w-full"
            >

                <h2 className="text-2xl font-semibold text-gray-800 text-center">
                    Daily Reflection
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

                    {/* Topic Covered */}
                    <div className="flex flex-col gap-1 md:col-span-2">
                        <label className="font-medium text-gray-700">
                            Select Mentor
                        </label>

                        <select
                            name="mentorId"
                            value={mentorId}
                            onChange={(e) => setMentorId(e.target.value)}
                            className="w-full border rounded-lg px-3 py-2"
                            required
                        >
                            {mentors.length === 0 ? (
                                <option value="">No mentors available</option>
                            ) : (
                                mentors.map((mentor) => (
                                    <option key={mentor._id} value={mentor._id}>
                                        {mentor.name} ({mentor.email})
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
                            What did you learn from mentor?
                        </label>

                        <textarea
                            name="learningsFromMentor"
                            value={form.learningsFromMentor}
                            onChange={handleChange}
                            rows="3"
                            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-400"
                            required
                        />
                    </div>

                    {/* Confidence */}
                    <div className="flex flex-col gap-1">
                        <label className="font-medium text-gray-700">
                            Confidence Rating
                        </label>

                        <input
                            type="number"
                            min="1"
                            max="5"
                            name="confidenceRating"
                            value={form.confidenceRating}
                            onChange={handleChange}
                            className="w-full border rounded-lg px-3 py-2"
                        />
                    </div>

                    {/* Practice */}
                    <div className="flex flex-col gap-1">
                        <label className="font-medium text-gray-700">
                            Did you practice?
                        </label>

                        <select
                            name="appliedPracticed"
                            value={form.appliedPracticed}
                            onChange={handleChange}
                            className="w-full border rounded-lg px-3 py-2"
                        >
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                        </select>
                    </div>

                    {/* Practice Example */}
                    {form.appliedPracticed === "Yes" && (
                        <div className="flex flex-col gap-1 md:col-span-2">
                            <label className="font-medium text-gray-700">
                                Practice Example
                            </label>

                            <textarea
                                name="practiceExample"
                                value={form.practiceExample}
                                onChange={handleChange}
                                rows="2"
                                className="w-full border rounded-lg px-3 py-2"
                            />
                        </div>
                    )}

                    {/* Difficulties */}
                    <div className="flex flex-col gap-1 md:col-span-2">
                        <label className="font-medium text-gray-700">
                            Difficulties you faced
                        </label>

                        <textarea
                            name="difficultiesEncountered"
                            value={form.difficultiesEncountered}
                            onChange={handleChange}
                            rows="3"
                            className="w-full border rounded-lg px-3 py-2"
                            required
                        />
                    </div>

                    {/* Better Explanation */}
                    <div className="flex flex-col gap-1">
                        <label className="font-medium text-gray-700">
                            Needs better explanation
                        </label>

                        <textarea
                            name="needsBetterExplanation"
                            value={form.needsBetterExplanation}
                            onChange={handleChange}
                            rows="2"
                            className="w-full border rounded-lg px-3 py-2"
                            required
                        />
                    </div>

                    {/* Stars */}
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
                    disabled={mentors.length === 0}
                    className="w-full py-3 rounded-lg font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:opacity-90 transition"
                >
                    Submit Reflection
                </button>

            </form>
        </div>
    );
}

export default MenteeReflectionForm;