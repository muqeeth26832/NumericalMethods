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

const ResultCard = ({ results }: { results: any }) => (
  <div className="space-y-4">
    {Object.entries(results).map(([key, value]) => (
      <Card key={key} className="mb-4">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            {key.replace(/_/g, " ")}{" "}
            {/* Convert snake_case to human-readable text */}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {Array.isArray(value) ? (
            <div className="space-y-2">
              {value.map((item, index) => (
                <div key={index} className="p-2 bg-secondary rounded">
                  <pre className="whitespace-pre-wrap break-words text-white">
                    {JSON.stringify(item, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          ) : typeof value === "object" && value !== null ? (
            <div className="space-y-2">
              {Object.entries(value).map(([subKey, subValue]) => (
                <div key={subKey} className="p-2 bg-secondary rounded">
                  <strong className="text-secondary-foreground">
                    {subKey}:
                  </strong>{" "}
                  <pre className=" text-white whitespace-pre-wrap break-words mt-1">
                    {JSON.stringify(subValue, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-secondary-foreground">{value.toString()}</p>
          )}
        </CardContent>
      </Card>
    ))}
  </div>
);

export default function LinearAlgebraSolver() {
  const [matrix, setMatrix] = useState<number[][]>(
    Array.from({ length: 5 }, () => Array(5).fill(0))
  );
  const [vectorB1, setVectorB1] = useState<number[]>(Array(5).fill(0));
  const [vectorB2, setVectorB2] = useState<number[]>(Array(5).fill(0));
  const [results, setResults] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSolve = async () => {
    setLoading(true);
    setError(null);
    console.log("Solving...");

    const data = {
      matrix: matrix,
      b1: vectorB1,
      b2: vectorB2,
    };

    try {
      const response = await axios.post(
        "http://localhost:8000/api/v1/matrix/process-matrix",
        data
      );
      setResults(response.data);

      console.log("Results received:", response.data);
    } catch (err) {
      setError("Failed to process calculations");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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
          <div>
            <Label className="block mb-2">5x5 Matrix A</Label>
            <MatrixInput value={matrix} onChange={setMatrix} />
          </div>
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
          <Button onClick={handleSolve} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Solve
          </Button>
          {error && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
      ---
      <CardFooter>
        {Object.keys(results).length > 0 && <ResultCard results={results} />}

        {/* <div className="w-full space-y-4">
          {results.eigenvalues && (
            <ResultCard title="Eigenvalues" data={results.eigenvalues} />
          )}
          {results.determinant && (
            <ResultCard title="Determinant" data={results.determinant} />
          )}
          {results.uniqueness && (
            <ResultCard
              title="Uniqueness of the System"
              data={results.uniqueness}
            />
          )}
          {results.condition_comparison && (
            <ResultCard
              title="Condition Number Comparison"
              data={results.condition_comparison}
            />
          )}
          {results.polynomial && (
            <ResultCard title="Polynomial Equation" data={results.polynomial} />
          )}
          {results.power_method_eigenvalue && (
            <ResultCard
              title="Power Method Eigenvalue"
              data={results.power_method_eigenvalue}
            />
          )}
          {results.inverse_power_method_eigenvalue && (
            <ResultCard
              title="Inverse Power Method Eigenvalue"
              data={results.inverse_power_method_eigenvalue}
            />
          )}
          {results.solutions && (
            <ResultCard
              title="Solutions for Ax = b1 and Ax = b2"
              data={results.solutions}
            />
          )}
        </div> */}
      </CardFooter>
    </Card>
  );
}
