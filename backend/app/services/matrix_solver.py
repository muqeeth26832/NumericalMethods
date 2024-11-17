import numpy as np
from scipy.linalg import hilbert, lu

"""
This script is part of a bigger project on GitHub.
It handles matrix calculations such as LU decomposition, eigenvalue computation, 
solving linear systems, and condition number determination, with improvements for edge cases.
"""


class MatrixSolver:
    def __init__(self, matrix, b1, b2):
        """
        Initializes the MatrixSolver class with the given matrix and two vectors b1, b2.

        Args:
        - matrix: The coefficient matrix A.
        - b1, b2: Two different right-hand side vectors for the linear systems Ax = b1, Ax = b2.
        """
        self.A = np.array(matrix, dtype=float)
        self.b1 = np.array(b1, dtype=float)
        self.b2 = np.array(b2, dtype=float)
        self.n = len(matrix)  # Size of the matrix (assumed to be square)
        self.L = None  # Lower triangular matrix after LU decomposition
        self.U = None  # Upper triangular matrix after LU decomposition
        self.P = None  # Permutation matrix after LU decomposition
        self.eigenvalues = None  # To store eigenvalues after computation

    def lu_decomposition(self):
        """
        Perform LU decomposition with pivoting using scipy's lu function.
        LU decomposition is of the form PA = LU.
        Raises:
        - ValueError: If the matrix is singular (determinant is zero).
        """
        self.P, self.L, self.U = lu(self.A)

        # Check if the matrix is singular by looking at the determinant of U
        if np.isclose(np.linalg.det(self.U), 0):
            raise ValueError("Matrix is singular, LU decomposition failed.")

    def eigenvalues_via_lu(self, max_iterations=10000, tol=1e-3):
        """
        Calculate the eigenvalues of the matrix using an iterative LU decomposition method.

        Args:
        - max_iterations: Maximum number of iterations for convergence.
        - tol: Tolerance for convergence.

        Returns:
        - The eigenvalues of the matrix.
        """
        A = self.A.copy()
        for _ in range(max_iterations):
            # Perform LU decomposition
            P, L, U = lu(A)

            # Recompute A as UL (ignoring the permutation matrix P)
            A_new = np.dot(U, L)

            # Check for convergence by comparing diagonal elements
            if np.allclose(np.diag(A), np.diag(A_new), atol=tol):
                break

            A = A_new

        # If no convergence, fallback to numpy's eig method
        if not np.allclose(np.diag(A), np.diag(A_new), atol=tol):
            self.eigenvalues = np.linalg.eigvals(self.A)
        else:
            self.eigenvalues = np.diag(A)

        return self.eigenvalues

    def polynomial_equation(self):
        """
        Calculate the characteristic polynomial of the matrix based on its eigenvalues.

        Returns:
        - The coefficients of the characteristic polynomial.
        """
        if self.eigenvalues is None:
            self.eigenvalues_via_lu()

        # Use numpy's poly function to get polynomial coefficients from eigenvalues
        coefficients = np.poly(self.eigenvalues)
        return coefficients

    def determinant(self):
        """
        Calculate the determinant of the matrix using its eigenvalues.

        Returns:
        - The determinant of the matrix.
        """
        if self.eigenvalues is None:
            self.eigenvalues_via_lu()

        return np.prod(self.eigenvalues)

    def is_unique(self):
        """
        Check if the matrix has a unique solution for the system Ax = b.
        A unique solution exists if the determinant is non-zero.

        Returns:
        - True if the matrix has a unique solution, False otherwise.
        """
        det = self.determinant()
        return (
            abs(det) > 1e-10
        )  # Use a small threshold to account for floating-point precision

    def condition_number_via_eigenvalues(self):
        """
        Compute the condition number of the matrix using its eigenvalues.

        Returns:
        - The condition number of the matrix.
        - Inf if the matrix is singular or ill-conditioned.
        """
        if self.eigenvalues is None:
            self.eigenvalues_via_lu()

        # Get the absolute values of the eigenvalues
        abs_eigenvalues = np.abs(self.eigenvalues)

        # Check if the smallest eigenvalue is close to zero (use a threshold)
        min_eigenvalue = np.min(abs_eigenvalues)
        if min_eigenvalue < 1e-10:
            return float(
                "inf"
            )  # Infinite condition number means the matrix is ill-conditioned

        # Compute the condition number as the ratio of the largest to smallest eigenvalue
        return np.max(abs_eigenvalues) / min_eigenvalue

    def compare_with_hilbert(self):
        """
        Compare the condition number of the matrix with that of a Hilbert matrix of the same size.

        Returns:
        - The condition number of the matrix and the condition number of the Hilbert matrix.
        """
        hilbert_matrix = hilbert(self.n)
        hilbert_cond = np.linalg.cond(hilbert_matrix)
        our_cond = self.condition_number_via_eigenvalues()
        return our_cond, hilbert_cond

    def jordan_inverse(self):
        """
        Compute the inverse of the matrix using a simplified Jordan decomposition method.

        Returns:
        - The inverse of the matrix.
        """
        if self.eigenvalues is None:
            self.eigenvalues_via_lu()

        # Create the inverse of the diagonal matrix
        D = np.diag(1 / self.eigenvalues)

        # Compute the eigenvectors
        P = np.linalg.eig(self.A)[1]

        # Return the inverse using Jordan form
        return np.dot(np.dot(P, D), np.linalg.inv(P))

    def solve_system(self, b):
        """
        Solve the system of linear equations Ax = b using LU decomposition.

        Args:
        - b: The right-hand side vector.

        Returns:
        - The solution vector x.
        """
        if self.L is None or self.U is None:
            self.lu_decomposition()

        # Forward substitution for Ly = Pb
        y = np.linalg.solve(self.L, np.dot(self.P, b))

        # Back substitution for Ux = y
        return np.linalg.solve(self.U, y)

    def compare_eigenvalues(self):
        """
        Compare the eigenvalues obtained from LU decomposition with those from the power method.

        Returns:
        - Eigenvalues from LU decomposition, power method, and inverse power method.
        """
        lu_eigenvalues = self.eigenvalues_via_lu()
        power_eigenvalue = self.power_method()
        inverse_power_eigenvalue = self.power_method(inverse=True)

        return lu_eigenvalues, power_eigenvalue, inverse_power_eigenvalue

    def solve_multiple_b(self):
        """
        Solve the linear systems Ax = b1 and Ax = b2.
        Determine if the solution is unique, infinite, or non-existent for each system.

        Returns:
        - A dictionary with solutions and their types for each system.
        """
        results = {}

        for i, b in enumerate([self.b1, self.b2], start=1):
            if self.is_unique():
                # If the determinant is non-zero, the system has a unique solution
                x = self.solve_system(b)
                results[f"Ax = b{i}"] = {
                    "type": "unique solution",
                    "solution": x.tolist(),
                }
            else:
                # The system might have either infinite solutions or no solution
                rank_A = np.linalg.matrix_rank(self.A)
                aug_A = np.column_stack((self.A, b))  # Augmented matrix [A|b]
                rank_aug_A = np.linalg.matrix_rank(aug_A)

                if rank_A == rank_aug_A:
                    # If ranks are equal, there are infinite solutions
                    results[f"Ax = b{i}"] = {"type": "infinite solutions"}
                else:
                    # If ranks differ, there is no solution
                    results[f"Ax = b{i}"] = {"type": "no solutions"}

        return results


# new

import numpy as np
from scipy.linalg import lu, hilbert


class AccurateMatrixSolver:
    def __init__(self, matrix, b1, b2):
        self.A = np.array(matrix, dtype=float)
        self.b1 = np.array(b1, dtype=float)
        self.b2 = np.array(b2, dtype=float)
        self.n = len(matrix)  # Size of the matrix (assumed to be square)
        self.L = None  # Lower triangular matrix after LU decomposition
        self.U = None  # Upper triangular matrix after LU decomposition
        self.P = None  # Permutation matrix after LU decomposition
        self.eigenvalues = None  # To store eigenvalues after computation

    def lu_decomposition(self):
        """
        Perform LU decomposition with pivoting using scipy's lu function.
        Returns:
        - dict: Contains "P", "L", "U" matrices or an error message.
        """
        if np.isclose(np.linalg.det(self.A), 0):
            return {"error": "Matrix is singular, LU decomposition failed."}
        try:
            self.P, self.L, self.U = lu(self.A)
            return {"P": self.P.tolist(), "L": self.L.tolist(), "U": self.U.tolist()}
        except Exception as e:
            return {"error": f"LU decomposition failed: {str(e)}"}

    def eigenvalues_via_shift(self, shift=0.1):
        """
        Calculate the eigenvalues by applying a shift if the matrix is singular.
        Returns:
        - list or dict: Eigenvalues or an error message.
        """
        try:
            shifted_A = self.A + shift * np.eye(self.n)
            self.eigenvalues = np.linalg.eigvals(shifted_A)
            return (self.eigenvalues - shift).tolist()
        except Exception as e:
            return {"error": f"Eigenvalue calculation failed: {str(e)}"}

    def polynomial_equation(self):
        """
        Calculate the characteristic polynomial of the matrix based on its eigenvalues.
        Returns:
        - list or dict: Polynomial coefficients or an error message.
        """
        if self.eigenvalues is None:
            result = self.eigenvalues_via_shift()
            if "error" in result:
                return result
        try:
            coefficients = np.poly(self.eigenvalues)
            return coefficients.tolist()
        except Exception as e:
            return {"error": f"Polynomial calculation failed: {str(e)}"}

    def determinant(self):
        """
        Calculate the determinant of the matrix.
        Returns:
        - float or dict: Determinant value or an error message.
        """
        try:
            return np.linalg.det(self.A)
        except Exception as e:
            return {"error": f"Determinant calculation failed: {str(e)}"}

    def is_unique(self):
        """
        Check if the matrix has a unique solution for the system Ax = b.
        Returns:
        - bool or dict: True if unique solution, else an error message.
        """
        try:
            det = self.determinant()
            return abs(det) > 1e-10
        except Exception as e:
            return {"error": f"Uniqueness check failed: {str(e)}"}

    def condition_number_via_eigenvalues(self):
        """
        Computes the condition number via the eigenvalues of the matrix.
        Assumes the matrix is square.
        """
        eigenvalues = np.linalg.eigvals(self.A)
        if np.min(np.abs(eigenvalues)) == 0:
            return "inf"
        return np.max(np.abs(eigenvalues)) / np.min(np.abs(eigenvalues))

    def compare_with_hilbert(self):
        """
        Compare the condition number of the matrix with that of a Hilbert matrix of the same size.
        Returns:
        - dict: Condition numbers or an error message.
        """
        try:
            # Ensure that n is a valid size for the Hilbert matrix
            if self.n <= 1:
                raise ValueError(
                    "Matrix size must be greater than 1 to compare with Hilbert matrix"
                )
            # Generate the Hilbert matrix of the same size
            hilbert_matrix = hilbert(self.n)

            # Calculate the condition number of the Hilbert matrix
            hilbert_cond = np.linalg.cond(hilbert_matrix)

            # Calculate the condition number of the current matrix via eigenvalues
            our_cond = self.condition_number_via_eigenvalues()

            # Return the comparison result
            return {
                "matrix_condition_number": our_cond,
                "hilbert_condition_number": hilbert_cond,
            }
        except Exception as e:
            return {"error": f"Condition comparison failed: {str(e)}"}

    def power_method(self, inverse=False, max_iterations=1000, tol=1e-3, shift=None):
        """
        Compute the largest eigenvalue using the power method or inverse power method.
        Returns:
        - float or dict: Eigenvalue or an error message.
        """
        try:
            if shift is None:
                shift = 0.1 if np.any(np.isclose(np.diag(self.A), 0)) else 0.0

            A_shifted = self.A + shift * np.eye(self.n) if shift != 0.0 else self.A
            A = np.linalg.inv(A_shifted) if inverse else A_shifted

            x = np.random.rand(self.n)
            x /= np.linalg.norm(x)

            eigenvalue = None
            for _ in range(max_iterations):
                x_new = np.dot(A, x)
                new_eigenvalue = np.dot(x_new, x) / np.dot(x, x)
                x_new /= np.linalg.norm(x_new)

                if np.linalg.norm(x_new - x) < tol:
                    eigenvalue = new_eigenvalue
                    break
                x = x_new

            return (
                eigenvalue - shift
                if eigenvalue
                else {"error": "Power method did not converge"}
            )
        except Exception as e:
            return {"error": f"Power method failed: {str(e)}"}

    def solve_system(self, b):
        """
        Solve the system of linear equations Ax = b.
        Returns:
        - dict: Solution or error message.
        """
        try:
            if self.L is None or self.U is None:
                if np.isclose(self.determinant(), 0):
                    rank_A = np.linalg.matrix_rank(self.A)
                    rank_aug_A = np.linalg.matrix_rank(np.column_stack((self.A, b)))
                    if rank_A == rank_aug_A:
                        return {"type": "infinite solutions"}
                    else:
                        return {"type": "no solutions"}
                else:
                    self.lu_decomposition()

            y = np.linalg.solve(self.L, np.dot(self.P, b))
            return np.linalg.solve(self.U, y)
        except Exception as e:
            return {"error": f"System solving failed: {str(e)}"}

    def solve_multiple_b(self):
        """
        Solve the linear systems Ax = b1 and Ax = b2.
        Returns:
        - dict: Results for both systems or error messages.
        """
        results = {}
        for i, b in enumerate([self.b1, self.b2], start=1):
            result = self.solve_system(b)
            results[f"Ax = b{i}"] = result
        return results
