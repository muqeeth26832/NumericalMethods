"use client"

import { useState, useEffect, useCallback } from "react"
import axios from "axios"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, ArrowRight, Copy, RefreshCw, Plus, Minus } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Method {
  name: string
  color: string
}

interface Methods {
  [key: string]: Method
}

interface Solution {
  y: number
  P: number
  P_value: number
  analytical: number
  [key: string]: number
}

const METHODS: Methods = {
  explicit_euler: { name: "Explicit Euler", color: "#4f46e5" },
  implicit_euler: { name: "Implicit Euler", color: "#7c3aed" },
  finite_difference: { name: "Finite Differences", color: "#6366f1" },
}

const COLORS = ["#e11d48", "#2563eb", "#16a34a", "#d97706", "#7c3aed"]

interface ResultsChartProps {
  data: Solution[]
  methods: Methods
  stepSize: number
}

function ResultsChart({ data, methods }: ResultsChartProps) {
  const groupedData = data.reduce((acc: { [key: number]: Solution[] }, item) => {
    const pValue = item.P_value
    if (!acc[pValue]) {
      acc[pValue] = []
    }
    acc[pValue].push(item)
    return acc
  }, {})

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis
          dataKey="y"
          type="number"
          domain={[0, 1]}
          label={{ value: "Position (y)", position: "bottom" }}
          tick={{ fill: "#6B7280" }}
        />
        <YAxis
          label={{
            value: "Velocity (u)",
            angle: -90,
            position: "insideLeft",
          }}
          tick={{ fill: "#6B7280" }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "white",
            borderRadius: "8px",
            border: "1px solid #E5E7EB",
          }}
        />
        <Legend verticalAlign="top" height={36} />

        {Object.entries(groupedData).map(([pValue, solutions], pIndex) => (
          <>
            {Object.entries(methods).map(([methodKey, methodValue]) => (
              <Line
                key={`${methodKey}-${pValue}`}
                type="monotone"
                data={solutions}
                dataKey={methodKey}
                stroke={COLORS[pIndex % COLORS.length]}
                name={`${methodValue.name} (P=${pValue})`}
                dot={false}
                strokeWidth={2}
                strokeOpacity={0.7}
              />
            ))}
            <Line
              key={`analytical-${pValue}`}
              type="monotone"
              data={solutions}
              dataKey="analytical"
              stroke={COLORS[pIndex % COLORS.length]}
              name={`Analytical (P=${pValue})`}
              dot={false}
              strokeWidth={2}
              strokeDasharray="5 5"
            />
          </>
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}

export default function CouettePoiseuillePage() {
  const [PValues, setPValues] = useState<number[]>([2])
  const [stepSize, setStepSize] = useState<number>(0.01)
  const [data, setData] = useState<Solution[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<string>("visualization")
  const [selectedP, setSelectedP] = useState<number>(2)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await axios.post("http://localhost:8000/api/v1/ivpbvp/solve", {
        P_values: PValues,
        step_size: stepSize,
        methods: Object.keys(METHODS),
      })

      const solutions = response.data.solutions
      const transformedData = solutions.flat().map((item: any) => ({
        y: item.y,
        P: item.p_value,
        P_value: item.p_value,
        ...Object.keys(METHODS).reduce((acc, method) => ({ ...acc, [method]: item[method] }), {}),
        analytical: item.analytical_solution,
      }))

      setData(transformedData)
    } catch (error) {
      console.error("Error fetching data:", error)
      setError("Failed to fetch data. Please try again.")
    } finally {
      setLoading(false)
    }
  }, [PValues, stepSize])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2))
      alert("Data copied to clipboard!")
    } catch (err) {
      console.error("Failed to copy data:", err)
      alert("Failed to copy data to clipboard")
    }
  }

  const addPValue = () => {
    if (PValues.length < 5) {
      setPValues([...PValues, 2])
    }
  }

  const removePValue = () => {
    if (PValues.length > 1) {
      setPValues(PValues.slice(0, -1))
    }
  }

  const updatePValue = (index: number, value: number) => {
    const newPValues = [...PValues]
    newPValues[index] = value
    setPValues(newPValues)
  }

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
          <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto">
            <TabsTrigger value="visualization">Visualization</TabsTrigger>
            <TabsTrigger value="comparison">Method Comparison</TabsTrigger>
            <TabsTrigger value="analysis">P Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="visualization" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="shadow-lg lg:col-span-2">
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
                    <ResultsChart data={data} methods={METHODS} stepSize={stepSize} />
                  )}
                  <div className="absolute top-2 right-2 space-x-2">
                    <Button size="sm" variant="outline" onClick={handleCopy} disabled={loading || !!error}>
                      <Copy className="h-4 w-4 mr-1" />
                      Copy Data
                    </Button>
                    <Button size="sm" variant="outline" onClick={fetchData} disabled={loading}>
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
                    {PValues.map((p, index) => (
                      <div key={index} className="flex items-center space-x-4">
                        <Input
                          type="number"
                          value={p}
                          onChange={(e) => updatePValue(index, Number(e.target.value))}
                          min={-4}
                          max={10}
                          step={0.1}
                          className="w-24"
                        />
                      </div>
                    ))}
                    <div className="flex justify-end space-x-2">
                      <Button size="sm" onClick={addPValue} disabled={PValues.length >= 5}>
                        <Plus className="h-4 w-4 mr-1" />
                        Add P
                      </Button>
                      <Button size="sm" onClick={removePValue} disabled={PValues.length <= 1}>
                        <Minus className="h-4 w-4 mr-1" />
                        Remove P
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-sm font-semibold">Step Size</Label>
                    <Input
                      type="number"
                      value={stepSize}
                      onChange={(e) => setStepSize(Number(e.target.value))}
                      min={0.001}
                      max={0.1}
                      step={0.001}
                    />
                  </div>

                  <Button className="w-full" onClick={fetchData} disabled={loading}>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {PValues.map((p, index) => (
                <Card key={index} className="shadow-lg">
                  <CardHeader>
                    <CardTitle>P = {p}</CardTitle>
                    <CardDescription>Comparison of numerical methods</CardDescription>
                  </CardHeader>
                  <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={data.filter((d) => d.P === p)} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis dataKey="y" type="number" domain={[0, 1]} />
                        <YAxis />
                        <Tooltip />
                        <Legend />
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
                          name="Analytical"
                          dot={false}
                          strokeWidth={2}
                          strokeDasharray="5 5"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analysis" className="space-y-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowRight className="h-5 w-5 text-blue-500" />
                  P Value Analysis
                </CardTitle>
                <CardDescription>Analyze results for a specific P value</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Label className="text-sm font-semibold">Select P Value</Label>
                  <Select value={selectedP.toString()} onValueChange={(value) => setSelectedP(Number(value))}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select P value" />
                    </SelectTrigger>
                    <SelectContent>
                      {PValues.map((p) => (
                        <SelectItem key={p} value={p.toString()}>
                          P = {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.filter((d) => d.P === selectedP)} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="y" type="number" domain={[0, 1]} />
                      <YAxis />
                      <Tooltip />
                      <Legend />
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
                        name="Analytical"
                        dot={false}
                        strokeWidth={2}
                        strokeDasharray="5 5"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
