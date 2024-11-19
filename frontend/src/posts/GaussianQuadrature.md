# Gaussian Quadrature Using Eigenvalue-Based and Lagrangian Methods

This document outlines the computation of Gaussian quadrature nodes (roots) and weights using two distinct methods: 
1. Using the eigenvalues of the Jacobi matrix and norms of eigenvectors for weights.
2. Using the eigenvalues of the companion matrix and Lagrangian interpolation for weights.

Finally, we visualize the weights against the roots for \( n = 64 \) for both methods.

---

## **1. Gaussian Quadrature Using Jacobi Matrix**

### **Theory**:
- The Gauss-Legendre quadrature is used to approximate definite integrals of the form:
  \[
  \int_{-1}^{1} f(x) dx \approx \sum_{i=1}^{n} w_i f(x_i),
  \]
  where:
  - \( x_i \) are the **nodes** (roots of the Legendre polynomial of degree \( n \)).
  - \( w_i \) are the **weights** computed using norms of the eigenvectors.

### **Steps**:
1. **Jacobi Matrix Construction**:
   - The Jacobi matrix for Gauss-Legendre quadrature is symmetric tridiagonal:
     \[
     J = 
     \begin{bmatrix}
     0 & \sqrt{\frac{1}{3}} & 0 & \cdots & 0 \\
     \sqrt{\frac{1}{3}} & 0 & \sqrt{\frac{2}{5}} & \cdots & 0 \\
     0 & \sqrt{\frac{2}{5}} & 0 & \cdots & 0 \\
     \vdots & \vdots & \vdots & \ddots & \sqrt{\frac{n-1}{2n-1}} \\
     0 & 0 & 0 & \sqrt{\frac{n-1}{2n-1}} & 0
     \end{bmatrix}.
     \]

2. **Eigenvalue Problem**:
   - Compute the eigenvalues \( \lambda_i \) of the Jacobi matrix \( J \), which represent the roots \( x_i \) of the Legendre polynomial.

3. **Weights**:
   - Compute the weights \( w_i \) as the square of the first component of the normalized eigenvectors \( v_i \):
     \[
     w_i = 2 \cdot v_{i,1}^2.
     \]

---

## **2. Gaussian Quadrature Using Companion Matrix**

### **Theory**:
- The companion matrix is another method to find roots of polynomials:
  \[
  C = 
  \begin{bmatrix}
  0 & 1 & 0 & \cdots & 0 \\
  0 & 0 & 1 & \cdots & 0 \\
  \vdots & \vdots & \vdots & \ddots & \vdots \\
  0 & 0 & 0 & \cdots & 1 \\
  -\frac{a_0}{a_n} & -\frac{a_1}{a_n} & -\frac{a_2}{a_n} & \cdots & -\frac{a_{n-1}}{a_n}
  \end{bmatrix},
  \]
  where \( a_i \) are the coefficients of the Legendre polynomial of degree \( n \).

### **Steps**:
1. **Construct the Legendre Polynomial**:
   - Use recurrence relations or symbolic computation (e.g., `sympy`) to generate the polynomial.

2. **Companion Matrix**:
   - Construct the companion matrix \( C \) for the polynomial and compute its eigenvalues to determine the roots.

3. **Weights Using Lagrangian Interpolation**:
   - Define the weights as:
     \[
     w_i = \int_{-1}^{1} \prod_{j \neq i} \frac{(x - x_j)}{(x_i - x_j)} dx.
     \]
   - Approximate or compute using numerical integration.

---

## **3. Visualization: Weights vs. Roots for \( n = 64 \)**

1. **Data Collection**:
   - Compute roots and weights using both methods (Jacobi matrix and companion matrix).
   - Store results for comparison.

2. **Plot**:
   - Use a Python plotting library (e.g., `matplotlib`) to plot weights against roots for each method.

---

## **Python Code Outline**

### **Jacobi Matrix Method**
```python
import numpy as np
import matplotlib.pyplot as plt

def jacobi_matrix(n):
    diag = np.zeros(n)
    subdiag = np.sqrt(np.arange(1, n) / (2 * np.arange(1, n) + 1))
    J = np.diag(subdiag, -1) + np.diag(subdiag, 1)
    return J

def gaussian_quadrature_jacobi(n):
    J = jacobi_matrix(n)
    eigenvalues, eigenvectors = np.linalg.eigh(J)
    weights = 2 * eigenvectors[0, :]**2
    return eigenvalues, weights

# Compute roots and weights
n = 64
roots_jacobi, weights_jacobi = gaussian_quadrature_jacobi(n)
```

### **Companion Matrix Method**
```python
from sympy import legendre, Poly, symbols
from scipy.integrate import quad

def companion_matrix(n):
    x = symbols('x')
    poly = Poly(legendre(n, x))
    coeffs = poly.all_coeffs()
    size = len(coeffs) - 1
    C = np.zeros((size, size))
    C[1:, :-1] = np.eye(size - 1)
    C[:, -1] = -np.array(coeffs[:-1]) / coeffs[-1]
    return C

def weights_lagrangian(roots, n):
    weights = []
    for i, root in enumerate(roots):
        product = np.prod([(root - roots[j]) for j in range(len(roots)) if i != j])
        weight, _ = quad(lambda x: np.prod([(x - roots[j]) / (root - roots[j]) for j in range(len(roots)) if i != j]), -1, 1)
        weights.append(weight)
    return np.array(weights)

# Compute roots and weights
C = companion_matrix(n)
roots_companion = np.linalg.eigvals(C)
weights_companion = weights_lagrangian(roots_companion, n)
```

### **Plot Weights vs. Roots**
```python
plt.figure(figsize=(10, 6))
plt.plot(roots_jacobi, weights_jacobi, 'o', label="Jacobi Method", color="blue")
plt.plot(roots_companion, weights_companion, 'x', label="Companion Matrix", color="red")
plt.xlabel("Roots")
plt.ylabel("Weights")
plt.title("Weights vs. Roots for n=64")
plt.legend()
plt.grid()
plt.show()
```

---

## **Expected Results**

1. **Roots and Weights**:
   - Both methods should produce identical or very similar roots and weights.

2. **Plot**:
   - A smooth distribution of weights across roots with both methods aligning closely.

---

This approach demonstrates the practical implementation of Gaussian quadrature and offers insights into advanced numerical integration techniques.
