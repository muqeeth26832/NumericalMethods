# Numerical Methods Project: Plotting Roots and Weights using Jacobi Polynomials

## Overview
This project focuses on implementing Jacobi polynomials to compute and visualize their roots and weights. These roots and weights are essential in numerical integration techniques like Gaussian quadrature, which approximates the integral of a function using weighted sums of function values at specified points.

## Objectives
1. **Jacobi Polynomial Computation**:
   - Generate Jacobi polynomials \( P^{(\alpha, \beta)}_n(x) \) for given values of \( \alpha \), \( \beta \), and \( n \).
2. **Roots and Weights Calculation**:
   - Compute the roots of the Jacobi polynomials.
   - Determine the corresponding weights for Gaussian quadrature.
3. **Visualization**:
   - Plot the roots of the polynomials on a number line.
   - Create visualizations to compare roots and weights for different parameter values.
4. **Numerical Integration**:
   - Use the calculated roots and weights to approximate integrals of test functions.

## Requirements
- **Programming Language**: Python
- **Libraries**:
  - `NumPy` for numerical computations.
  - `SciPy` for solving polynomial roots and weights.
  - `Matplotlib` for plotting the results.
- **Input Parameters**: \( \alpha, \beta, n \) (user-specified or default values).

## Implementation Steps

### 1. **Jacobi Polynomial Generation**:
- Generate Jacobi polynomials using the recurrence relation:
  \[
  (1 - x^2) P^{(\alpha, \beta)}_n(x) = (n + \alpha + \beta)(n + \alpha + \beta + 1) P^{(\alpha, \beta)}_{n-1}(x) - n(n + \alpha + \beta + 1) P^{(\alpha, \beta)}_{n-2}(x).
  \]
- Implement this recurrence relation programmatically or use SciPy’s `orthogonal.jacobi` functions.

### 2. **Roots Computation**:
- Solve \( P^{(\alpha, \beta)}_n(x) = 0 \) using numerical root-finding methods (e.g., `numpy.roots()` or `scipy.optimize.newton()`).

### 3. **Weights Calculation**:
- Calculate weights \( w_i \) for Gaussian quadrature using the formula:
  \[
  w_i = \frac{2^{\alpha + \beta + 1} \Gamma(\alpha + n + 1) \Gamma(\beta + n + 1)}{n! \Gamma(n + \alpha + \beta + 1)} \frac{2}{(1 - x_i^2) [P'_n(x_i)]^2},
  \]
  where \( x_i \) are the roots of \( P^{(\alpha, \beta)}_n(x) \).

### 4. **Numerical Integration**:
- Approximate integrals using:
  \[
  \int_{-1}^{1} f(x) (1 - x)^\alpha (1 + x)^\beta dx \approx \sum_{i=1}^n w_i f(x_i).
  \]

### 5. **Visualization**:
- Plot the roots on the x-axis to show their distribution.
- Create bar charts or line plots for the weights.
- Compare the roots and weights for different \( \alpha \), \( \beta \), and \( n \) values.

## Challenges
1. Managing numerical instability for large \( n \).
2. Understanding the impact of \( \alpha \) and \( \beta \) on the polynomial's shape and root distribution.
3. Optimizing root-finding algorithms for efficiency.

## Deliverables
1. **Python Code**:
   - Functions to generate Jacobi polynomials.
   - Scripts to compute roots and weights.
   - Code for numerical integration using Gaussian quadrature.
2. **Visualizations**:
   - Plots showing roots and weights.
   - Comparative analysis for varying parameters.
3. **Report**:
   - Explanation of Jacobi polynomials and their importance.
   - Steps for computation and visualization.
   - Results and insights from the plots.

## Extensions
1. **Higher-Dimensional Integration**:
   - Extend to multivariate integrals using product rules.
2. **Applications**:
   - Apply Gaussian quadrature to physics or engineering problems.
3. **UI Development**:
   - Build an interface to input parameters \( \alpha, \beta, n \) and display results interactively.

---

This project not only demonstrates the practical utility of Jacobi polynomials but also provides a foundation for advanced topics in numerical integration and computational mathematics.
