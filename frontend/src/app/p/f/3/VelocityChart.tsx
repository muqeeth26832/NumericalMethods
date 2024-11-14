import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface VelocityDataPoint {
  y: number;
  u: number;
}

interface VelocityChartProps {
  velocityData: VelocityDataPoint[];
  animation: boolean;
}

const VelocityChart: React.FC<VelocityChartProps> = ({
  velocityData,
  animation,
}) => {
  if (velocityData.length === 0) {
    return (
      <div className="w-full h-96 mb-8 text-center text-white">
        {/* Message when data is empty */}
        <p>No velocity data available. Please adjust the pressure gradient.</p>
      </div>
    );
  }

  // Format data to 2 decimal places
  const formattedData = velocityData.map((point) => ({
    y: point.y !== undefined ? parseFloat(point.y.toFixed(2)) : 0, // Handle undefined for 'y'
    u: point.u !== undefined ? parseFloat(point.u.toFixed(2)) : 0, // Handle undefined for 'u'
  }));

  return (
    <div className="w-full h-96 mb-8 bg-gray-800 p-4 rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold text-white mb-4">
        Velocity Profile
      </h2>
      <div className="text-white mb-2">
        <span className="font-bold">X-Axis:</span> Position (y)
        <br />
        <span className="font-bold">Y-Axis:</span> Velocity (u)
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={formattedData}
          margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#444" />
          <XAxis dataKey="y" stroke="#ffffff" />
          <YAxis stroke="#ffffff" />
          <Tooltip
            contentStyle={{ backgroundColor: "#333", borderColor: "#555" }}
            labelStyle={{ color: "#fff" }}
            itemStyle={{ color: "#fff" }}
          />
          <Legend wrapperStyle={{ color: "#ffffff" }} />
          <Line
            type="monotone"
            dataKey="u"
            stroke="#82ca9d"
            dot={animation}
            activeDot={{ r: 6 }}
            isAnimationActive={animation}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default VelocityChart;
