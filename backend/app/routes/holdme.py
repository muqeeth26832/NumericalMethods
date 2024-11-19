# import numpy as np
# from fastapi import APIRouter
# from pydantic import BaseModel
# from scipy.optimize import root_scalar


# # Define parameters model
# class FlowParameters(BaseModel):
#     P: float  # Pressure gradient
#     y_start: float  # Start of y-range
#     y_end: float  # End of y-range
#     u_start: float  # Velocity at y = y_start
#     u_end: float  # Velocity at y = y_end
#     N: int  # Number of steps
#     step_size: float  # Step size for integration


# router = APIRouter()

# # Problem parameters (for internal function use)
# mu = 1.0  # Dynamic viscosity
# dy = 0.01  # Step size in y
# L = 1.0  # Distance between the walls


# # Set up the grid for y (internal use)
# def get_y_vals(N, y_start, y_end):
#     return np.linspace(y_start, y_end, N)


# # Analytical solution for comparison
# def analytical_solution(P, y_vals, y_start, u_start, u_end):
#     delta_y = y_vals[-1] - y_vals[0]
#     a = P / 2
#     b = (u_end - u_start) / delta_y - P * delta_y / 2
#     c = u_start
#     return a * (y_vals - y_vals[0]) ** 2 + b * (y_vals - y_vals[0]) + c


# # Explicit Euler method for solving the ODE system
# def explicit_euler_ivp(y_range, u0, u0_prime, P, mu, dy):
#     N = len(y_range)
#     u = np.zeros(N)
#     u_prime = np.zeros(N)
#     u[0] = u0
#     u_prime[0] = u0_prime

#     for i in range(1, N):
#         u[i] = u[i - 1] + dy * u_prime[i - 1]
#         u_prime[i] = u_prime[i - 1] + dy * (-P / mu)

#     return u


# # Implicit Euler method for solving the ODE system
# def implicit_euler_ivp(y_range, u0, u0_prime, P, mu, dy):
#     N = len(y_range)
#     u = np.zeros(N)
#     u_prime = np.zeros(N)
#     u[0] = u0
#     u_prime[0] = u0_prime

#     for i in range(1, N):
#         u_prime[i] = u_prime[i - 1] + dy * (-P / mu)
#         u[i] = u[i - 1] + dy * u_prime[i]

#     return u


# # Shooting method to adjust initial slope to satisfy boundary conditions
# def shooting_method(P, mu, L, U0, dy, method="explicit"):
#     y_vals = np.linspace(0, L, int(L / dy))

#     def boundary_condition_shooting(guess):
#         if method == "explicit":
#             u_vals = explicit_euler_ivp(y_vals, 0, guess, P, mu, dy)
#         elif method == "implicit":
#             u_vals = implicit_euler_ivp(y_vals, 0, guess, P, mu, dy)

#         u_L = u_vals[-1]
#         return u_L - U0  # Difference from the desired boundary condition u(L) = U0

#     res = root_scalar(boundary_condition_shooting, bracket=[-10, 10], method="brentq")
#     initial_slope = res.root

#     if method == "explicit":
#         u_solution = explicit_euler_ivp(y_vals, 0, initial_slope, P, mu, dy)
#     elif method == "implicit":
#         u_solution = implicit_euler_ivp(y_vals, 0, initial_slope, P, mu, dy)

#     return u_solution


# # Finite Difference method for BVP
# def finite_difference(P, mu, dy, N, U0):
#     A = np.zeros((N, N))
#     b = np.zeros(N)

#     for i in range(1, N - 1):
#         A[i, i - 1] = 1 / dy**2
#         A[i, i] = -2 / dy**2
#         A[i, i + 1] = 1 / dy**2
#         b[i] = -P / mu

#     A[0, 0] = 1
#     A[-1, -1] = 1
#     b[-1] = U0

#     u = np.linalg.solve(A, b)
#     return u


# # API endpoint for solving flow problems
# @router.post("/solve")
# async def solve_flow(params: FlowParameters):
#     results = {}

#     y_vals = np.linspace(params.y_start, params.y_end, params.N)

#     # BVP Solution using Finite Difference
#     u_bvp = finite_difference(params.P, mu, params.step_size, params.N, params.u_end)

#     # IVP Solutions using Shooting Method
#     u_shooting_explicit = shooting_method(
#         params.P, mu, params.y_end, params.u_end, params.step_size, method="explicit"
#     )
#     u_shooting_implicit = shooting_method(
#         params.P, mu, params.y_end, params.u_end, params.step_size, method="implicit"
#     )

#     # Analytical solution (for specific P values)
#     u_analytical = analytical_solution(
#         params.P, y_vals, params.y_start, params.u_start, params.u_end
#     )

#     results = {
#         "bvp": {"y": y_vals.tolist(), "u": u_bvp.tolist()},
#         "explicit": {"y": y_vals.tolist(), "u": u_shooting_explicit.tolist()},
#         "implicit": {"y": y_vals.tolist(), "u": u_shooting_implicit.tolist()},
#         "analytical": {"y": y_vals.tolist(), "u": u_analytical.tolist()},
#     }

#     return results

# # from fastapi import APIRouter, Query
# # from fastapi.middleware.cors import CORSMiddleware
# # import numpy as np
# # from typing import List, Optional, Dict
# # from pydantic import BaseModel
# # from abc import ABC, abstractmethod

# # router = APIRouter()


# # # Domain Models
# # class FlowParameters(BaseModel):
# #     P: float
# #     N: int
# #     step_size: float = 0.000001
# #     y_start: float = 0
# #     y_end: float = 1
# #     u_start: float = 0
# #     u_end: float = 1


# # def thomas_algorithm(A: np.ndarray, d: np.ndarray) -> np.ndarray:
# #     n = len(d)
# #     c = A.diagonal(1).copy()
# #     a = A.diagonal(-1).copy()
# #     b = A.diagonal().copy()
# #     x = np.zeros(n)

# #     # Forward elimination
# #     for i in range(1, n):
# #         m = a[i - 1] / b[i - 1]
# #         b[i] = b[i] - m * c[i - 1]
# #         d[i] = d[i] - m * d[i - 1]

# #     # Back substitution
# #     x[n - 1] = d[n - 1] / b[n - 1]
# #     for i in range(n - 2, -1, -1):
# #         x[i] = (d[i] - c[i] * x[i + 1]) / b[i]

# #     return x


# # def solve_bvp(P, a, b, u_a, u_b, h):
# #     N = int((b - a) / h) + 1
# #     y_values = np.linspace(a, b, N)

# #     A = np.zeros((N - 2, N - 2))
# #     rhs = np.zeros(N - 2)

# #     for i in range(1, N - 1):
# #         A[i - 1, i - 1] = -2
# #         if i > 1:
# #             A[i - 1, i - 2] = 1
# #         if i < N - 2:
# #             A[i - 1, i] = 1
# #         rhs[i - 1] = -P * h**2

# #     rhs[0] -= u_a
# #     rhs[-1] -= u_b

# #     u_internal = thomas_algorithm(A, rhs)

# #     u_values = np.zeros(N)
# #     u_values[0] = u_a
# #     u_values[1 : N - 1] = u_internal
# #     u_values[-1] = u_b

# #     return y_values.tolist(), u_values.tolist()


# # def explicit_euler(y0, v0, step_size, y_end, P):
# #     n_steps = int(y_end / step_size) + 1
# #     y_values = []
# #     u_values = []

# #     y = 0
# #     u = y0
# #     v = v0

# #     for _ in range(n_steps):
# #         y_values.append(y)
# #         u_values.append(u)

# #         u_new = u + step_size * v
# #         v_new = v - step_size * P

# #         u = u_new
# #         v = v_new
# #         y += step_size

# #     return y_values, u_values


# # def implicit_euler(y0, v0, step_size, y_end, P):
# #     n_steps = int(y_end / step_size) + 1
# #     y_values = []
# #     u_values = []

# #     y = 0
# #     u = y0
# #     v = v0

# #     for _ in range(n_steps):
# #         y_values.append(y)
# #         u_values.append(u)

# #         v_next = v - step_size * P
# #         u_next = u + step_size * v_next

# #         u = u_next
# #         v = v_next
# #         y += step_size

# #     return y_values, u_values


# # def shooting_method(P, y0, y_end, step_size):
# #     v0_lower = 0
# #     v0_upper = 10
# #     tolerance = 1e-5

# #     while (v0_upper - v0_lower) > tolerance:
# #         v0_mid = (v0_lower + v0_upper) / 2
# #         y_values, u_values = explicit_euler(y0, v0_mid, step_size, y_end, P)

# #         if u_values[-1] < 1:
# #             v0_lower = v0_mid
# #         else:
# #             v0_upper = v0_mid

# #     return (v0_lower + v0_upper) / 2


# # @router.post("/solve")
# # async def solve_flow(params: FlowParameters):
# #     results = {}

# #     # BVP Solution
# #     y_bvp, u_bvp = solve_bvp(
# #         params.P,
# #         params.y_start,
# #         params.y_end,
# #         params.u_start,
# #         params.u_end,
# #         1 / params.N,
# #     )

# #     # IVP Solutions
# #     v0 = shooting_method(params.P, params.y_start, params.y_end, params.step_size)
# #     y_explicit, u_explicit = explicit_euler(
# #         params.y_start, v0, params.step_size, params.y_end, params.P
# #     )
# #     y_implicit, u_implicit = implicit_euler(
# #         params.y_start, v0, params.step_size, params.y_end, params.P
# #     )

# #     # Analytical solution (for specific P values)
# #     y_analytical = np.linspace(params.y_start, params.y_end, 100).tolist()
# #     delta_y = params.y_end - params.y_start

# #     # Calculate coefficients for the analytical solution
# #     a = params.P / 2  # Parabolic term
# #     b = (
# #         params.u_end - params.u_start
# #     ) / delta_y - params.P * delta_y / 2  # Linear term
# #     c = params.u_start  # Constant term (boundary condition at y_start)

# #     # Compute the analytical velocity profile
# #     u_analytical = [
# #         a * (y - params.y_start) ** 2 + b * (y - params.y_start) + c
# #         for y in y_analytical
# #     ]

# #     return {
# #         "bvp": {"y": y_bvp, "u": u_bvp},
# #         "explicit": {"y": y_explicit, "u": u_explicit},
# #         "implicit": {"y": y_implicit, "u": u_implicit},
# #         "analytical": {"y": y_analytical, "u": u_analytical} if u_analytical else None,
# #     }



# # harshil


# # import numpy as np

# # from fastapi import APIRouter
# # from pydantic import BaseModel
# # from scipy.optimize import root_scalar


# # # Define parameters model
# # class FlowParameters(BaseModel):
# #     P: float  # Pressure gradient
# #     y_start: float  # Start of y-range
# #     y_end: float  # End of y-range
# #     u_start: float  # Velocity at y = y_start
# #     u_end: float  # Velocity at y = y_end
# #     N: int  # Number of steps
# #     step_size: float  # Step size for integration


# # router = APIRouter()

# # # Problem parameters (for internal function use)
# # mu = 1.0  # Dynamic viscosity
# # dy = 0.01  # Step size in y
# # L = 1.0  # Distance between the walls


# # # Set up the grid for y (internal use)
# # def get_y_vals(N, y_start, y_end):
# #     return np.linspace(y_start, y_end, N)


# # # Analytical solution for comparison
# # def analytical_solution(P, y_vals, y_start, u_start, u_end):
# #     delta_y = y_vals[-1] - y_vals[0]
# #     a = P / 2
# #     b = (u_end - u_start) / delta_y - P * delta_y / 2
# #     c = u_start
# #     return a * (y_vals - y_vals[0]) ** 2 + b * (y_vals - y_vals[0]) + c


# # # Explicit Euler method for solving the ODE system
# # def explicit_euler_ivp(y_range, u0, u0_prime, P, mu, dy):
# #     N = len(y_range)
# #     u = np.zeros(N)
# #     u_prime = np.zeros(N)
# #     u[0] = u0
# #     u_prime[0] = u0_prime

# #     for i in range(1, N):
# #         u[i] = u[i - 1] + dy * u_prime[i - 1]
# #         u_prime[i] = u_prime[i - 1] + dy * (-P / mu)

# #     return u


# # # Implicit Euler method for solving the ODE system
# # def implicit_euler_ivp(y_range, u0, u0_prime, P, mu, dy):
# #     N = len(y_range)
# #     u = np.zeros(N)
# #     u_prime = np.zeros(N)
# #     u[0] = u0
# #     u_prime[0] = u0_prime

# #     for i in range(1, N):
# #         u_prime[i] = u_prime[i - 1] + dy * (-P / mu)
# #         u[i] = u[i - 1] + dy * u_prime[i]

# #     return u


# # # Shooting method to adjust initial slope to satisfy boundary conditions
# # def shooting_method(P, mu, L, U0, dy, method="explicit"):
# #     y_vals = np.linspace(0, L, int(L / dy))

# #     def boundary_condition_shooting(guess):
# #         if method == "explicit":
# #             u_vals = explicit_euler_ivp(y_vals, 0, guess, P, mu, dy)
# #         elif method == "implicit":
# #             u_vals = implicit_euler_ivp(y_vals, 0, guess, P, mu, dy)

# #         u_L = u_vals[-1]
# #         return u_L - U0  # Difference from the desired boundary condition u(L) = U0

# #     res = root_scalar(boundary_condition_shooting, bracket=[-10, 10], method="brentq")
# #     initial_slope = res.root

# #     if method == "explicit":
# #         u_solution = explicit_euler_ivp(y_vals, 0, initial_slope, P, mu, dy)
# #     elif method == "implicit":
# #         u_solution = implicit_euler_ivp(y_vals, 0, initial_slope, P, mu, dy)

# #     return u_solution


# # # Finite Difference method for BVP
# # def finite_difference(P, mu, dy, N, U0):
# #     A = np.zeros((N, N))
# #     b = np.zeros(N)

# #     for i in range(1, N - 1):
# #         A[i, i - 1] = 1 / dy**2
# #         A[i, i] = -2 / dy**2
# #         A[i, i + 1] = 1 / dy**2
# #         b[i] = -P / mu

# #     A[0, 0] = 1
# #     A[-1, -1] = 1
# #     b[-1] = U0

# #     u = np.linalg.solve(A, b)
# #     return u


# # # API endpoint for solving flow problems
# # @router.post("/solve")
# # async def solve_flow(params: FlowParameters):
# #     results = {}

# #     y_vals = np.linspace(params.y_start, params.y_end, params.N)

# #     # BVP Solution using Finite Difference
# #     u_bvp = finite_difference(params.P, mu, params.step_size, params.N, params.u_end)

# #     # IVP Solutions using Shooting Method
# #     u_shooting_explicit = shooting_method(
# #         params.P, mu, params.y_end, params.u_end, params.step_size, method="explicit"
# #     )
# #     u_shooting_implicit = shooting_method(
# #         params.P, mu, params.y_end, params.u_end, params.step_size, method="implicit"
# #     )

# #     # Analytical solution (for specific P values)
# #     u_analytical = analytical_solution(
# #         params.P, y_vals, params.y_start, params.u_start, params.u_end
# #     )

# #     results = {
# #         "bvp": {"y": y_vals.tolist(), "u": u_bvp.tolist()},
# #         "explicit": {"y": y_vals.tolist(), "u": u_shooting_explicit.tolist()},
# #         "implicit": {"y": y_vals.tolist(), "u": u_shooting_implicit.tolist()},
# #         "analytical": {"y": y_vals.tolist(), "u": u_analytical.tolist()},
# #     }

# #     return results