"use client";
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, X, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import LineChartComponent from "@/components/LineChart";

type SolutionEntry = {
  p_value: number;
  y: number;
  explicit_euler: number;
  implicit_euler: number;
  finite_difference: number;
  analytical_solution: number;
};

type Solution = SolutionEntry[];

type FetchSolutionsInput = {
  P_values: number[];
  N: number;
};

type FetchSolutionsResponse = {
  solutions: Solution[];
};

export default function FlowComparisonPage() {
  const [N, setN] = useState<number>(100);
  const [selectedPValues, setSelectedPValues] = useState<number[]>([-2]);
  const [data, setData] = useState<Solution[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [newPValue, setNewPValue] = useState<string>("");

  const fetchData = useCallback(async () => {
    if (selectedPValues.length === 0) {
      setError("Please select at least one P value.");
      return;
    }

    setLoading(true);
    setError(null);
    const requestData: FetchSolutionsInput = { P_values: selectedPValues, N };

    try {
      const response = await axios.post<FetchSolutionsResponse>(
        "http://localhost:8000/api/v1/ivpbvp/compute_solutions",
        requestData
      );
      setData(response.data.solutions);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [selectedPValues, N]);

  const handleAddPressure = () => {
    const pValueNum = parseFloat(newPValue);
    if (!isNaN(pValueNum) && !selectedPValues.includes(pValueNum)) {
      setSelectedPValues((prev) => [...prev, pValueNum]);
      setNewPValue("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddPressure();
    }
  };

  const handleRemovePressure = (pValue: number) => {
    setSelectedPValues((prev) => prev.filter((value) => value !== pValue));
  };

  const prepareChartData = (solutions: Solution[], p_value: number) => {
    const x: number[] = [];
    const explicit_euler: number[] = [];
    const implicit_euler: number[] = [];
    const finite_difference: number[] = [];
    const analytical_solution: number[] = [];

    solutions.forEach((solution) => {
      solution.forEach((entry) => {
        if (entry.p_value === p_value) {
          x.push(entry.y);
          explicit_euler.push(entry.explicit_euler);
          implicit_euler.push(entry.implicit_euler);
          finite_difference.push(entry.finite_difference);
          analytical_solution.push(entry.analytical_solution);
        }
      });
    });

    return {
      x,
      explicit_euler,
      implicit_euler,
      finite_difference,
      analytical_solution,
    };
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl space-y-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Flow Comparison Analysis
          </h1>
          <p className="text-gray-600">
            Compare different numerical methods for flow solutions
          </p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ChevronRight className="h-5 w-5 text-blue-500" />
              Configuration Parameters
            </CardTitle>
            <CardDescription>
              Set your P values and grid points to generate the flow comparison
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-semibold mb-2 block">
                  Selected P Values
                </Label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {selectedPValues.map((p) => (
                    <Badge
                      key={p}
                      variant="secondary"
                      className="px-3 py-1 text-sm flex items-center gap-2 hover:bg-gray-200 transition-colors"
                    >
                      {p}
                      <X
                        className="h-3 w-3 cursor-pointer hover:text-red-500"
                        onClick={() => handleRemovePressure(p)}
                      />
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Enter P value"
                    value={newPValue}
                    onChange={(e) => setNewPValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="w-full md:w-64"
                  />
                  <Button onClick={handleAddPressure} variant="secondary">
                    Add Value
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-32">
                  <Label
                    htmlFor="grid-points"
                    className="text-sm font-semibold"
                  >
                    Grid Points (N)
                  </Label>
                  <Input
                    id="grid-points"
                    type="number"
                    value={N}
                    onChange={(e) => setN(Number(e.target.value))}
                    className="mt-1"
                  />
                </div>
                <Button
                  onClick={fetchData}
                  disabled={loading}
                  className="mt-6"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin mr-2" size={16} />
                      Computing...
                    </>
                  ) : (
                    "Generate Solutions"
                  )}
                </Button>
              </div>
            </div>

            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {data.length > 0 && (
          <div className="w-full">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ChevronRight className="h-5 w-5 text-blue-500" />
                  Flow Solutions Comparison
                </CardTitle>
                <CardDescription>
                  Visualization of different numerical methods
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {selectedPValues.map((p_value) => (
                    <div
                      key={p_value}
                      className="w-full overflow-hidden rounded-lg"
                    >
                      <LineChartComponent
                        data={prepareChartData(data, p_value)}
                        height={500}
                        width={800}
                        x_name="Spatial Variable"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
