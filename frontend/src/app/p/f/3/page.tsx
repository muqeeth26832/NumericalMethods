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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

export default function CouettePoiseuillePage() {
  const [PValues, setPValues] = useState<number[]>([2]);
  const [N, setN] = useState(100);
  const [method, setMethod] = useState<
    "explicit_euler" | "implicit_euler" | "finite_difference"
  >("explicit_euler");
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(
        "http://localhost:8000/api/v1/ivpbvp/compute_solutions",
        {
          P_values: PValues,
          N: N,
          method: method,
        }
      );

      const solutions = response.data.solutions;

      if (!solutions || !Array.isArray(solutions)) {
        throw new Error("Invalid data structure from API");
      }

      const transformedData = solutions.flatMap((solution: any) => {
        const yValues = solution.solutions[method];
        const analyticalValues = solution.solutions.analytical;
        return yValues.map((y: number, index: number) => ({
          y: index / (yValues.length - 1), // Normalize y to [0, 1]
          P: solution.P,
          [method]: y,
          analytical: analyticalValues[index],
        }));
      });

      setData(transformedData);
      console.log(transformedData)
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
    navigator.clipboard.writeText(jsonData).then(() => {
      alert("Data copied to clipboard!");
    });
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold">
        Couette-Poiseuille Flow Visualization
      </h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Flow Visualization</CardTitle>
          </CardHeader>
          <CardContent className="relative h-[400px]">
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
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
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="y"
                    type="number"
                    domain={[0, 1]}
                    label={{ value: "y", position: "bottom" }}
                  />
                  <YAxis label={{ value: "u", angle: -90, position: "left" }} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey={method}
                    stroke="#8884d8"
                    name={method.replace("_", " ")}
                  />
                  <Line
                    type="monotone"
                    dataKey="analytical"
                    stroke="#82ca9d"
                    name="Analytical"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
            <Button
              className="absolute top-2 right-2"
              onClick={handleCopy}
              disabled={loading || !!error}
            >
              Copy Data
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Parameters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pressure-gradient">Pressure Gradient (P)</Label>
              <div className="flex items-center space-x-2">
                <Slider
                  id="pressure-gradient"
                  min={-2}
                  max={10}
                  step={0.1}
                  value={PValues}
                  onValueChange={(value) => setPValues(value)}
                  className="flex-grow"
                />
                <Input
                  type="number"
                  value={PValues[0]}
                  onChange={(e) => setPValues([Number(e.target.value)])}
                  className="w-20"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="grid-points">Number of Grid Points (N)</Label>
              <Input
                id="grid-points"
                type="number"
                value={N}
                onChange={(e) => setN(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="method">Numerical Method</Label>
              <Select
                value={method}
                onValueChange={(
                  value:
                    | "explicit_euler"
                    | "implicit_euler"
                    | "finite_difference"
                ) => setMethod(value)}
              >
                <SelectTrigger id="method">
                  <SelectValue placeholder="Select a method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="explicit_euler">Explicit Euler</SelectItem>
                  <SelectItem value="implicit_euler">Implicit Euler</SelectItem>
                  <SelectItem value="finite_difference">
                    Finite Differences
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={fetchData} disabled={loading}>
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Update Visualization
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
