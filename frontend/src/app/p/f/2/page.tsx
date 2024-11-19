"use client";

import { useState, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import WeightVsRoots from "./WeightVsRoots";

// Function to fetch data from the server
async function getWeightVsRoots(n: number, method: string) {
  const response = await fetch(
    `http://localhost:8000/api/v1/visualization/roots/${method}?n=${n}`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch data");
  }
  const data = await response.json();
  return data;
}

export default function GaussianQuadrature() {
  const [inputValue, setInputValue] = useState<string>("");
  const [delay, setDelay] = useState<string>("1000"); // Default delay of 1000ms
  const [dataGaussLegendre, setDataGaussLegendre] = useState<
    { root: number; weight: number }[] | null
  >(null);
  const [dataSymbolicLegendre, setDataSymbolicLegendre] = useState<
    { root: number; weight: number }[] | null
  >(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [method, setMethod] = useState<string>("gauss-legendre"); // Track method
  const animationRef = useRef<number | null>(null); // For stopping animation

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setDataGaussLegendre(null);
    setDataSymbolicLegendre(null);
  };

  const handleDelayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDelay(e.target.value);
  };

  const handleMethodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setMethod(e.target.value);
  };

  const handleSubmit = async () => {
    const n = Number(inputValue);
    if (n > 0) {
      try {
        // Fetch data for the selected method (or both)
        if (method === "both") {
          const gaussResult = await getWeightVsRoots(n, "gauss-legendre");
          const symbolicResult = await getWeightVsRoots(n, "symbolic-legendre");

          const gaussData = gaussResult.roots.map(
            (root: number, index: number) => ({
              root,
              weight: gaussResult.weights[index],
            })
          );

          const symbolicData = symbolicResult.roots.map(
            (root: number, index: number) => ({
              root,
              weight: symbolicResult.weights[index],
            })
          );

          setDataGaussLegendre(gaussData);
          setDataSymbolicLegendre(symbolicData);
        } else {
          const result = await getWeightVsRoots(n, method);

          const data = result.roots.map((root: number, index: number) => ({
            root,
            weight: result.weights[index],
          }));

          if (method === "gauss-legendre") {
            setDataGaussLegendre(data);
            setDataSymbolicLegendre(null);
          } else if (method === "symbolic-legendre") {
            setDataSymbolicLegendre(data);
            setDataGaussLegendre(null);
          }
        }
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleAnimateGraph = async () => {
    setIsAnimating(true);
    animationRef.current = 1; // Start animation
    for (let n = 1; n <= 64 && animationRef.current; n++) {
      try {
        // Fetch data for both methods
        setInputValue(n.toString());
        const gaussResult = await getWeightVsRoots(n, "gauss-legendre");
        const symbolicResult = await getWeightVsRoots(n, "symbolic-legendre");

        const gaussData = gaussResult.roots.map(
          (root: number, index: number) => ({
            root,
            weight: gaussResult.weights[index],
          })
        );

        const symbolicData = symbolicResult.roots.map(
          (root: number, index: number) => ({
            root,
            weight: symbolicResult.weights[index],
          })
        );

        setDataGaussLegendre(gaussData);
        setDataSymbolicLegendre(symbolicData);

        await new Promise((resolve) => setTimeout(resolve, Number(delay)));
      } catch (error) {
        console.error(error);
        break;
      }
    }
    setIsAnimating(false);
  };

  const handleStopAnimation = () => {
    animationRef.current = null; // Stop animation
    setIsAnimating(false);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-5xl p-8">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">
            Assignment-2: Gaussian Quadrature
          </CardTitle>
          <CardDescription className="text-lg">
            Gauss-Legendre Method
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {inputValue}
          <div className="flex space-x-4">
            <Input
              type="number"
              placeholder="Enter a number"
              value={inputValue}
              onChange={handleInputChange}
              className="flex-grow"
            />
            <Input
              type="number"
              placeholder="Enter delay in ms"
              value={delay}
              onChange={handleDelayChange}
              className="w-32"
            />
            <select
              value={method}
              onChange={handleMethodChange}
              className="w-32 p-2 border border-gray-300 rounded"
            >
              <option value="gauss-legendre">Gauss-Legendre Quadrature</option>
              <option value="symbolic-legendre">
                Symbolic Legendre Quadrature
              </option>
              <option value="both">Both Methods</option>
            </select>
            <Button onClick={handleSubmit}>Submit</Button>
            <Button onClick={handleAnimateGraph} disabled={isAnimating}>
              Animate Graph (1 to 64)
            </Button>
            <Button onClick={handleStopAnimation} disabled={!isAnimating}>
              Stop
            </Button>
          </div>
          {dataGaussLegendre && dataSymbolicLegendre && (
            <div className="h-96">
              <WeightVsRoots
                dataGaussLegendre={dataGaussLegendre}
                dataSymbolicLegendre={dataSymbolicLegendre}
                method={method} // Pass method prop
              />
            </div>
          )}
          {dataGaussLegendre && !dataSymbolicLegendre && (
            <div className="h-96">
              <WeightVsRoots
                dataGaussLegendre={dataGaussLegendre}
                method={method} // Pass method prop
              />
            </div>
          )}
          {dataSymbolicLegendre && !dataGaussLegendre && (
            <div className="h-96">
              <WeightVsRoots
                dataSymbolicLegendre={dataSymbolicLegendre}
                method={method} // Pass method prop
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
