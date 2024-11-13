import numpy as np
from sympy import symbols, legendre, Matrix

class GaussianQuadratureSolver:
    def __init__(self, n: int = 64):
        self.n = n

    def gauss_legendre_quadrature(self):
        """Compute roots and weights using Golub-Welsch theorem."""
        J = np.zeros((self.n, self.n))
        for i in range(1, self.n):
            J[i, i - 1] = J[i - 1, i] = np.sqrt(i * i / (4 * i * i - 1))

        eigenvalues, eigenvectors = np.linalg.eigh(J)
        roots = eigenvalues
        weights = 2 * (eigenvectors[0, :] ** 2)
        return roots, weights

    def symbolic_legendre_quadrature(self):
        """Compute roots and weights symbolically using Legendre polynomial."""
        x = symbols('x')
        P_n = legendre(self.n, x)
        coeffs = P_n.as_poly().all_coeffs()
        order = len(coeffs) - 1

        # Construct companion matrix
        companion_matrix = Matrix(order, order, lambda i, j: 1 if j == i + 1 else 0)
        for j in range(order):
            companion_matrix[order - 1, j] = -coeffs[j + 1] / coeffs[0]

        # Calculate eigenvalues (roots)
        companion_matrix = companion_matrix.evalf()
        eigenvalues = list(companion_matrix.eigenvals().keys())
        roots = sorted([float(val) for val in eigenvalues])

        # Weights calculation (requires numerical integration of Lagrange polynomials)
        weights = []
        for root in roots:
            weight = 2 / ((1 - root**2) * (P_n.diff(x).subs(x, root))**2)
            weights.append(float(weight))

        return roots, weights
