import { useEffect, useState } from "react";
import axios from "axios";
import ProgressChart from "../components/ProgressChart.jsx";
import { useAuth } from "../context/AuthContext";


const ProgressDashboard = () => {

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [graphData, setGraphData] = useState([]);
    const { user } = useAuth();


    useEffect(() => {
        if (!user) return; // ✅ wait for auth

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
    }, [user]); // ✅ add dependency

    useEffect(() => {
        if (!user?._id) return; // ✅ important guard

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
    }, [user]); // ✅ dependency added

    if (loading) {
        return <div className="p-4">Loading...</div>;
    }
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto px-4 py-4">

                {/* Header */}
                <div className="mb-4">
                    <h1 className="text-xl md:text-2xl font-semibold">Progress Report</h1>
                    <p className="text-sm text-gray-500">Track your learning journey</p>
                </div>

                {/* Time Filter */}
                <div className="px-4 py-3 flex gap-2 overflow-x-auto">
                    {["7", "30", "90"].map((day) => (
                        <button
                            key={day}
                            className="px-3 py-1 text-sm bg-white border rounded-full shadow-sm"
                        >
                            {day} days
                        </button>
                    ))}
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto px-4 space-y-4 pb-6">

                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white p-3 rounded-xl shadow-sm">
                            <p className="text-xs text-gray-500">Sessions</p>
                            <p className="text-lg font-semibold">{data?.totalSessions}</p>
                        </div>

                        <div className="bg-white p-3 rounded-xl shadow-sm">
                            <p className="text-xs text-gray-500">Confidence</p>
                            <p className="text-lg font-semibold">
                                {data?.avgConfidence?.toFixed(1)}
                            </p>
                        </div>

                        <div className="bg-white p-3 rounded-xl shadow-sm">
                            <p className="text-xs text-gray-500">Understanding</p>
                            <p className="text-lg font-semibold">
                                {data?.avgMenteeUnderstanding?.toFixed(1)}
                            </p>
                        </div>

                        <div className="bg-white p-3 rounded-xl shadow-sm">
                            <p className="text-xs text-gray-500">Practice Rate</p>
                            <p className="text-lg font-semibold">
                                {data?.practiceRate}%
                            </p>
                        </div>
                    </div>

                    {/* Placeholder Section */}
                    <div className="bg-white p-4 rounded-xl shadow-sm">
                        <ProgressChart data={graphData} />
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ProgressDashboard;