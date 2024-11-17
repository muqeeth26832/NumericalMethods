"use client";
import { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

// Custom component for matrix input
const MatrixInput = ({
  value,
  onChange,
}: {
  value: number[][];
  onChange: (newValue: number[][]) => void;
}) => {
  const handleCellChange = (
    rowIndex: number,
    colIndex: number,
    newValue: string
  ) => {
    const newMatrix = value.map((row, rIndex) =>
      row.map((cell, cIndex) =>
        rIndex === rowIndex && cIndex === colIndex
          ? Number(newValue) || 0
          : cell
      )
    );
    onChange(newMatrix);
  };

  return (
    <div className="grid grid-cols-5 gap-2">
      {value.map((row, rowIndex) =>
        row.map((cell, colIndex) => (
          <Input
            key={`${rowIndex}-${colIndex}`}
            type="number"
            value={cell}
            onChange={(e) =>
              handleCellChange(rowIndex, colIndex, e.target.value)
            }
            className="w-full text-center"
          />
        ))
      )}
    </div>
  );
};

// Custom component for vector input
const VectorInput = ({
  value,
  onChange,
}: {
  value: number[];
  onChange: (newValue: number[]) => void;
}) => {
  const handleCellChange = (index: number, newValue: string) => {
    const newVector = value.map((cell, i) =>
      i === index ? Number(newValue) || 0 : cell
    );
    onChange(newVector);
  };

  return (
    <div className="flex space-x-2">
      {value.map((cell, index) => (
        <Input
          key={index}
          type="number"
          value={cell}
          onChange={(e) => handleCellChange(index, e.target.value)}
          className="w-full text-center"
        />
      ))}
    </div>
  );
};

export default function LinearAlgebraSolver() {
  // State for matrix and vectors
  const [matrix, setMatrix] = useState<number[][]>(
    Array.from({ length: 5 }, () => Array(5).fill(0))
  );
  const [vectorB1, setVectorB1] = useState<number[]>(Array(5).fill(0));
  const [vectorB2, setVectorB2] = useState<number[]>(Array(5).fill(0));

  // State for results, loading, and error
  const [results, setResults] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Function to handle solving

  const handleSolve = async () => {
    setLoading(true);
    setError(null);
    console.log("was called");

    const data = {
      matrix: matrix,
      b1: vectorB1,
      b2: vectorB2,
    };

    try {
      const response = await axios.post(
        "http://localhost:8000/api/v1/matrix/process-matrix",
        data // Send the structured data object
      );
      setResults(response.data); // Store the results from the backend
      console.log("recieved");
      console.log(response.data);
    } catch (err) {
      setError("Failed to process calculations");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to render results dynamically
  const renderResult = (label: string, data: any) => (
    <div className="space-y-2">
      <h3 className="font-bold">{label}:</h3>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Linear Algebra Solver</CardTitle>
        <CardDescription>
          Enter a 5x5 matrix and two vectors to calculate various properties and
          solutions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <Label className="block mb-2">5x5 Matrix A</Label>
          <MatrixInput value={matrix} onChange={setMatrix} />
          <div className="flex space-x-4">
            <div className="flex-1">
              <Label className="block mb-2">Vector b1</Label>
              <VectorInput value={vectorB1} onChange={setVectorB1} />
            </div>
            <div className="flex-1">
              <Label className="block mb-2">Vector b2</Label>
              <VectorInput value={vectorB2} onChange={setVectorB2} />
            </div>
          </div>
          <div className="flex space-x-4">
            <Button onClick={handleSolve} disabled={loading}>
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Solve
            </Button>
          </div>
          {error && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
      <CardFooter>
        {results.eigenvalues &&
          renderResult("Eigenvalues", results.eigenvalues)}
        {results.determinant &&
          renderResult("Determinant", results.determinant)}
        {results.uniqueness &&
          renderResult("Uniqueness of the System", results.uniqueness)}
        {results.condition_comparison &&
          renderResult(
            "Condition Number Comparison",
            results.condition_comparison
          )}
        {results.polynomial &&
          renderResult("Polynomial Equation", results.polynomial)}
        {results.power_method_eigenvalue &&
          renderResult(
            "Power Method Eigenvalue",
            results.power_method_eigenvalue
          )}
        {results.inverse_power_method_eigenvalue &&
          renderResult(
            "Inverse Power Method Eigenvalue",
            results.inverse_power_method_eigenvalue
          )}
        {results.solutions &&
          renderResult("Solutions for Ax = b1 and Ax = b2", results.solutions)}
      </CardFooter>
    </Card>
  );
}
