"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { Loader2 } from "lucide-react";

interface SolutionData {
  y: number[];
  u: number[];
}

interface FlowResults {
  bvp: SolutionData;
  explicit: SolutionData;
  implicit: SolutionData;
  analytical: SolutionData | null;
}

export default function FlowVisualization() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<FlowResults | null>(null);

  const [params, setParams] = useState({
    P: -2,
    N: 100,
    step_size: 0.000001,
    y_start: 0,
    y_end: 1,
    u_start: 0,
    u_end: 1,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setParams((prev) => ({
      ...prev,
      [name]: name === "N" ? parseInt(value) : parseFloat(value),
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        "http://localhost:8000/api/v1/ivpbvp/solve",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(params),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch results");
      }

      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const formatData = () => {
    if (!results) return [];

    const data = [];
    const len = results.bvp.y.length;

    for (let i = 0; i < len; i++) {
      const point: any = {
        y: results.bvp.y[i],
        bvp: results.bvp.u[i],
        explicit: results.explicit.u[i],
        implicit: results.implicit.u[i],
      };

      if (results.analytical) {
        point.analytical = results.analytical.u[i];
      }

      data.push(point);
    }

    return data;
  };

  return (
    <div className="container mx-auto p-4 space-y-8">
      <h1 className="text-3xl font-bold text-center mb-8">
        Couette-Poiseuille Flow Visualization
      </h1>

      <Tabs defaultValue="parameters" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="parameters">Parameters</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
        </TabsList>

        <TabsContent value="parameters">
          <Card>
            <CardHeader>
              <CardTitle>Flow Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="P">Pressure Gradient (P)</Label>
                  <Input
                    id="P"
                    name="P"
                    type="number"
                    value={params.P}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="N">Number of Points (N)</Label>
                  <Input
                    id="N"
                    name="N"
                    type="number"
                    min="10"
                    value={params.N}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="step_size">Step Size</Label>
                  <Input
                    id="step_size"
                    name="step_size"
                    type="number"
                    step="0.000001"
                    value={params.step_size}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="y_start">Y Start</Label>
                  <Input
                    id="y_start"
                    name="y_start"
                    type="number"
                    value={params.y_start}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="y_end">Y End</Label>
                  <Input
                    id="y_end"
                    name="y_end"
                    type="number"
                    value={params.y_end}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="u_start">U Start</Label>
                  <Input
                    id="u_start"
                    name="u_start"
                    type="number"
                    value={params.u_start}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="u_end">U End</Label>
                  <Input
                    id="u_end"
                    name="u_end"
                    type="number"
                    value={params.u_end}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <Button
                className="mt-6 w-full"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Calculating...
                  </>
                ) : (
                  "Solve"
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results">
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {results && (
            <Card>
              <CardHeader>
                <CardTitle>Flow Visualization Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[600px] w-full">
                  {/* <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={formatData()}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="y" 
                        label={{ value: 'y', position: 'bottom' }} 
                      />
                      <YAxis 
                        label={{ value: 'u(y)', angle: -90, position: 'left' }} 
                      />
                      <Tooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="bvp" 
                        stroke="hsl(var(--primary))" 
                        name="BVP Solution" 
                        strokeWidth={2}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="explicit" 
                        stroke="hsl(var(--secondary))" 
                        name="Explicit Euler" 
                        strokeWidth={2}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="implicit" 
                        stroke="hsl(var(--accent))" 
                        name="Implicit Euler" 
                        strokeWidth={2}
                      />
                      {results.analytical && (
                        <Line 
                          type="monotone" 
                          dataKey="analytical" 
                          stroke="hsl(var(--destructive))" 
                          name="Analytical Solution" 
                          strokeWidth={2}
                        />
                      )}
                    </LineChart>
                  </ResponsiveContainer> */}
<ResponsiveContainer width="100%" height="100%">
  <LineChart
    data={formatData()}
    margin={{ top: 20, right: 40, left: 20, bottom: 30 }}
  >
    {/* Background grid */}
    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />

    {/* X-Axis */}
    <XAxis
      dataKey="y" // `y` as the independent variable
      label={{
        value: "y (Dimensionless)",
        position: "insideBottom",
        offset: -10,
        style: { fontSize: "14px", fill: "#333" },
      }}
      tick={{ fontSize: 12 }}
      stroke="#666"
    />

    {/* Y-Axis */}
    <YAxis
      label={{
        value: "u(y)",
        angle: -90,
        position: "insideLeft",
        style: { fontSize: "14px", fill: "#333" },
      }}
      tick={{ fontSize: 12 }}
      stroke="#666"
    />

    {/* Custom Tooltip */}
    <Tooltip
      content={({ active, payload, label }) => {
        if (active && payload && payload.length) {
          return (
            <div
              style={{
                backgroundColor: "#fff",
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "8px 12px",
                boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
              }}
            >
              <p
                style={{
                  marginBottom: "8px",
                  fontWeight: "bold",
                  color: "#333",
                  fontSize: "14px",
                }}
              >
                y: {label.toFixed(4)}
              </p>
              {payload.map((entry, index) => (
                <p
                  key={`tooltip-${index}`}
                  style={{
                    margin: 0,
                    color: entry.color,
                    fontSize: "12px",
                  }}
                >
                  {entry.name}: {entry.value.toFixed(4)}
                </p>
              ))}
            </div>
          );
        }
        return null;
      }}
    />

    {/* Legend */}
    <Legend
      verticalAlign="top"
      height={36}
      wrapperStyle={{ fontSize: "14px" }}
    />

    {/* Lines */}
    <Line
      type="monotone"
      dataKey="bvp"
      stroke="#3b82f6"
      name="BVP Solution"
      strokeWidth={2.5}
      dot={{ r: 1.5 }} // Smaller dots for clarity
    />
    <Line
      type="monotone"
      dataKey="explicit"
      stroke="#10b981"
      name="Explicit Euler"
      strokeWidth={2.5}
      dot={{ r: 1.5 }}
    />
    <Line
      type="monotone"
      dataKey="implicit"
      stroke="#ef4444"
      name="Implicit Euler"
      strokeWidth={2.5}
      dot={{ r: 1.5 }}
    />
    {results.analytical && (
      <Line
        type="monotone"
        dataKey="analytical"
        stroke="#fbbf24"
        name="Analytical Solution"
        strokeWidth={2.5}
        dot={{ r: 1.5 }}
      />
    )}
  </LineChart>
</ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

