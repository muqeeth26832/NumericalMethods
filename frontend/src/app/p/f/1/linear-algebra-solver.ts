// import { create, all } from "mathjs";

// const math = create(all);

// export class LinearAlgebraSolver {
//   private matrix: math.Matrix;
//   private vectorB1: math.Matrix;
//   private vectorB2: math.Matrix;

//   constructor(matrixString: string, vectorB1String: string, vectorB2String: string) {
//     this.matrix = this.parseMatrix(matrixString);
//     this.vectorB1 = this.parseVector(vectorB1String);
//     this.vectorB2 = this.parseVector(vectorB2String);

//     this.validateInputs();
//   }

//   // Parses a comma-separated string into a 5x5 matrix.
//   private parseMatrix(matrixString: string): math.Matrix {
//     const values = matrixString.split(",").map(Number);
//     if (values.length !== 25 || values.some((val) => isNaN(val))) {
//       throw new Error("Matrix input must contain exactly 25 numeric values.");
//     }
//     return math.matrix(math.reshape(values, [5, 5]));
//   }

//   // Parses a comma-separated string into a 5-element vector.
//   private parseVector(vectorString: string): math.Matrix {
//     const values = vectorString.split(",").map(Number);
//     if (values.length !== 5 || values.some((val) => isNaN(val))) {
//       throw new Error("Vector input must contain exactly 5 numeric values.");
//     }
//     return math.matrix(values);
//   }

//   // Validates that the matrix is 5x5 and the vectors are 5x1.
//   private validateInputs(): void {
//     if (this.matrix.size()[0] !== 5 || this.matrix.size()[1] !== 5) {
//       throw new Error("Matrix must be 5x5.");
//     }
//     if (this.vectorB1.size()[0] !== 5 || this.vectorB2.size()[0] !== 5) {
//       throw new Error("Each vector must have exactly 5 elements.");
//     }
//   }

//   // Calculates eigenvalues using mathjs' eigs method.
//   calculateEigenvalues(): number[] {
//     const { values } = math.eigs(this.matrix);
//     return values.map((val: math.Complex | number) =>
//       typeof val === "object" ? Math.round(val.re * 1e10) / 1e10 : val
//     );
//   }

//   // Calculates the determinant of the matrix.
//   calculateDeterminant(): number {
//     return Math.round(math.det(this.matrix) * 1e10) / 1e10;
//   }

//   // Checks if the system has a unique solution based on the determinant.
//   checkUniqueness(): string {
//     const det = this.calculateDeterminant();
//     if (math.abs(det) < 1e-10) {
//       return "The system is singular (det ≈ 0). It may have infinite solutions or no solution.";
//     } else {
//       return `The system has a unique solution. Determinant = ${det.toExponential(4)}`;
//     }
//   }

//   // Calculates the condition number of the matrix.
//   calculateConditionNumber(): number {
//     return Math.round(math.cond(this.matrix) * 1e4) / 1e4;
//   }

//   // Computes the characteristic polynomial of the matrix.
//   getCharacteristicPolynomial(): string {
//     const coeffs = math
//       .characteristic(this.matrix)
//       .coeffs.map((c: number) => Math.round(c * 1e4) / 1e4);

//     let polynomial = coeffs
//       .map((coeff, idx) => {
//         const power = coeffs.length - 1 - idx;
//         if (coeff === 0) return "";
//         const sign = coeff > 0 && idx !== 0 ? " + " : coeff < 0 ? " - " : "";
//         const absCoeff = Math.abs(coeff);
//         const term =
//           power === 0
//             ? `${absCoeff}`
//             : power === 1
//             ? `${absCoeff !== 1 ? absCoeff : ""}λ`
//             : `${absCoeff !== 1 ? absCoeff : ""}λ^${power}`;
//         return `${sign}${term}`;
//       })
//       .join("");

//     return polynomial.trim() || "0";
//   }

//   // Power method to calculate the largest eigenvalue.
//   powerMethod(iterations: number = 100, tolerance: number = 1e-10): number {
//     let v = math.ones(5, 1) as math.Matrix;
//     let lambda = 0;
//     for (let i = 0; i < iterations; i++) {
//       const vNew = math.multiply(this.matrix, v);
//       const lambdaNew = math.norm(vNew, "inf");
//       v = math.divide(vNew, lambdaNew) as math.Matrix;
//       if (math.abs(lambdaNew - lambda) < tolerance) {
//         return lambdaNew;
//       }
//       lambda = lambdaNew;
//     }
//     return lambda;
//   }

//   // Inverse power method to calculate the smallest eigenvalue.
//   inversePowerMethod(iterations: number = 100, tolerance: number = 1e-10): number {
//     const invA = math.inv(this.matrix);
//     return 1 / this.powerMethod(iterations, tolerance);
//   }

//   // Solves the system Ax = b for a given vector b.
//   solveSystem(b: math.Matrix): number[] {
//     return (math.lusolve(this.matrix, b) as math.Matrix).toArray() as number[];
//   }

//   // Compares the condition number of the matrix with a 5x5 Hilbert matrix.
//   compareWithHilbertMatrix(): string {
//     const hilbertMatrix = math.matrix(
//       Array.from({ length: 5 }, (_, i) =>
//         Array.from({ length: 5 }, (_, j) => 1 / (i + j + 1))
//       )
//     );
//     const hilbertCondition = math.cond(hilbertMatrix);
//     const matrixCondition = this.calculateConditionNumber();
//     return `Matrix Condition Number: ${matrixCondition.toExponential(4)}
// Hilbert Matrix Condition Number: ${hilbertCondition.toExponential(4)}
// Ratio (Matrix / Hilbert): ${(matrixCondition / hilbertCondition).toExponential(4)}`;
//   }
// }

