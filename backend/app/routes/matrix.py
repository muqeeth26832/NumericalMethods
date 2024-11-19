from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from fastapi.responses import JSONResponse
from app.services.matrix_solver import AccurateMatrixSolver as MatrixSolver
from app.utils.file_handler import (
    read_csv_matrix,
    save_matrix_to_file,
    read_matrix_from_file,
)
import os
import numpy as np
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

# Path where matrices are stored
MATRIX_FILE_PATH = "uploaded_matrix.csv"
VECTOR_B1_FILE_PATH = "vector_b1.csv"
VECTOR_B2_FILE_PATH = "vector_b2.csv"


def get_matrix_solver():
    if not os.path.exists(MATRIX_FILE_PATH):
        raise HTTPException(status_code=400, detail="Please upload a matrix first")

    try:
        matrix_A = read_matrix_from_file(MATRIX_FILE_PATH)
        vector_b1 = read_matrix_from_file(VECTOR_B1_FILE_PATH)
        vector_b2 = read_matrix_from_file(VECTOR_B2_FILE_PATH)
    except Exception as e:
        logger.error(f"Error reading matrix files: {str(e)}")
        raise HTTPException(status_code=500, detail="Error reading matrix files")

    return MatrixSolver(np.array(matrix_A), np.array(vector_b1), np.array(vector_b2))


@router.post("/upload/")
async def upload_matrix(file: UploadFile = File(...)):
    try:
        matrix_data = await read_csv_matrix(file)

        save_matrix_to_file(matrix_data["matrix_A"], MATRIX_FILE_PATH)
        save_matrix_to_file(matrix_data["vector_b1"], VECTOR_B1_FILE_PATH)
        save_matrix_to_file(matrix_data["vector_b2"], VECTOR_B2_FILE_PATH)

        return {
            "message": "Matrix and vectors uploaded successfully",
            "data": {
                "matrix_A": matrix_data["matrix_A"].tolist(),
                "vector_b1": matrix_data["vector_b1"].tolist(),
                "vector_b2": matrix_data["vector_b2"].tolist(),
            },
        }
    except ValueError as ve:
        logger.error(f"Invalid matrix format: {str(ve)}")
        return {"OOPS!!": str(ve)}
    except Exception as e:
        logger.error(f"Error uploading matrix: {str(e)}")
        return {"OOPS!!": f"Error saving matrix: {str(e)}"}


@router.get("/eigenvalues/")
async def get_eigenvalues(solver: MatrixSolver = Depends(get_matrix_solver)):
    try:
        eigenvalues = solver.eigenvalues_via_lu()

        # Prepare eigenvalues in a JSON-compatible format
        eigenvalues_list = []
        for eigenvalue in eigenvalues:
            if isinstance(eigenvalue, complex):
                # If it's a complex number, return a dict with real and imaginary parts
                eigenvalues_list.append(
                    {"real": eigenvalue.real, "imag": eigenvalue.imag}
                )
            else:
                # If it's a real number, append it as is
                eigenvalues_list.append(eigenvalue)

        return {"eigenvalues": eigenvalues_list}
    except np.linalg.LinAlgError as lae:
        logger.error(f"Linear algebra error calculating eigenvalues: {str(lae)}")
        return {
            "OOPS!!": "Failed to calculate eigenvalues. The matrix may be singular."
        }
    except Exception as e:
        logger.error(f"Error calculating eigenvalues: {str(e)}")
        return {"OOPS!!": "Unexpected error calculating eigenvalues"}


@router.get("/determinant/")
async def get_determinant(solver: MatrixSolver = Depends(get_matrix_solver)):
    try:
        determinant = solver.determinant()
        is_unique = "unique" if abs(determinant) > 1e-10 else "not unique"
        return {"determinant": float(determinant), "uniqness": is_unique}
    except np.linalg.LinAlgError as lae:
        logger.error(f"Linear algebra error calculating determinant: {str(lae)}")
        return {
            "OOPS!!": "Failed to calculate determinant. The matrix may be singular."
        }
    except Exception as e:
        logger.error(f"Error calculating determinant: {str(e)}")
        return {"OOPS!!": "Unexpected error calculating determinant"}


@router.get("/condition-number/")
async def get_condition_number(solver: MatrixSolver = Depends(get_matrix_solver)):
    try:
        condition_number = solver.condition_number_via_eigenvalues()
        hilbert_condition = solver.compare_with_hilbert()[1]

        matrix_condition = (
            "Infinity" if np.isinf(condition_number) else float(condition_number)
        )
        hilbert_condition_str = (
            "Infinity" if np.isinf(hilbert_condition) else float(hilbert_condition)
        )

        return {
            "matrix_condition": matrix_condition,
            "hilbert_condition": hilbert_condition_str,
        }
    except np.linalg.LinAlgError as lae:
        logger.error(f"Linear algebra error calculating condition number: {str(lae)}")
        return {
            "OOPS!!": "Failed to calculate condition number. The matrix may be singular."
        }
    except Exception as e:
        logger.error(f"Error calculating condition number: {str(e)}")
        return {"OOPS!!": "Unexpected error calculating condition number"}


@router.get("/polynomial-equation/")
async def get_polynomial_equation(solver: MatrixSolver = Depends(get_matrix_solver)):
    try:
        coefficients = solver.polynomial_equation()
        print(coefficients)
        return {"coefficients": coefficients.tolist()}
    except np.linalg.LinAlgError as lae:
        logger.error(
            f"Linear algebra error calculating polynomial equation: {str(lae)}"
        )
        return {
            "OOPS!!": "Failed to calculate polynomial equation. The matrix may be singular."
        }
    except Exception as e:
        logger.error(f"Error calculating polynomial equation: {str(e)}")
        return {"OOPS!!": "Unexpected error calculating polynomial equation"}


@router.get("/power-method/")
async def power_method(solver: MatrixSolver = Depends(get_matrix_solver)):
    try:
        largest_eigenvalue_A = solver.power_method()
        largest_eigenvalue_inverse_A = solver.power_method(inverse=True)
        lu_eigenvalues = solver.eigenvalues_via_lu()

        # Prepare eigenvalues in a JSON-compatible format
        eigenvalues_list = []
        for eigenvalue in lu_eigenvalues:
            if isinstance(eigenvalue, complex):
                # If it's a complex number, return a dict with real and imaginary parts
                eigenvalues_list.append(
                    {"real": eigenvalue.real, "imag": eigenvalue.imag}
                )
            else:
                # If it's a real number, append it as is
                eigenvalues_list.append(eigenvalue)

        return {
            "largest_eigenvalue_A": largest_eigenvalue_A,
            "largest_eigenvalue_inverse_A": largest_eigenvalue_inverse_A,
            "lu_eigenvalues": eigenvalues_list,
        }
    except np.linalg.LinAlgError as lae:
        logger.error(f"Linear algebra error in power method: {str(lae)}")
        if solver.determinant() == 0:
            return {
                "error": "Power method failed. The matrix is singular.",
                "largest_eigenvalue_A": 0 ,
                "largest_eigenvalue_inverse_A": 0,
            }
        return {
            "error": "Power method failed. The matrix may be singular or ill-conditioned."
        }
    except Exception as e:
        logger.error(f"Unexpected error in power method: {str(e)}")
        return {"error": f"Unexpected error in power method: {str(e)}"}


@router.post("/solve/{vector_choice}")
async def solve_system(
    vector_choice: str, solver: MatrixSolver = Depends(get_matrix_solver)
):
    try:
        if vector_choice not in ["b1", "b2"]:
            raise ValueError("Invalid vector_choice. Must be 'b1' or 'b2'.")

        solution = solver.solve_multiple_b()
        result = solution[f"Ax = {vector_choice}"]

        if result["type"] == "unique solution":
            return {"solution": result["solution"]}
        elif result["type"] == "infinite solutions":
            return {"OOPS!!": "The system has infinite solutions."}
        elif result["type"] == "no solutions":
            return {"OOPS!!": "No solution exists for the given system."}

    except ValueError as ve:
        return {"OOPS!!": str(ve)}
    except np.linalg.LinAlgError as lae:
        logger.error(f"Linear algebra error solving system: {str(lae)}")
        return {"OOPS!!": "Failed to solve the system. The matrix may be singular."}
    except Exception as e:
        logger.error(f"Error solving system: {str(e)}")
        return {"OOPS!!": "Unexpected error solving the system"}


@router.get("/process-all/")
async def process_all(solver: MatrixSolver = Depends(get_matrix_solver)):
    try:
        # Collect results from individual operations
        eigenvalues = await get_eigenvalues(solver)
        determinant = await get_determinant(solver)
        condition_numbers = await get_condition_number(solver)
        polynomial_coeffs = await get_polynomial_equation(solver)
        power_method_results = await power_method(solver)
        print(power_method_results)

        # Solutions for both vectors
        solution_b1 = await solve_system("b1", solver)
        solution_b2 = await solve_system("b2", solver)

        # Construct the final response
        combined_response = {
            "eigenvalues": eigenvalues["eigenvalues"],
            "determinant": determinant["determinant"],
            "is_unique": determinant.get(
                "uniqness"
            ),  # Assuming is_unique can be derived from determinant
            "condition_number": condition_numbers["matrix_condition"],
            "hilbert_condition": condition_numbers["hilbert_condition"],
            "polynomial_coefficients": polynomial_coeffs["coefficients"],
            "largest_eigenvalue_A": power_method_results["largest_eigenvalue_A"],
            "largest_eigenvalue_inverse_A": power_method_results[
                "largest_eigenvalue_inverse_A"
            ],
            "solution_b1": (
                solution_b1.get("solution")
                if "solution" in solution_b1
                else solution_b1
            ),
            "solution_b2": (
                solution_b2.get("solution")
                if "solution" in solution_b2
                else solution_b2
            ),
        }
        print(combined_response)
        return combined_response

    except np.linalg.LinAlgError as lae:
        logger.error(f"Linear algebra error processing all operations: {str(lae)}")
        return {
            "OOPS!!": "Failed to process all operations. The matrix may be singular or ill-conditioned."
        }
    except ValueError as ve:
        logger.error(f"Value error processing all operations: {str(ve)}")
        return {"OOPS!!": str(ve)}
    except Exception as e:
        logger.error(f"Unexpected error processing all operations: {str(e)}")
        return {"OOPS": f"Unexpected error processing all operations: {str(e)}"}
