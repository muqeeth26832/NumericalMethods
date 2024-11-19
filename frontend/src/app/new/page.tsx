"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Copy, Upload, Calculator, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  uploadMatrix,
  calculateAll,
  calculateDeterminant,
  calculateConditionNumber,
  computeEigenvalues,
  polynomialEquation,
  powerMethod,
  findSolution,
} from "@/app/services/api";

function MatrixUpload({
  onFileUpload,
}: {
  onFileUpload: (file: File) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Matrix</CardTitle>
        <CardDescription>
          Upload a .csv file containing your matrix
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Label htmlFor="matrix-file" className="cursor-pointer">
          <div className="flex items-center justify-center w-full h-32 border-2 border-dashed rounded-md border-gray-300 hover:border-primary">
            <div className="space-y-1 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="flex text-sm text-gray-600">
                <Label
                  htmlFor="matrix-file"
                  className="relative cursor-pointer rounded-md font-medium text-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 hover:text-primary-dark"
                >
                  <span>Upload a file</span>
                  <Input
                    id="matrix-file"
                    name="matrix-file"
                    type="file"
                    className="sr-only"
                    onChange={(e) => onFileUpload(e.target.files![0])}
                    accept=".csv"
                  />
                </Label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">CSV up to 10MB</p>
            </div>
          </div>
        </Label>
      </CardContent>
    </Card>
  );
}

function ResultDisplay({ results }: { results: any }) {
  const { toast } = useToast();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied to clipboard",
        description: "The result has been copied to your clipboard.",
      });
    });
  };

  if (!results) return null;

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Results</CardTitle>
        <CardDescription>
          Calculation results are displayed below
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          {Object.entries(results).map(([key, value]) => (
            <Card key={key} className="mb-4">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{key}</CardTitle>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          copyToClipboard(JSON.stringify(value, null, 2))
                        }
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Copy result</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardHeader>
              <CardContent>
                {Array.isArray(value) ? (
                  value.map((item, index) => (
                    <p key={index} className="text-sm">
                      {typeof item === "object" && item.real !== undefined
                        ? `${item.real}${item.imag >= 0 ? "+" : ""}${
                            item.imag
                          }i`
                        : JSON.stringify(item)}
                    </p>
                  ))
                ) : typeof value === "object" ? (
                  Object.entries(value).map(([subKey, subValue]) => (
                    <p key={subKey} className="text-sm">
                      {`${subKey}: ${JSON.stringify(subValue)}`}
                    </p>
                  ))
                ) : (
                  <p className="text-sm">{String(value)}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

export default function NumericalMethodsCalculator() {
  const [matrixFile, setMatrixFile] = useState<File | null>(null);
  const [results, setResults] = useState(null);
  const [activeTab, setActiveTab] = useState("upload");
  const { toast } = useToast();

  const handleMatrixUpload = async (uploadedFile: File) => {
    setMatrixFile(uploadedFile);
    try {
      await uploadMatrix(uploadedFile);
      toast({
        title: "Matrix uploaded successfully",
        description:
          "You can now perform calculations on the uploaded CSV matrix.",
      });
      setActiveTab("calculate");
    } catch (error) {
      console.error("Error uploading matrix:", error);
      toast({
        title: "Error uploading matrix",
        description: "Please try again or check your file format.",
        variant: "destructive",
      });
    }
  };

  const handleCalculation = async (calculationFunction: () => Promise<any>) => {
    if (!matrixFile) {
      toast({
        title: "No matrix uploaded",
        description: "Please upload a matrix file first.",
        variant: "destructive",
      });
      return;
    }
    try {
      const response = await calculationFunction();
      setResults(response.data);
      setActiveTab("results");
    } catch (error) {
      console.error("Error performing calculation:", error);
      toast({
        title: "Error performing calculation",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSolution = async (vectorChoice: "b1" | "b2") => {
    if (!matrixFile) {
      toast({
        title: "No matrix uploaded",
        description: "Please upload a matrix file first.",
        variant: "destructive",
      });
      return;
    }
    try {
      const response = await findSolution(vectorChoice);
      setResults(response.data);
      setActiveTab("results");
    } catch (error) {
      console.error("Error solving Ax=b:", error);
      toast({
        title: "Error solving equation",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">
        Numerical Methods Calculator
      </h1>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="calculate">Calculate</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
        </TabsList>
        <TabsContent value="upload">
          <MatrixUpload onFileUpload={handleMatrixUpload} />
        </TabsContent>
        <TabsContent value="calculate">
          <Card>
            <CardHeader>
              <CardTitle>Perform Calculations</CardTitle>
              <CardDescription>
                Select a calculation to perform on the uploaded matrix
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Button onClick={() => handleCalculation(calculateAll)}>
                Calculate All
              </Button>
              <Button onClick={() => handleCalculation(calculateDeterminant)}>
                Determinant
              </Button>
              <Button
                onClick={() => handleCalculation(calculateConditionNumber)}
              >
                Condition Number
              </Button>
              <Button onClick={() => handleCalculation(computeEigenvalues)}>
                Compute Eigenvalues
              </Button>
              <Button onClick={() => handleCalculation(polynomialEquation)}>
                Polynomial Equation
              </Button>
              <Button onClick={() => handleCalculation(powerMethod)}>
                Power Method
              </Button>
              <Button onClick={() => handleSolution("b1")}>
                Solve Ax = b1
              </Button>
              <Button onClick={() => handleSolution("b2")}>
                Solve Ax = b2
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="results">
          <ResultDisplay results={results} />
        </TabsContent>
      </Tabs>
    </div>
  );
}