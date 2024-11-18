def explicit_euler(P: float, N: int, step_size: float):
    y = np.linspace(0, 1, N)  # Grid for spatial variable y
    u = np.zeros(N)  # Velocity profile initialized to 0
    for n in range(1, N):
        u[n] = u[n - 1] + step_size * (P * y[n] - u[n - 1])
    return u.tolist()


def implicit_euler(P: float, N: int, step_size: float):
    y = np.linspace(0, 1, N)  # Grid for spatial variable y
    u = np.zeros(N)  # Velocity profile initialized to 0
    A = np.eye(N) - step_size * P * np.diag(
        np.ones(N - 1), -1
    )  # Simplified system matrix
    for n in range(1, N):
        u = np.linalg.solve(A, u)  # Solve for u at each timestep
    return u.tolist()


def finite_difference(P: float, N: int):
    y = np.linspace(0, 1, N)  # Grid for spatial variable y
    u = np.zeros(N)  # Velocity profile initialized to 0
    A = np.zeros((N, N))
    b = np.zeros(N)

    for i in range(1, N - 1):
        A[i, i - 1] = -1
        A[i, i] = 2
        A[i, i + 1] = -1
        b[i] = P * y[i]  # Assuming a linear source term

    A[0, 0] = A[N - 1, N - 1] = 1  # Boundary conditions
    u = np.linalg.solve(A, b)  # Solve the linear system
    return u.tolist()


def analytical_solution(P: float, N: int):
    y = np.linspace(0, 1, N)
    u = P * y * (1 - y)  # Simplified analytical solution
    return u


from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
import numpy as np

router = APIRouter()


def compute_solution(p_value: float, N: int):
    y = np.linspace(0, 1, N)

    explicit_euler_result = explicit_euler(p_value, N, 0.01)
    implicit_euler_result = implicit_euler(p_value, N, 0.01)
    finite_difference_result = finite_difference(p_value, N)
    analytical_solution_result = analytical_solution(p_value, N)

    result = []

    for i in range(len(y)):
        result.append(
            {
                "p_value": p_value,
                "y": y[i],
                "explicit_euler": explicit_euler_result[i],
                "implicit_euler": implicit_euler_result[i],
                "finite_difference": finite_difference_result[i],
                "analytical_solution": analytical_solution_result[i],
            }
        )
    return result


@router.post("/compute_solutions")
async def compute_solutions(data: dict):

    P_values = data["P_values"]
    N = data["N"]

    solutions = []
    for p in P_values:
        solution = compute_solution(p, N)
        solutions.append(solution)
    return {"solutions": solutions}
