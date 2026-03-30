import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

const ProgressChart = ({ data }) => {
    if (!data || data.length === 0) {
        return (
            <div className="bg-white p-4 rounded-xl shadow-sm">
                <p className="text-sm text-gray-500">No data available</p>
            </div>
        );
    }

    return (
        <div className="bg-white p-4 rounded-xl shadow-sm">
            <h2 className="text-sm font-semibold mb-3">Learning Progress</h2>

            <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                        <XAxis dataKey="date" />
                        <YAxis domain={[0, 5]} />
                        <Tooltip />

                        <Line
                            type="monotone"
                            dataKey="confidence"
                            stroke="#6366f1"
                            strokeWidth={2}
                        />

                        <Line
                            type="monotone"
                            dataKey="understanding"
                            stroke="#10b981"
                            strokeWidth={2}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default ProgressChart;