import numpy as np
from scipy.linalg import hilbert, lu

class AccurateMatrixSolver:
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
        Raises:
        - ValueError: If the matrix is singular (determinant is zero).
        """
        self.P, self.L, self.U = lu(self.A)

        # Check if the matrix is singular by looking at the determinant of U
        if np.isclose(np.linalg.det(self.U), 0):
            raise ValueError("Matrix is singular, LU decomposition failed.")

    def eigenvalues_via_lu(self):
        """
        Calculate the eigenvalues using NumPy's eig method.
        Returns:
        - The eigenvalues of the matrix.
        """
        self.eigenvalues = np.linalg.eigvals(self.A)
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
        Calculate the determinant of the matrix using NumPy's det function.
        Returns:
        - The determinant of the matrix.
        """
        return np.linalg.det(self.A)

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
        Compute the condition number of the matrix using NumPy's cond function.

        Returns:
        - The condition number of the matrix.
        - Inf if the matrix is singular or ill-conditioned.
        """
        return np.linalg.cond(self.A)

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

    def power_method(self, inverse=False, max_iterations=1000, tol=1e-3):
        """
        Compute the largest eigenvalue using the power method or inverse power method.

        Args:
        - inverse: If True, compute the smallest eigenvalue using the inverse power method.
        - max_iterations: Maximum number of iterations.
        - tol: Convergence tolerance.

        Returns:
        - The largest (or smallest if inverse=True) eigenvalue.
        """
        A = np.linalg.inv(self.A) if inverse else self.A
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

        return eigenvalue if eigenvalue else "Did not converge"

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

        y = np.linalg.solve(self.L, np.dot(self.P, b))
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
                x = self.solve_system(b)
                results[f"Ax = b{i}"] = {
                    "type": "unique solution",
                    "solution": x.tolist(),
                }
            else:
                rank_A = np.linalg.matrix_rank(self.A)
                aug_A = np.column_stack((self.A, b))
                rank_aug_A = np.linalg.matrix_rank(aug_A)

                if rank_A == rank_aug_A:
                    results[f"Ax = b{i}"] = {"type": "infinite solutions"}
                else:
                    results[f"Ax = b{i}"] = {"type": "no solutions"}

        return results

# class MatrixSolver:
#     def __init__(self, matrix, b1, b2):
#         """
#         Initializes the MatrixSolver class with the given matrix and two vectors b1, b2.

#         Args:
#         - matrix: The coefficient matrix A.
#         - b1, b2: Two different right-hand side vectors for the linear systems Ax = b1, Ax = b2.
#         """
#         self.A = np.array(matrix, dtype=float)
#         self.b1 = np.array(b1, dtype=float)
#         self.b2 = np.array(b2, dtype=float)
#         self.n = len(matrix)  # Size of the matrix (assumed to be square)
#         self.L = None  # Lower triangular matrix after LU decomposition
#         self.U = None  # Upper triangular matrix after LU decomposition
#         self.P = None  # Permutation matrix after LU decomposition
#         self.eigenvalues = None  # To store eigenvalues after computation

#     def lu_decomposition(self):
#         """
#         Perform LU decomposition with pivoting using scipy's lu function.
#         LU decomposition is of the form PA = LU.
#         Raises:
#         - ValueError: If the matrix is singular (determinant is zero).
#         """
#         self.P, self.L, self.U = lu(self.A)

#         # Check if the matrix is singular by looking at the determinant of U
#         if np.isclose(np.linalg.det(self.U), 0):
#             raise ValueError("Matrix is singular, LU decomposition failed.")

#     def eigenvalues_via_lu(self, max_iterations=10000, tol=1e-3):
#         """
#         Calculate the eigenvalues of the matrix using an iterative LU decomposition method.

#         Args:
#         - max_iterations: Maximum number of iterations for convergence.
#         - tol: Tolerance for convergence.

#         Returns:
#         - The eigenvalues of the matrix.
#         """
#         A = self.A.copy()
#         for _ in range(max_iterations):
#             # Perform LU decomposition
#             P, L, U = lu(A)

#             # Recompute A as UL (ignoring the permutation matrix P)
#             A_new = np.dot(U, L)

#             # Check for convergence by comparing diagonal elements
#             if np.allclose(np.diag(A), np.diag(A_new), atol=tol):
#                 break

#             A = A_new

#         # If no convergence, fallback to numpy's eig method
#         if not np.allclose(np.diag(A), np.diag(A_new), atol=tol):
#             self.eigenvalues = np.linalg.eigvals(self.A)
#         else:
#             self.eigenvalues = np.diag(A)

#         return self.eigenvalues

#     def polynomial_equation(self):
#         """
#         Calculate the characteristic polynomial of the matrix based on its eigenvalues.

#         Returns:
#         - The coefficients of the characteristic polynomial.
#         """
#         if self.eigenvalues is None:
#             self.eigenvalues_via_lu()

#         # Use numpy's poly function to get polynomial coefficients from eigenvalues
#         coefficients = np.poly(self.eigenvalues)
#         return coefficients

#     def determinant(self):
#         """
#         Calculate the determinant of the matrix using its eigenvalues.

#         Returns:
#         - The determinant of the matrix.
#         """
#         if self.eigenvalues is None:
#             self.eigenvalues_via_lu()

#         return np.prod(self.eigenvalues)

#     def is_unique(self):
#         """
#         Check if the matrix has a unique solution for the system Ax = b.
#         A unique solution exists if the determinant is non-zero.

#         Returns:
#         - True if the matrix has a unique solution, False otherwise.
#         """
#         det = self.determinant()
#         return (
#             abs(det) > 1e-10
#         )  # Use a small threshold to account for floating-point precision

#     def condition_number_via_eigenvalues(self):
#         """
#         Compute the condition number of the matrix using its eigenvalues.

#         Returns:
#         - The condition number of the matrix.
#         - Inf if the matrix is singular or ill-conditioned.
#         """
#         if self.eigenvalues is None:
#             self.eigenvalues_via_lu()

#         # Get the absolute values of the eigenvalues
#         abs_eigenvalues = np.abs(self.eigenvalues)

#         # Check if the smallest eigenvalue is close to zero (use a threshold)
#         min_eigenvalue = np.min(abs_eigenvalues)
#         if min_eigenvalue < 1e-10:
#             return float(
#                 "inf"
#             )  # Infinite condition number means the matrix is ill-conditioned

#         # Compute the condition number as the ratio of the largest to smallest eigenvalue
#         return np.max(abs_eigenvalues) / min_eigenvalue

#     def compare_with_hilbert(self):
#         """
#         Compare the condition number of the matrix with that of a Hilbert matrix of the same size.

#         Returns:
#         - The condition number of the matrix and the condition number of the Hilbert matrix.
#         """
#         hilbert_matrix = hilbert(self.n)
#         hilbert_cond = np.linalg.cond(hilbert_matrix)
#         our_cond = self.condition_number_via_eigenvalues()
#         return our_cond, hilbert_cond

#     def jordan_inverse(self):
#         """
#         Compute the inverse of the matrix using a simplified Jordan decomposition method.

#         Returns:
#         - The inverse of the matrix.
#         """
#         if self.eigenvalues is None:
#             self.eigenvalues_via_lu()

#         # Create the inverse of the diagonal matrix
#         D = np.diag(1 / self.eigenvalues)

#         # Compute the eigenvectors
#         P = np.linalg.eig(self.A)[1]

#         # Return the inverse using Jordan form
#         return np.dot(np.dot(P, D), np.linalg.inv(P))

#     def solve_system(self, b):
#         """
#         Solve the system of linear equations Ax = b using LU decomposition.

#         Args:
#         - b: The right-hand side vector.

#         Returns:
#         - The solution vector x.
#         """
#         if self.L is None or self.U is None:
#             self.lu_decomposition()

#         # Forward substitution for Ly = Pb
#         y = np.linalg.solve(self.L, np.dot(self.P, b))

#         # Back substitution for Ux = y
#         return np.linalg.solve(self.U, y)

#     def compare_eigenvalues(self):
#         """
#         Compare the eigenvalues obtained from LU decomposition with those from the power method.

#         Returns:
#         - Eigenvalues from LU decomposition, power method, and inverse power method.
#         """
#         lu_eigenvalues = self.eigenvalues_via_lu()
#         power_eigenvalue = self.power_method()
#         inverse_power_eigenvalue = self.power_method(inverse=True)

#         return lu_eigenvalues, power_eigenvalue, inverse_power_eigenvalue

#     def solve_multiple_b(self):
#         """
#         Solve the linear systems Ax = b1 and Ax = b2.
#         Determine if the solution is unique, infinite, or non-existent for each system.

#         Returns:
#         - A dictionary with solutions and their types for each system.
#         """
#         results = {}

#         for i, b in enumerate([self.b1, self.b2], start=1):
#             if self.is_unique():
#                 # If the determinant is non-zero, the system has a unique solution
#                 x = self.solve_system(b)
#                 results[f"Ax = b{i}"] = {
#                     "type": "unique solution",
#                     "solution": x.tolist(),
#                 }
#             else:
#                 # The system might have either infinite solutions or no solution
#                 rank_A = np.linalg.matrix_rank(self.A)
#                 aug_A = np.column_stack((self.A, b))  # Augmented matrix [A|b]
#                 rank_aug_A = np.linalg.matrix_rank(aug_A)

#                 if rank_A == rank_aug_A:
#                     # If ranks are equal, there are infinite solutions
#                     results[f"Ax = b{i}"] = {"type": "infinite solutions"}
#                 else:
#                     # If ranks differ, there is no solution
#                     results[f"Ax = b{i}"] = {"type": "no solutions"}

#         return results


# import numpy as np
# from scipy.linalg import hilbert, lu
