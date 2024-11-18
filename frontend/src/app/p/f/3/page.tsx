"use client";
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, ArrowRight, Copy, RefreshCw } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const METHODS = {
  explicit_euler: { name: "Explicit Euler", color: "#4f46e5" },
  implicit_euler: { name: "Implicit Euler", color: "#7c3aed" },
  finite_difference: { name: "Finite Differences", color: "#6366f1" }
};

export default function CouettePoiseuillePage() {
  const [PValues, setPValues] = useState<number[]>([2]);
  const [N, setN] = useState(100);
  const [method, setMethod] = useState<"explicit_euler" | "implicit_euler" | "finite_difference">("explicit_euler");
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("visualization");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post("http://localhost:8000/api/v1/ivpbvp/compute_solutions", {
        P_values: PValues,
        N: N,
        method: method,
      });

      const solutions = response.data.solutions;
      if (!solutions || !Array.isArray(solutions)) {
        throw new Error("Invalid data structure from API");
      }

      const transformedData = solutions.flatMap((solution: any) => {
        return solution.map((item: any) => ({
          y: item.y,
          P: item.p_value,
          explicit_euler: item.explicit_euler,
          implicit_euler: item.implicit_euler,
          finite_difference: item.finite_difference,
          analytical: item.analytical_solution,
        }));
      });

      setData(transformedData);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to fetch data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [PValues, N, method]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCopy = () => {
    const jsonData = JSON.stringify(data, null, 2);
    navigator.clipboard.writeText(jsonData)
      .then(() => alert("Data copied to clipboard!"));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8">
      <div className="container mx-auto px-4 max-w-7xl space-y-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Couette-Poiseuille Flow Analysis</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Interactive visualization and analysis of Couette-Poiseuille flow using different numerical methods
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
            <TabsTrigger value="visualization">Visualization</TabsTrigger>
            <TabsTrigger value="comparison">Method Comparison</TabsTrigger>
          </TabsList>

          <TabsContent value="visualization" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ArrowRight className="h-5 w-5 text-blue-500" />
                    Flow Visualization
                  </CardTitle>
                  <CardDescription>Real-time visualization of flow characteristics</CardDescription>
                </CardHeader>
                <CardContent className="relative h-[500px]">
                  {loading ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-50/50">
                      <div className="text-center">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Computing solution...</p>
                      </div>
                    </div>
                  ) : error ? (
                    <Alert variant="destructive">
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={data}
                        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis
                          dataKey="y"
                          type="number"
                          domain={[0, 1]}
                          label={{ value: "Position (y)", position: "bottom" }}
                          tick={{ fill: "#6B7280" }}
                        />
                        <YAxis 
                          label={{ value: "Velocity (u)", angle: -90, position: "insideLeft" }}
                          tick={{ fill: "#6B7280" }}
                        />
                        <Tooltip 
                          contentStyle={{ backgroundColor: "white", borderRadius: "8px", border: "1px solid #E5E7EB" }}
                        />
                        <Legend verticalAlign="top" height={36} />
                        {Object.entries(METHODS).map(([key, value]) => (
                          <Line
                            key={key}
                            type="monotone"
                            dataKey={key}
                            stroke={value.color}
                            name={value.name}
                            dot={false}
                            strokeWidth={2}
                          />
                        ))}
                        <Line
                          type="monotone"
                          dataKey="analytical"
                          stroke="#059669"
                          name="Analytical Solution"
                          dot={false}
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                  <div className="absolute top-2 right-2 space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCopy}
                      disabled={loading || !!error}
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      Copy Data
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={fetchData}
                      disabled={loading}
                    >
                      <RefreshCw className="h-4 w-4 mr-1" />
                      Refresh
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ArrowRight className="h-5 w-5 text-blue-500" />
                    Parameters
                  </CardTitle>
                  <CardDescription>Adjust flow parameters and numerical method</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <Label className="text-sm font-semibold">Pressure Gradient (P)</Label>
                    <div className="flex items-center space-x-4">
                      <Slider
                        min={-4}
                        max={10}
                        step={0.1}
                        value={[PValues[0]]}
                        onValueChange={(value) => setPValues(value)}
                        className="flex-grow"
                      />
                      <Input
                        type="number"
                        value={PValues[0]}
                        onChange={(e) => setPValues([Number(e.target.value)])}
                        className="w-24"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-sm font-semibold">Grid Points (N)</Label>
                    <Input
                      type="number"
                      value={N}
                      onChange={(e) => setN(Number(e.target.value))}
                      min={10}
                      max={1000}
                    />
                  </div>

                  <div className="space-y-4">
                    <Label className="text-sm font-semibold">Numerical Method</Label>
                    <Select
                      value={method}
                      onValueChange={(value) => setMethod(value as any)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a method" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(METHODS).map(([key, value]) => (
                          <SelectItem key={key} value={key}>
                            {value.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button 
                    className="w-full"
                    onClick={fetchData} 
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Computing...
                      </>
                    ) : (
                      "Update Visualization"
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="comparison" className="space-y-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Numerical Methods Comparison</CardTitle>
                <CardDescription>
                  All three numerical methods plotted against the analytical solution
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[600px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={data}
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis
                      dataKey="y"
                      type="number"
                      domain={[0, 1]}
                      label={{ value: "Position (y)", position: "bottom" }}
                    />
                    <YAxis label={{ value: "Velocity (u)", angle: -90, position: "insideLeft" }} />
                    <Tooltip />
                    <Legend verticalAlign="top" height={36} />
                    {Object.entries(METHODS).map(([key, value]) => (
                      <Line
                        key={key}
                        type="monotone"
                        dataKey={key}
                        stroke={value.color}
                        name={value.name}
                        dot={false}
                        strokeWidth={2}
                      />
                    ))}
                    <Line
                      type="monotone"
                      dataKey="analytical"
                      stroke="#059669"
                      name="Analytical Solution"
                      dot={false}
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

