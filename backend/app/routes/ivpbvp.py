import numpy as np
from scipy.optimize import root_scalar


# Problem parameters
L = 1.0  # Distance between the walls
U0 = 1.0  # Velocity at y = L
P_values = [-2, 0, 2, 5, 10]  # Different values of pressure gradient
mu = 1.0  # Dynamic viscosity
dy = 0.01  # Step size in y
N = int(L / dy)  # Number of steps in the y direction


# Set up the grid for y
y_vals = np.linspace(0, L, N)


def analytical_solution(P, y, L, U0):
    return (-P / (2 * mu) * y**2) + (P * y / (2 * mu) + U0 * y / L)

import numpy as np

def explicit_euler(y0, v0, step_size, y_end, P):
    n_steps = int(y_end / step_size) + 1
    y_values = []
    u_values = []

    # Initialize values
    y = 0
    u = y0
    v = v0

    for _ in range(n_steps):
        y_values.append(y)
        u_values.append(u)

        # Update using Explicit Euler method
        u_new = u + step_size * v
        v_new = v - step_size * P

        # Update the values
        u = u_new
        v = v_new
        y += step_size

    return y_values, u_values


def explicit_euler_ivp(y_range, u0, u0_prime, P, mu, dy):
    """Improved explicit Euler method using central difference"""
    N = len(y_range)
    u = np.zeros(N)
    u_prime = np.zeros(N)
    
    # Initial conditions
    u[0] = u0
    u_prime[0] = u0_prime
    
    # First point using forward Euler
    u[1] = u[0] + dy * u0_prime
    u_prime[1] = u_prime[0] + dy * (-P/mu)
    
    # Remaining points using central difference
    for i in range(2, N):
        u_prime[i] = u_prime[i-1] + dy * (-P/mu)
        u[i] = 2*u[i-1] - u[i-2] + (dy**2 * (-P/mu))
    
    return u

def implicit_euler(y0, v0, step_size, y_end, P):

    n_steps = int(y_end / step_size) + 1
    y_values = []
    u_values = []

    # Initialize values
    y = 0
    u = y0
    v = v0

    for _ in range(n_steps):
        y_values.append(y)
        u_values.append(u)

        # Implicit Euler update
        # Solve for v_next first
        v_next = v - step_size * P
        # Use v_next to update u_next
        u_next = u + step_size * v_next

        # Update values
        u = u_next
        v = v_next
        y += step_size

    return y_values, u_values

def implicit_euler_ivp(y_range, u0, u0_prime, P, mu, dy):
    # Use explicit_euler for integration
    y_end = y_range[-1] - y_range[0]  # Total range in y
    y_values, u_values = explicit_euler(u0, u0_prime, dy, y_end, P / mu)

    # Convert results to arrays
    u = np.array(u_values)
    return u
    N = len(y_range)
    u = np.zeros(N)
    u_prime = np.zeros(N)
    u[0] = u0
    u_prime[0] = u0_prime

    for i in range(1, N):
        # Iterative step for implicit Euler
        u_prime[i] = u_prime[i - 1] + dy * (-P / mu)
        u[i] = u[i - 1] + dy * u_prime[i]

    return u


# Shooting method to adjust initial slope to satisfy boundary conditions
def shooting_method(P, mu, L, U0, dy, method="explicit"):
    def boundary_condition_shooting(guess):
        # Choose the solver based on the method argument
        if method == "explicit":
            u_vals = explicit_euler_ivp(y_vals, 0, guess, P, mu, dy)
        elif method == "implicit":
            u_vals = implicit_euler_ivp(y_vals, 0, guess, P, mu, dy)

        # Evaluate solution at y = L
        u_L = u_vals[-1]
        return u_L - U0  # Difference from the desired boundary condition u(L) = U0

    # Find the correct initial slope using a root-finding method
    res = root_scalar(boundary_condition_shooting, bracket=[-10, 10], method="brentq")
    initial_slope = res.root

    # Solve the IVP with the found initial slope using the specified method
    if method == "explicit":
        u_solution = explicit_euler_ivp(y_vals, 0, initial_slope, P, mu, dy)
    elif method == "implicit":
        u_solution = implicit_euler_ivp(y_vals, 0, initial_slope, P, mu, dy)

    return u_solution


def finite_difference(P, mu, dy, N, U0):
    A = np.zeros((N, N))
    b = np.zeros(N)

    # Fill matrix A for interior points
    for i in range(1, N - 1):
        A[i, i - 1] = 1 / dy**2
        A[i, i] = -2 / dy**2
        A[i, i + 1] = 1 / dy**2
        b[i] = -P / mu

    # Boundary conditions
    A[0, 0] = 1  # u(0) = 0
    A[-1, -1] = 1
    b[-1] = U0  # u(L) = U0

    # Solve the system
    u = np.linalg.solve(A, b)
    return u


#
def system_equations(u, v, P):
    du = v
    dv = -P
    return du, dv


# Function to compute the Jacobian programmatically using finite differences


def compute_jacobian(u, v, P, delta=1e-5):
    # Create the Jacobian matrix
    J = np.zeros((2, 2))

    # Evaluate the system at the current state
    f0 = system_equations(u, v, P)

    # Compute partial derivatives using finite differences
    for i in range(2):  # Two variables: u and v
        # Perturb uHH
        if i == 0:  # Perturb u
            f1 = system_equations(u + delta, v, P)
            J[0][0] = (f1[0] - f0[0]) / delta  # du/du
            J[1][0] = (f1[1] - f0[1]) / delta  # dv/du
        else:  # Perturb v
            f1 = system_equations(u, v + delta, P)
            J[0][1] = (f1[0] - f0[0]) / delta  # du/dv
            J[1][1] = (f1[1] - f0[1]) / delta  # dv/dv

    return J


#


from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter()


def compute_solution(p_value: float, N: int, mu=1.0, L=1.0, U0=1.0, dy=0.01):
    y = np.linspace(0, 1, N)

    u_shooting_explicit = shooting_method(p_value, mu, L, U0, dy, method="explicit")
    u_shooting_implicit = shooting_method(p_value, mu, L, U0, dy, method="implicit")

    u_fd = finite_difference(p_value, mu, dy, N, U0)
    u_analytical = analytical_solution(p_value, y, L, U0)

    result = []

    for i in range(len(y)):
        result.append(
            {
                "p_value": p_value,
                "y": y[i],
                "explicit_euler": u_shooting_explicit[i],
                "implicit_euler": u_shooting_implicit[i],
                "finite_difference": u_fd[i],
                "analytical_solution": u_analytical[i],
            }
        )
    return result


@router.post("/solve")
async def compute_solutions(data: dict):

    P_values = data["P_values"]
    stepsize = data["step_size"]

    L = 1.0  # Length of the domain (can also be passed dynamically if needed)
    mu = 1.0
    U0 = 1.0

    if stepsize <= 0 or stepsize > L:
        return {
            "error": "Invalid stepsize. It must be positive and less than or equal to the domain length."
        }
    # Compute the number of grid points
    N = int(L / stepsize)

    solutions = []
    for p in P_values:
        solution = compute_solution(p, N, mu, L, U0, stepsize)
        solutions.append(solution)
    return {"solutions": solutions}


@router.post("/jacobian")
async def compute_jacobian_matrix(data: dict):
    """
    Compute the Jacobian matrix for the given velocity, derivative, and pressure gradient.

    Parameters:
        data: JSON payload containing `u`, `v`, `P`, and optional `delta`.

    Returns:
        2x2 Jacobian matrix as a JSON response.
    """
    u = data.get("u", 0.0)  # Default to 0.0 if not provided
    v = data.get("v", 0.0)  # Default to 0.0 if not provided
    P = data.get("P", 0.0)  # Default to 0.0 if not provided
    delta = data.get("delta", 1e-5)  # Default perturbation

    # Compute the Jacobian matrix
    J = compute_jacobian(u, v, P, delta)

    return {"jacobian": J.tolist()}
