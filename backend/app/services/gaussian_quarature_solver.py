import numpy as np
from sympy import symbols, legendre, Matrix, diff
from numpy.polynomial import Polynomial
from scipy.integrate import quad
import matplotlib.pyplot as plt


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

    def lagrange_poly(self, x, i, roots_b):
        """Compute the Lagrange polynomial L_i(x) at point x."""
        L_i = 1
        for j in range(len(roots_b)):
            if i != j:
                L_i *= (x - roots_b[j]) / (roots_b[i] - roots_b[j])
        return L_i

    def legendre_polynomial(self, n):
        """Generate the Legendre polynomial of order n."""
        # Initialize base polynomials P_0(x) = 1 and P_1(x) = x
        P0 = Polynomial([1])  # P_0(x) = 1
        P1 = Polynomial([0, 1])  # P_1(x) = x

        for k in range(1, n):
            P_next = ((2 * k + 1) * Polynomial([0, 1]) * P1 - k * P0) / (k + 1)
            P0, P1 = P1, P_next

        return P1

    def symbolic_legendre_quadrature(self):
        """Compute roots and weights symbolically using Legendre polynomial."""
        # Generate the Legendre polynomial of order n
        Pn = self.legendre_polynomial(self.n)

        # Finding the coefficients for the companion matrix
        coefficients = Pn.coef[::-1]  # Reverse order for compatibility

        # Creating the companion matrix
        companion_matrix = np.diag(np.ones(self.n - 1), -1)
        companion_matrix[0, :] = -coefficients[1:] / coefficients[0]

        # Finding eigenvalues (roots)
        roots = np.sort(np.linalg.eigvals(companion_matrix))

        print(f"Roots of the {self.n}-th order Legendre polynomial:\n", roots)

        # Finding weights by integrating the Lagrange polynomials
        weights = []
        for i in range(len(roots)):
            # Integrate L_i(x) from -1 to 1 to compute weight w_i
            weight_i, _ = quad(self.lagrange_poly, -1, 1, args=(i, roots))
            weights.append(weight_i)

        weights = np.array(weights)

        return roots, weights

