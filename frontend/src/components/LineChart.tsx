"use client";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";

// Type definition for the solution data structure
type LineChartData = {
  x: number[];
  explicit_euler: number[];
  implicit_euler: number[];
  finite_difference: number[];
  analytical_solution: number[];
};

// Props for the LineChartComponent
interface LineChartComponentProps {
  width: number;
  height: number;
  data: LineChartData; // Data expected in a transformed format
  x_name: string; // Name for the x-axis
}

const LineChartComponent = ({
  width,
  height,
  data,
  x_name,
}: LineChartComponentProps) => {
  // Round the data to two decimal places
  const roundedData = data.x.map((xValue, index) => ({
    x: parseFloat(xValue.toFixed(2)),
    explicit_euler: parseFloat(data.explicit_euler[index].toFixed(2)),
    implicit_euler: parseFloat(data.implicit_euler[index].toFixed(2)),
    finite_difference: parseFloat(data.finite_difference[index].toFixed(2)),
    analytical_solution: parseFloat(data.analytical_solution[index].toFixed(2)),
  }));

  const colors = ["#FF5733", "#33FF57", "#3357FF", "#F39C12", "#9B59B6"];

  return (
    <ResponsiveContainer width={width} height={height}>
      <LineChart
        data={roundedData}
        margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="x"
          name={x_name}
          label={{ value: x_name, position: "insideBottomRight" }}
        />
        <YAxis />
        <Legend />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="explicit_euler"
          stroke={colors[0]}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="implicit_euler"
          stroke={colors[1]}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="finite_difference"
          stroke={colors[2]}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="analytical_solution"
          stroke={colors[3]}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default LineChartComponent;


