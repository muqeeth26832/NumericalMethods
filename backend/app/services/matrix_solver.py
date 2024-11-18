import numpy as np
from scipy.linalg import hilbert, lu


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

    def solve_system(self, b):
        """
        Solve the system of linear equations Ax = b.
        Returns:
        - dict: Solution or error message.
        """
        try:
            if self.L is None or self.U is None:
                if np.isclose(self.determinant(), 0):
                    # Check for no solution or infinite solutions
                    rank_A = np.linalg.matrix_rank(self.A)
                    rank_aug_A = np.linalg.matrix_rank(np.column_stack((self.A, b)))
                    if rank_A == rank_aug_A:
                        return {"type": "infinite solutions"}
                    else:
                        return {"type": "no solutions"}
                else:
                    # Perform LU decomposition if not already done
                    self.lu_decomposition()

            # Solve Ly = Pb, where P is the permutation matrix
            y = np.linalg.solve(self.L, np.dot(self.P, b))
            # Solve Ux = y
            x = np.linalg.solve(self.U, y)

            return {
                "solution": x.tolist()
            }  # Return solution as a list for easier JSON serialization

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

    def power_method(self, inverse=False, max_iterations=1000, tol=1e-6, shift=0.1):
        """
        Compute the largest or smallest eigenvalue using the power or inverse power method.

        Args:
            inverse (bool): If True, computes the smallest eigenvalue via inverse power method.
            max_iterations (int): Maximum number of iterations.
            tol (float): Convergence tolerance.
            shift (float): Value added to the diagonal for stability.

        Returns:
            dict: Contains 'eigenvalue' (float) and 'converged' (bool), or an error message.
        """
        try:
            # Apply shift if specified
            A_shifted = self.A + shift * np.eye(self.n) if shift != 0 else self.A

            # If inverse is requested, check if the matrix is invertible
            if inverse:
                if np.linalg.det(A_shifted) == 0:
                    return {"error": "Matrix is singular, cannot compute inverse."}
                A = np.linalg.inv(A_shifted)
            else:
                A = np.linalg.inv(A_shifted) if inverse else A_shifted

            # Initialize a random vector
            x = np.random.rand(self.n)
            x /= np.linalg.norm(x)

            eigenvalue = None
            converged = False

            for iteration in range(max_iterations):
                x_new = np.dot(A, x)
                new_eigenvalue = np.dot(x_new, x) / np.dot(x, x)
                x_new /= np.linalg.norm(x_new)

                if np.linalg.norm(x_new - x) < tol:
                    eigenvalue = new_eigenvalue
                    converged = True
                    break
                x = x_new

            if not converged:
                return {
                    "error": "Power method did not converge",
                    "iterations": max_iterations,
                }

            return {
                "eigenvalue": eigenvalue - shift if shift != 0 else eigenvalue,
                "converged": converged,
                "iterations": iteration + 1,
            }
        except Exception as e:
            return {"error": f"Power method failed: {str(e)}"}
