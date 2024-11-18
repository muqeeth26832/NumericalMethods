# Numerical Methods Project: 5x5 Matrix Operations

## Overview
This project focuses on performing numerical computations on a 5x5 matrix using techniques such as LU decomposition, determinant calculation, condition number evaluation, eigenvalue computation, and solving linear systems. The project is designed to build a deeper understanding of numerical methods and their applications in solving real-world problems.

## Objectives
1. **Input Handling**: Read a 5x5 matrix from a file (CSV format).
2. **Matrix Operations**:
   - **Determinant Calculation**: Compute the determinant of the matrix.
   - **Condition Number**: Evaluate the condition number of the matrix to analyze its sensitivity to numerical errors.
   - **LU Decomposition**: Decompose the matrix into its lower and upper triangular forms for further computations.
   - **Eigenvalues**: Compute the eigenvalues of the matrix.
3. **System of Linear Equations**:
   - Solve a linear system \( Ax = b \) using LU decomposition, where \( b \) is a given vector.
4. **Visualization**:
   - Display results in a clear and structured format.
   - Support complex eigenvalues in the output.

## Requirements
- **Programming Language**: Python
- **Libraries**: 
  - `NumPy` for matrix manipulations and numerical calculations.
  - `SciPy` for advanced computations like eigenvalues and LU decomposition.
- **Input Format**: CSV file containing a 5x5 matrix.

## Implementation Steps
1. **Input Parsing**:
   - Create a script to load the 5x5 matrix from a CSV file.
   - Validate the input format and ensure the matrix is square (5x5).

2. **Determinant Calculation**:
   - Use NumPy's `linalg.det()` to calculate the determinant.

3. **Condition Number**:
   - Compute the condition number using the formula \( \text{cond}(A) = ||A|| \cdot ||A^{-1}|| \).

4. **LU Decomposition**:
   - Implement LU decomposition using SciPy's `scipy.linalg.lu()` or NumPy's functions.

5. **Eigenvalues**:
   - Calculate eigenvalues using `linalg.eigvals()`.

6. **Solving \( Ax = b \)**:
   - Define a vector \( b \) and solve the system using the LU-decomposed matrices.

7. **Output Results**:
   - Ensure outputs are formatted with appropriate precision, especially for eigenvalues and solutions of \( Ax = b \).

## Timeline
- **Deadline**: Two weeks from the project announcement date.
- **Group Size**: 1 to 6 students.

## Challenges and Learnings
- Handling floating-point errors during calculations.
- Understanding the stability of algorithms like LU decomposition.
- Interpreting eigenvalues, especially when they are complex.

## Deliverables
1. Source code for all computations.
2. CSV file used for testing.
3. A report explaining:
   - Steps taken in implementation.
   - Observations from the results.
   - Challenges faced and how they were resolved.

## Future Extensions
- Extend to larger matrices (e.g., 10x10) or support additional operations like singular value decomposition (SVD).
- Develop a user-friendly interface for matrix uploads and computations.

---

This project serves as an excellent introduction to numerical linear algebra, combining theoretical concepts with practical implementation.
