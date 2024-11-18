from fastapi import APIRouter, HTTPException
from app.services.matrix_solver import AccurateMatrixSolver
from typing import List
import numpy as np

router = APIRouter()

from fastapi import APIRouter, HTTPException
import numpy as np
from app.services.matrix_solver import (
    AccurateMatrixSolver,
)  # Assuming the AccurateMatrixSolver class is imported from a module

router = APIRouter()


@router.post("/process-matrix")
async def process_matrix(data: dict):
    """
    Processes the matrix and performs the required operations for Eigenvalue, determinant, condition number, etc.
    """
    try:
        # Validate that the required fields are present in the data
        matrix_data = data["matrix"]
        vector_b1 = data["b1"]
        vector_b2 = data["b2"]

        if not matrix_data or not vector_b1 or not vector_b2:
            raise HTTPException(status_code=400, detail="Missing matrix or vector data")

        # Ensure the matrix and vectors are valid and can be converted to NumPy arrays
        matrix = np.array(matrix_data)
        b1 = np.array(vector_b1)
        b2 = np.array(vector_b2)

        # # Check matrix dimensions (must be 5x5) and vectors (must be 5 elements)

        # if matrix.shape != (5, 5):
        #     raise HTTPException(status_code=400, detail="Matrix must be 5x5")
        # if b1.shape != (5,) or b2.shape != (5,):
        #     raise HTTPException(status_code=400, detail="Vectors must have 5 elements")

        # # Initialize the matrix solver with the input matrix and b1, b2 vectors
        solver = AccurateMatrixSolver(matrix, b1, b2)

        # # Initialize result dictionary
        result = {}

        # # LU decomposition

        # lu_result = solver.lu_decomposition()

        # if isinstance(lu_result, dict) and "error" in lu_result:
        #     result["lu_decomposition_error"] = lu_result["error"]
        # else:
        #     result["lu_decomposition"] = lu_result
        # # Eigenvalues via shift method (if LU failed or singular)

        eigenvalues = solver.eigenvalues_via_shift()
        if isinstance(eigenvalues, dict) and "error" in eigenvalues:
            result["eigenvalues_error"] = eigenvalues["error"]
        else:
            result["eigenvalues"] = eigenvalues
        # # Determinant
        determinant = solver.determinant()
        if isinstance(determinant, dict) and "error" in determinant:
            result["determinant_error"] = determinant["error"]
        else:
            result["determinant"] = determinant

        # # Condition number comparison with Hilbert matrix
        condition_comparison = solver.compare_with_hilbert()
        if isinstance(condition_comparison, dict) and "error" in condition_comparison:
            result["condition_comparison_error"] = condition_comparison["error"]
        else:
            result["condition_comparison"] = condition_comparison

        # # Polynomial equation of eigenvalues
        polynomial = solver.polynomial_equation()
        if isinstance(polynomial, dict) and "error" in polynomial:
            result["polynomial_error"] = polynomial["error"]
        else:
            result["polynomial"] = polynomial

        # # Power method eigenvalue for both A and inverse(A)
        power_method_eigenvalue = solver.power_method()
        inverse_power_method_eigenvalue = solver.power_method(inverse=True, shift=1)

        if (
            isinstance(power_method_eigenvalue, dict)
            and "error" in power_method_eigenvalue
        ):
            result["power_method_error"] = power_method_eigenvalue["error"]
        else:
            result["power_method_eigenvalue"] = power_method_eigenvalue

        if (
            isinstance(inverse_power_method_eigenvalue, dict)
            and "error" in inverse_power_method_eigenvalue
        ):
            result["inverse_power_method_error"] = inverse_power_method_eigenvalue[
                "error"
            ]
        else:
            result["inverse_power_method_eigenvalue"] = inverse_power_method_eigenvalue

        # Solve systems Ax=b1 and Ax=b2
        solutions = solver.solve_multiple_b()
        if isinstance(solutions, dict) and "error" in solutions:
            result["solutions_error"] = solutions["error"]
        else:
            result["solutions"] = solutions

        # Return all results as JSON
        return result

    except Exception as e:
        return {"error": str(e)}
