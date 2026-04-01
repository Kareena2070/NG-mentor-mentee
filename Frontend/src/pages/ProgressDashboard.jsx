import { useEffect, useState } from "react";
import axios from "axios";
import ProgressChart from "../components/ProgressChart.jsx";
import { useAuth } from "../context/AuthContext";
import SessionImg from "../assets/session.png";
import ConfidenceImg from "../assets/confidence.png";
import UnderstandingImg from "../assets/understanding.png";
import PracticeImg from "../assets/pratical.png";


const ProgressDashboard = () => {

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [graphData, setGraphData] = useState([]);
    const { user } = useAuth();


    useEffect(() => {
        if (!user) return; // wait for auth

        const fetchDashboard = async () => {
            try {
                const res = await axios.get(
                    "http://localhost:5000/api/progress/dashboard",
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                    }
                );

                setData(res.data.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboard();
    }, [user]); // add dependency

    useEffect(() => {
        if (!user?._id) return; //important guard

        const fetchGraph = async () => {
            try {
                const res = await axios.get(
                    `http://localhost:5000/api/progress/comparison/${user._id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                    }
                );

                const menteeData = res.data.data.menteeAssessment.data;
                const mentorData = res.data.data.mentorEvaluation.data;

                console.log("MENTEE DATA:", menteeData);
                console.log("MENTOR DATA:", mentorData);

                const formatted = menteeData.map((item, index) => ({
                    date: item.sessionDate ? item.sessionDate.split("T")[0] : "N/A",
                    confidence: item.confidenceRating,
                    understanding: mentorData[index]?.menteeUnderstandingRating || 0,
                }));

                setGraphData(formatted);

            } catch (err) {
                console.error(err);
            }
        };

        fetchGraph();
    }, [user]); // dependency added

    if (loading) {
        return <div className="p-4">Loading...</div>;
    }

    return (
        <div className="min-h-[90vh] bg-gray-50">

            {/* TOP GRADIENT SECTION */}
            <div className="bg-gradient-to-r from-purple-500 to-indigo-400 text-white py-10">

                <div className="max-w-6xl mx-auto px-2 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold">
                        Progress Report
                    </h1>
                    <p className="text-indigo-100 mt-2 text-1xl md:text-2xl">
                        Track your learning journey 
                    </p>

                    {/* Time Filter */}
                    <div className="flex justify-center gap-3 mt-6 flex-wrap">
                        {["7", "30", "90"].map((day) => (
                            <button
                                key={day}
                                className="px-4 py-1.5 text-sm rounded-full bg-white text-indigo-600 font-medium shadow hover:bg-gray-100 transition"
                            >
                                {day} days
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* MAIN CONTENT */}
            <div className="max-w-6xl mx-auto px-4 -mt-6 pb-10">

                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mt-10">

                    {/* Sessions */}
                    <div className="bg-white p-4 rounded-xl shadow-md flex items-center gap-3 hover:shadow-lg transition">
                        <div className="bg-blue-100 p-2 rounded-lg text-xl">
                            <img src={SessionImg} alt="Sessions" className="w-15 h-15 object-contain" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Sessions</p>
                            <p className="text-lg font-bold text-gray-800">
                                {data?.totalSessions}
                            </p>
                        </div>
                    </div>

                    {/* Confidence */}
                    <div className="bg-white p-4 rounded-xl shadow-md flex items-center gap-3 hover:shadow-lg transition">
                        <div className="bg-green-100 p-2 rounded-lg text-xl">
                            <img src={ConfidenceImg} alt="Confidence" className="w-15 h-15 object-contain" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Confidence</p>
                            <p className="text-lg font-bold text-gray-800">
                                {data?.avgConfidence?.toFixed(1)}
                            </p>
                        </div>
                    </div>

                    {/* Understanding */}
                    <div className="bg-white p-4 rounded-xl shadow-md flex items-center gap-3 hover:shadow-lg transition">
                        <div className="bg-purple-100 p-2 rounded-lg text-xl">
                            <img src={UnderstandingImg} alt="Understanding" className="w-15 h-15 object-contain" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Understanding</p>
                            <p className="text-lg font-bold text-gray-800">
                                {data?.avgMenteeUnderstanding?.toFixed(1)}
                            </p>
                        </div>
                    </div>

                    {/* Practice Rate */}
                    <div className="bg-white p-4 rounded-xl shadow-md flex items-center gap-3 hover:shadow-lg transition">
                        <div className="bg-orange-100 p-2 rounded-lg text-xl">
                            <img src={PracticeImg} alt="Practice Rate" className="w-15 h-15 object-contain" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Practice Rate</p>
                            <p className="text-lg font-bold text-gray-800">
                                {data?.practiceRate}%
                            </p>
                        </div>
                    </div>

                </div>

                {/* Chart Section */}
                <div className="bg-white mt-6 p-5 rounded-2xl shadow-md">
                    <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-3">
                        Progress Overview
                    </h2>

                    <ProgressChart data={graphData} />
                </div>

            </div>
        </div>
    );
};

export default ProgressDashboard;