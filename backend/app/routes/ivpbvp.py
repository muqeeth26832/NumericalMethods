from fastapi import APIRouter
from pydantic import BaseModel
from typing import List
import numpy as np
from .n import CouettePoiseuilleFlow

router = APIRouter()


def compute_solution(flow_problem: CouettePoiseuilleFlow, p_value: float):
    """
    Computes the solutions for a given pressure gradient using the provided flow problem object.
    """
    y = flow_problem.y_vals  # Use y values from the flow problem object

    # Calculate results for different numerical methods
    explicit_euler_result = flow_problem.shooting_method(p_value, "explicit")
    implicit_euler_result = flow_problem.shooting_method(p_value, "implicit")
    finite_difference_result = flow_problem.finite_difference(p_value)

    analytical_solution_result = flow_problem.analytical_solution(p_value)

    # Prepare the results for each y-value
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


class ComputeSolutionsRequest(BaseModel):
    """
    Pydantic model to validate the input data for the compute_solutions endpoint.
    """

    P_values: List[float]  # List of pressure gradients to compute solutions for
    N: int  # Number of steps in the y-direction


@router.post("/compute_solutions")
async def compute_solutions(data: ComputeSolutionsRequest):
    """
    Endpoint to compute solutions for multiple pressure gradients.
    """
    P_values = data.P_values
    N = data.N

    # Create an instance of CouettePoiseuilleFlow with the specified parameters
    flow_problem = CouettePoiseuilleFlow(L=1.0, U0=1.0, mu=1.0, dy=1.0 / N)

    solutions = []

    for p in P_values:
        solution = compute_solution(flow_problem, p)
        solutions.append(solution)

    return {"solutions": solutions}
