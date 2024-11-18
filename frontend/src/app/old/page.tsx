"use client";
import React, { useState } from "react";
import { Container, Typography, Button, Grid, Box } from "@mui/material";
// import Header from "./components/Header";
// import Footer from "./components/Footer";
import MatrixUpload from "@/components/MatrixUpload";
import ResultDisplay from "@/components/ResultDisplay";
import {
  uploadMatrix,
  calculateAll,
  calculateDeterminant,
  calculateConditionNumber,
  computeEigenvalues,
  polynomialEquation,
  powerMethod,
  findSolution, // Import the function for solving Ax=b
} from "@/app/services/api";

function App() {
  const [matrixFile, setMatrixFile] = useState(null);
  const [results, setResults] = useState(null);

  // Upload matrix handler
  const handleMatrixUpload = async (uploadedFile) => {
    setMatrixFile(uploadedFile);
    try {
      await uploadMatrix(uploadedFile);
      console.log("Matrix uploaded successfully");
    } catch (error) {
      console.error("Error uploading matrix:", error);
    }
  };

  // Handle calculation based on API function
  const handleCalculation = async (calculationFunction) => {
    if (!matrixFile) {
      alert("Please upload a matrix file first.");
      return;
    }
    try {
      const response = await calculationFunction();
      setResults(response.data);
      console.log(response);
    } catch (error) {
      console.error("Error performing calculation:", error);
    }
  };

  // Handle solution calculation for Ax=b1 and Ax=b2
  const handleSolution = async (vectorChoice) => {
    if (!matrixFile) {
      alert("Please upload a matrix file first.");
      return;
    }
    try {
      const response = await findSolution(vectorChoice);
      setResults(response.data);
      console.log(response);
    } catch (error) {
      console.error("Error solving Ax=b:", error);
    }
  };

  return (
    <>
    {/* <Header /> */}
      <Container maxWidth="md">
        <Box my={4}>
          <Typography variant="h4" component="h1" gutterBottom>
            Numerical Methods Calculator
          </Typography>

          {/* Upload Sections */}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <MatrixUpload onFileUpload={handleMatrixUpload} />
            </Grid>
          </Grid>

          {/* Calculation Buttons */}
          <Box mt={4}>
            <Typography variant="h6" component="h2" gutterBottom>
              Perform Calculations
            </Typography>
            <Grid container spacing={2}>
              {/* "Calculate All" Button */}
              <Grid item xs={12} sm={6} md={4}>
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  onClick={() => handleCalculation(calculateAll)}
                >
                  Calculate All
                </Button>
              </Grid>

              {/* Determinant Button */}
              <Grid item xs={12} sm={6} md={4}>
                <Button
                  fullWidth
                  variant="contained"
                  color="secondary"
                  onClick={() => handleCalculation(calculateDeterminant)}
                >
                  Determinant
                </Button>
              </Grid>

              {/* Condition Number Button */}
              <Grid item xs={12} sm={6} md={4}>
                <Button
                  fullWidth
                  variant="contained"
                  color="secondary"
                  onClick={() => handleCalculation(calculateConditionNumber)}
                >
                  Condition Number
                </Button>
              </Grid>

              {/* Compute Eigenvalues Button */}
              <Grid item xs={12} sm={6} md={4}>
                <Button
                  fullWidth
                  variant="contained"
                  color="secondary"
                  onClick={() => handleCalculation(computeEigenvalues)}
                >
                  Compute Eigenvalues
                </Button>
              </Grid>

              {/* Polynomial Equation Button */}
              <Grid item xs={12} sm={6} md={4}>
                <Button
                  fullWidth
                  variant="contained"
                  color="secondary"
                  onClick={() => handleCalculation(polynomialEquation)}
                >
                  Polynomial Equation
                </Button>
              </Grid>

              {/* Power Method Button */}
              <Grid item xs={12} sm={6} md={4}>
                <Button
                  fullWidth
                  variant="contained"
                  color="secondary"
                  onClick={() => handleCalculation(powerMethod)}
                >
                  Power Method
                </Button>
              </Grid>

              {/* Solve Ax = b1 Button */}
              <Grid item xs={12} sm={6} md={4}>
                <Button
                  fullWidth
                  variant="contained"
                  color="secondary"
                  onClick={() => handleSolution("b1")}
                >
                  Solve Ax = b1
                </Button>
              </Grid>

              {/* Solve Ax = b2 Button */}
              <Grid item xs={12} sm={6} md={4}>
                <Button
                  fullWidth
                  variant="contained"
                  color="secondary"
                  onClick={() => handleSolution("b2")}
                >
                  Solve Ax = b2
                </Button>
              </Grid>
            </Grid>
          </Box>

          {/* Display Results */}
          <Box mt={4}>
            <ResultDisplay results={results} />
          </Box>
        </Box>
      </Container>
      {/* <Footer /> */}
    </>
  );
}

export default App;
