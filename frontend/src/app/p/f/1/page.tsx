// "use client";

// import { useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Label } from "@/components/ui/label";
// import { LinearAlgebraSolver } from "./linear-algebra-solver";

// export default function Component() {
//   const [matrix, setMatrix] = useState("");
//   const [vectorB1, setVectorB1] = useState("");
//   const [vectorB2, setVectorB2] = useState("");
//   const [results, setResults] = useState<{
//     determinant?: number;
//     conditionNumber?: number;
//     uniqueness?: string;
//     error?: string;
//     characteristicPolynomial?: string;
//     powerMethodResult?: number;
//     inversePowerMethodResult?: number;
//   }>({});

//   const handleSolve = (type: string) => {
//     try {
//       const solver = new LinearAlgebraSolver(matrix, vectorB1, vectorB2);

//       switch (type) {
//         case "determinant":
//           setResults({ determinant: solver.calculateDeterminant() });
//           break;
//         case "condition":
//           setResults({
//             conditionNumber: solver.calculateConditionNumber(),
//             uniqueness: solver.checkUniqueness(),
//           });
//           break;
//         case "characteristic":
//           setResults({
//             characteristicPolynomial: solver.getCharacteristicPolynomial(),
//           });
//           break;
//         case "powerMethod":
//           setResults({
//             powerMethodResult: solver.powerMethod(),
//           });
//           break;
//         case "inversePowerMethod":
//           setResults({
//             inversePowerMethodResult: solver.inversePowerMethod(),
//           });
//           break;
//         default:
//           throw new Error("Unsupported calculation type");
//       }
//     } catch (error: any) {
//       setResults({ error: error.message });
//     }
//   };

//   const isValidInput = () =>
//     matrix.split(",").length === 25 &&
//     vectorB1.split(",").length === 5 &&
//     vectorB2.split(",").length === 5;

//   return (
//     <Card className="w-full max-w-4xl mx-auto">
//       <CardHeader>
//         <CardTitle>Linear Algebra Solver</CardTitle>
//         <CardDescription>
//           Enter a 5x5 matrix and two vectors to calculate various properties and
//           solutions.
//         </CardDescription>
//       </CardHeader>
//       <CardContent>
//         <div className="space-y-4">
//           <div>
//             <Label htmlFor="matrix">5x5 Matrix A (comma-separated values)</Label>
//             <Textarea
//               id="matrix"
//               placeholder="1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25"
//               value={matrix}
//               onChange={(e) => setMatrix(e.target.value)}
//               className="h-28"
//             />
//           </div>
//           <div className="flex space-x-4">
//             <div className="flex-1">
//               <Label htmlFor="vectorB1">Vector b1 (comma-separated)</Label>
//               <Input
//                 id="vectorB1"
//                 placeholder="1,2,3,4,5"
//                 value={vectorB1}
//                 onChange={(e) => setVectorB1(e.target.value)}
//               />
//             </div>
//             <div className="flex-1">
//               <Label htmlFor="vectorB2">Vector b2 (comma-separated)</Label>
//               <Input
//                 id="vectorB2"
//                 placeholder="6,7,8,9,10"
//                 value={vectorB2}
//                 onChange={(e) => setVectorB2(e.target.value)}
//               />
//             </div>
//           </div>
//           <div className="grid grid-cols-2 gap-4">
//             <Button onClick={() => handleSolve("determinant")} disabled={!isValidInput()}>
//               Calculate Determinant
//             </Button>
//             <Button onClick={() => handleSolve("condition")} disabled={!isValidInput()}>
//               Calculate Condition Number
//             </Button>
//             <Button onClick={() => handleSolve("characteristic")} disabled={!isValidInput()}>
//               Get Characteristic Polynomial
//             </Button>
//             <Button onClick={() => handleSolve("powerMethod")} disabled={!isValidInput()}>
//               Power Method Result
//             </Button>
//             <Button onClick={() => handleSolve("inversePowerMethod")} disabled={!isValidInput()}>
//               Inverse Power Method Result
//             </Button>
//           </div>
//           {results.error && (
//             <p className="text-red-500">Error: {results.error}</p>
//           )}
//         </div>
//       </CardContent>
//       <CardFooter>
//         <Tabs defaultValue="results" className="w-full">
//           <TabsList className="grid w-full grid-cols-3">
//             <TabsTrigger value="determinant">Determinant</TabsTrigger>
//             <TabsTrigger value="condition">Condition Number</TabsTrigger>
//             <TabsTrigger value="extra">Extras</TabsTrigger>
//           </TabsList>
//           <TabsContent value="determinant">
//             <Card>
//               <CardHeader>
//                 <CardTitle>Determinant</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <p>
//                   Determinant:{" "}
//                   {results.determinant !== undefined
//                     ? results.determinant
//                     : "N/A"}
//                 </p>
//               </CardContent>
//             </Card>
//           </TabsContent>
//           <TabsContent value="condition">
//             <Card>
//               <CardHeader>
//                 <CardTitle>Condition Number</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <p>
//                   Condition Number:{" "}
//                   {results.conditionNumber !== undefined
//                     ? results.conditionNumber
//                     : "N/A"}
//                 </p>
//                 <p>
//                   Uniqueness: {results.uniqueness || "Not Calculated Yet"}
//                 </p>
//               </CardContent>
//             </Card>
//           </TabsContent>
//           <TabsContent value="extra">
//             <Card>
//               <CardHeader>
//                 <CardTitle>Extra Calculations</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <p>
//                   Characteristic Polynomial:{" "}
//                   {results.characteristicPolynomial || "N/A"}
//                 </p>
//                 <p>
//                   Power Method Result:{" "}
//                   {results.powerMethodResult !== undefined
//                     ? results.powerMethodResult
//                     : "N/A"}
//                 </p>
//                 <p>
//                   Inverse Power Method Result:{" "}
//                   {results.inversePowerMethodResult !== undefined
//                     ? results.inversePowerMethodResult
//                     : "N/A"}
//                 </p>
//               </CardContent>
//             </Card>
//           </TabsContent>
//         </Tabs>
//       </CardFooter>
//     </Card>
//   );
// }



// //

// // "use client"
// // import { useState } from "react";
// // import { Button } from "@/components/ui/button";
// // import { Input } from "@/components/ui/input";
// // import { Textarea } from "@/components/ui/textarea";
// // import {
// //   Card,
// //   CardContent,
// //   CardDescription,
// //   CardFooter,
// //   CardHeader,
// //   CardTitle,
// // } from "@/components/ui/card";
// // import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// // import { Label } from "@/components/ui/label";
// // import { LinearAlgebraSolver } from "./linear-algebra-solver";

// // export default function Component() {
// //   const [matrix, setMatrix] = useState("");
// //   const [vectorB1, setVectorB1] = useState("");
// //   const [vectorB2, setVectorB2] = useState("");
// //   const [results, setResults] = useState({
// //     eigenvalues: [] as number[],
// //     determinant: 0,
// //     uniqueness: "",
// //     conditionNumber: 0,
// //     polynomialEquation: "",
// //     powerMethodEigenvalue: 0,
// //     inverseEigenvalue: 0,
// //     solution1: [] as number[],
// //     solution2: [] as number[],
// //   });

// //   const handleSolve = () => {
// //     try {
// //       const solver = new LinearAlgebraSolver(matrix, vectorB1, vectorB2);

// //       setResults({
// //         eigenvalues: solver.calculateEigenvalues(),
// //         determinant: solver.calculateDeterminant(),
// //         uniqueness: solver.checkUniqueness(),
// //         conditionNumber: solver.calculateConditionNumber(),
// //         polynomialEquation: solver.getCharacteristicPolynomial(),
// //         powerMethodEigenvalue: solver.powerMethod(),
// //         inverseEigenvalue: solver.inversePowerMethod(),
// //         solution1: solver.solveSystem(solver.getVectorB1),
// //         solution2: solver.solveSystem(solver.getVectorB2),
// //       });
// //     } catch (error: any) {
// //       console.error("Error solving the system:", error.message);
// //       alert(`Error: ${error.message}`);
// //     }
// //   };

// //   return (
// //     <Card className="w-full max-w-4xl mx-auto">
// //       <CardHeader>
// //         <CardTitle>Linear Algebra Problem Solver</CardTitle>
// //         <CardDescription>
// //           Enter your 5x5 matrix and two b vectors to solve various linear
// //           algebra problems.
// //         </CardDescription>
// //       </CardHeader>
// //       <CardContent>
// //         <div className="space-y-4">
// //           <div>
// //             <Label htmlFor="matrix">
// //               5x5 Matrix A (comma-separated values)
// //             </Label>
// //             <Textarea
// //               id="matrix"
// //               placeholder="1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25"
// //               value={matrix}
// //               onChange={(e) => setMatrix(e.target.value)}
// //             />
// //           </div>
// //           <div className="flex space-x-4">
// //             <div className="flex-1">
// //               <Label htmlFor="vectorB1">Vector b1 (comma-separated)</Label>
// //               <Input
// //                 id="vectorB1"
// //                 placeholder="1,2,3,4,5"
// //                 value={vectorB1}
// //                 onChange={(e) => setVectorB1(e.target.value)}
// //               />
// //             </div>
// //             <div className="flex-1">
// //               <Label htmlFor="vectorB2">Vector b2 (comma-separated)</Label>
// //               <Input
// //                 id="vectorB2"
// //                 placeholder="6,7,8,9,10"
// //                 value={vectorB2}
// //                 onChange={(e) => setVectorB2(e.target.value)}
// //               />
// //             </div>
// //           </div>
// //           <Button onClick={handleSolve}>Solve</Button>
// //         </div>
// //       </CardContent>
// //       <CardFooter>
// //         <Tabs defaultValue="eigenvalues" className="w-full">
// //           <TabsList className="grid w-full grid-cols-3">
// //             <TabsTrigger value="eigenvalues">
// //               Eigenvalues & Determinant
// //             </TabsTrigger>
// //             <TabsTrigger value="condition">Condition Number</TabsTrigger>
// //             <TabsTrigger value="solutions">Solutions</TabsTrigger>
// //           </TabsList>
// //           <TabsContent value="eigenvalues">
// //             <Card>
// //               <CardHeader>
// //                 <CardTitle>Eigenvalues and Determinant</CardTitle>
// //               </CardHeader>
// //               <CardContent>
// //                 <p>Eigenvalues: {results.eigenvalues.join(", ")}</p>
// //                 <p>Determinant: {results.determinant}</p>
// //                 <p>Uniqueness: {results.uniqueness}</p>
// //                 <p>Characteristic Polynomial: {results.polynomialEquation}</p>
// //                 <p>Power Method Eigenvalue: {results.powerMethodEigenvalue}</p>
// //                 <p>
// //                   Inverse Power Method Eigenvalue: {results.inverseEigenvalue}
// //                 </p>
// //               </CardContent>
// //             </Card>
// //           </TabsContent>
// //           <TabsContent value="condition">
// //             <Card>
// //               <CardHeader>
// //                 <CardTitle>Condition Number</CardTitle>
// //               </CardHeader>
// //               <CardContent>
// //                 <p>Condition Number: {results.conditionNumber}</p>
// //                 <p>
// //                   Compare this with the condition number of the Hilbert matrix
// //                   for better understanding.
// //                 </p>
// //               </CardContent>
// //             </Card>
// //           </TabsContent>
// //           <TabsContent value="solutions">
// //             <Card>
// //               <CardHeader>
// //                 <CardTitle>Solutions to Ax = b</CardTitle>
// //               </CardHeader>
// //               <CardContent>
// //                 <p>Solution for b1: {results.solution1.join(", ")}</p>
// //                 <p>Solution for b2: {results.solution2.join(", ")}</p>
// //               </CardContent>
// //             </Card>
// //           </TabsContent>
// //         </Tabs>
// //       </CardFooter>
// //     </Card>
// //   );
// // }
