"use client";

import { Area, AreaChart, ResponsiveContainer } from "recharts";

type Sales = {
  name: string;
  prod1: number;
  prod2: number;
};

const productSales: Sales[] = [
  { name: "jan", prod1: 100, prod2: 200 },
  { name: "feb", prod1: 200, prod2: 300 },
  { name: "mar", prod1: 300, prod2: 400 },
  { name: "apr", prod1: 400, prod2: 500 },
  { name: "may", prod1: 500, prod2: 600 },
];

const AreaChartComponent = () => {
  return (
    <div>
      {/* <ResponsiveContainer width="100%" height="100%"> */}
        <AreaChart width={500} height={400} data={productSales}>
          <Area dataKey="prod1" />
        </AreaChart>
      {/* </ResponsiveContainer> */}
    </div>
  );
};

export default AreaChartComponent;
