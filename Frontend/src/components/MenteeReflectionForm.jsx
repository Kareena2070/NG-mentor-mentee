import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { submitMenteeForm } from "../api/forms";

function MenteeReflectionForm() {
    const { user } = useAuth();

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
            mentee: user._id,
            mentor: user.mentor
        };

        try {
            await submitMenteeForm(payload);
            alert("Reflection submitted successfully");
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
                    Daily Reflection
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

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
                    className="w-full py-3 rounded-lg font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:opacity-90 transition"
                >
                    Submit Reflection
                </button>

            </form>
        </div>
    );
}

export default MenteeReflectionForm;