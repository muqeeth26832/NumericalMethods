import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Label,
} from "recharts";

type WeightVsRootsProps = {
  dataGaussLegendre?: { root: number; weight: number }[];
  dataSymbolicLegendre?: { root: number; weight: number }[];
  method: string;
};

const WeightVsRoots = ({
  dataGaussLegendre,
  dataSymbolicLegendre,
  method,
}: WeightVsRootsProps) => {
  // Determine the number of charts to display
  const chartsToShow = (dataGaussLegendre ? 1 : 0) + (dataSymbolicLegendre ? 1 : 0);

  return (
    <div className="flex space-x-4">
      {/* Gauss-Legendre Chart */}
      {dataGaussLegendre && (
        <div className={chartsToShow === 1 ? "w-full h-[20rem]" : "w-1/2 h-[20rem]"}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dataGaussLegendre}>
              <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
              <XAxis
                dataKey="root"
                tickFormatter={(value) => value.toFixed(2)}
              >
                <Label value="Roots (Nodes)" offset={-5} position="insideBottom" />
              </XAxis>
              <YAxis>
                <Label value="Weights" angle={-90} position="insideLeft" offset={-5} />
              </YAxis>
              <Tooltip />
              {/* Gauss-Legendre Weights in blue */}
              <Line
                dataKey="weight"
                name="Gauss-Legendre Weights"
                stroke="#0000FF"
                dot={false}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer> </div>
      )}

      {/* Symbolic Legendre Chart */}
      {dataSymbolicLegendre && (
        <div className={chartsToShow === 1 ? "w-full h-[20rem]" : "w-1/2 h-[20rem]"}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dataSymbolicLegendre}>
              <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
              <XAxis
                dataKey="root"
                tickFormatter={(value) => value.toFixed(2)}
              >
                <Label value="Roots (Nodes)" offset={-5} position="insideBottom" />
              </XAxis>
              <YAxis>
                <Label value="Weights" angle={-90} position="insideLeft" offset={-5} />
              </YAxis>
              <Tooltip />
              {/* Symbolic Legendre Weights in green */}
              <Line
                dataKey="weight"
                name="Symbolic Legendre Weights"
                stroke="#008000"
                dot={false}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default WeightVsRoots;
