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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Plus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const METHODS = [
  { id: "explicit_euler", name: "Explicit Euler", color: "#8884d8" },
  { id: "implicit_euler", name: "Implicit Euler", color: "#82ca9d" },
  { id: "finite_difference", name: "Finite Difference", color: "#ffc658" },
];

export default function FlowComparisonPage() {
  const [N, setN] = useState(100);
  const [selectedPValues, setSelectedPValues] = useState<numeer[]>([2]);
  const [selectedMethods, setSelectedMethods] = useState<string[]>([
    "explicit_euler",
  ]);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newPValue, setNewPValue] = useState<string>("");

  const fetchData = useCallback(async () => {
    if (selectedPValues.length === 0 || selectedMethods.length === 0) {
      setError("Please select at least one P value and method");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(
        "http://localhost:8000/api/v1/ivpbvp/compute_solutions",
        {
          P_values: selectedPValues,
          N: N,
          method: selectedMethods[0], // API still needs one method, we'll request all
        }
      );

      const solutions = response.data.solutions;

      if (!solutions || !Array.isArray(solutions)) {
        throw new Error("Invalid data structure from API");
      }

      const transformedData = solutions.flatMap((solution: any) => {
        return Object.keys(solution.solutions)
          .map((methodName) => {
            if (methodName === "analytical") return null;
            const yValues = solution.solutions[methodName];
            const analyticalValues = solution.solutions.analytical;

            return yValues.map((y: number, index: number) => ({
              y: index / (yValues.length - 1),
              P: solution.P,
              method: methodName,
              value: y,
              analytical: analyticalValues[index],
            }));
          })
          .filter(Boolean);
      });

      setData(transformedData.flat());
      
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to fetch data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [selectedPValues, N, selectedMethods]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddPValue = () => {
    const pValue = parseFloat(newPValue);
    if (!isNaN(pValue) && !selectedPValues.includes(pValue)) {
      setSelectedPValues([...selectedPValues, pValue]);
      setNewPValue("");
    }
  };

  const handleRemovePValue = (pValue: number) => {
    setSelectedPValues(selectedPValues.filter((p) => p !== pValue));
  };

  const toggleMethod = (methodId: string) => {
    setSelectedMethods((prev) =>
      prev.includes(methodId)
        ? prev.filter((m) => m !== methodId)
        : [...prev, methodId]
    );
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold">Flow Comparison Analysis</h1>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>P Values</Label>
              <div className="flex flex-wrap gap-2">
                {selectedPValues.map((p) => (
                  <Badge
                    key={p}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {p}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => handleRemovePValue(p)}
                    />
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={newPValue}
                  onChange={(e) => setNewPValue(e.target.value)}
                  placeholder="Add P value"
                  className="w-32"
                />
                <Button
                  size="sm"
                  onClick={handleAddPValue}
                  disabled={!newPValue}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Methods</Label>
              <div className="flex flex-wrap gap-2">
                {METHODS.map((method) => (
                  <Badge
                    key={method.id}
                    variant={
                      selectedMethods.includes(method.id)
                        ? "default"
                        : "outline"
                    }
                    className="cursor-pointer"
                    onClick={() => toggleMethod(method.id)}
                  >
                    {method.name}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="grid-points">Grid Points (N)</Label>
              <Input
                id="grid-points"
                type="number"
                value={N}
                onChange={(e) => setN(Number(e.target.value))}
                className="w-32"
              />
            </div>

            <Button onClick={fetchData} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Comparison
            </Button>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {selectedPValues.map((p) => (
            <Card key={p}>
              <CardHeader>
                <CardTitle>P = {p}</CardTitle>
              </CardHeader>
              <CardContent className="h-[400px]">
                {loading ? (
                  <div className="h-full flex items-center justify-center">
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
                      data={data.filter((d) => d.P === p)}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="y"
                        type="number"
                        domain={[0, 1]}
                        label={{ value: "y", position: "bottom" }}
                      />
                      <YAxis
                        label={{ value: "u", angle: -90, position: "left" }}
                      />
                      <Tooltip />
                      <Legend />
                      {selectedMethods.map((methodId) => {
                        const method = METHODS.find((m) => m.id === methodId);
                        return (
                          <Line
                            key={methodId}
                            type="monotone"
                            dataKey="value"
                            data={data.filter(
                              (d) => d.P === p && d.method === methodId
                            )}
                            stroke={method?.color}
                            name={method?.name}
                            dot={false}
                          />
                        );
                      })}
                      <Line
                        type="monotone"
                        dataKey="analytical"
                        stroke="#ff7300"
                        name="Analytical"
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
