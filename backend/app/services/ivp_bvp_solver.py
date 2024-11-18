import numpy as np
from scipy.optimize import root_scalar
from numpy.linalg import solve

class VelocityProfile:
    def __init__(self, P, L=1.0, U0=1.0, mu=1.0, dy=0.01):
        self.P = P
        self.L = L
        self.U0 = U0
        self.mu = mu
        self.dy = dy
        self.N = int(self.L / self.dy)  # Number of discrete steps in the y-direction
        self.y_vals = np.linspace(0, self.L, self.N)  # y grid

    def analytical_solution(self):
        """
        Analytical solution for Couette-Poiseuille flow.
        Returns velocity u(y) for given pressure gradient P, viscosity mu, and wall conditions.
        """
        return (-self.P / (2 * self.mu) * self.y_vals**2) + (self.P * self.y_vals / (2 * self.mu) + self.U0 * self.y_vals / self.L)

    def explicit_euler_ivp(self, u0, u0_prime):
        """
        Solves the ODE using the explicit Euler method.
        Args:
            u0: Initial velocity
            u0_prime: Initial slope (velocity derivative)
        """
        u = np.zeros(self.N)  # Array to hold velocity values
        u_prime = np.zeros(self.N)  # Array to hold velocity gradient values
        u[0] = u0  # Boundary condition at y=0
        u_prime[0] = u0_prime  # Initial slope at y=0

        # Efficiently compute for all interior points
        for i in range(1, self.N):
            u_prime[i] = u_prime[i-1] + self.dy * (-self.P / self.mu)
            u[i] = u[i-1] + self.dy * u_prime[i]

        return u

    def implicit_euler_ivp(self, u0, u0_prime):
        """
        Solves the ODE using the implicit Euler method.
        """
        u = np.zeros(self.N)  # Array to hold velocity values
        u_prime = np.zeros(self.N)  # Array to hold velocity gradient values
        u[0] = u0  # Boundary condition at y=0
        u_prime[0] = u0_prime  # Initial slope at y=0

        # Efficiently compute for all interior points
        for i in range(1, self.N):
            u_prime[i] = u_prime[i-1] + self.dy * (-self.P / self.mu)
            u[i] = u[i-1] + self.dy * u_prime[i]

        return u

    def shooting_method(self):
        """
        Uses the shooting method to solve the boundary value problem.
        Finds the initial slope that satisfies the boundary condition at y = L.
        """
        def boundary_condition_shooting(guess):
            u_vals = self.explicit_euler_ivp(0, guess)
            return u_vals[-1] - self.U0  # Difference from desired u(L) = U0

        # Use root-finding to determine initial slope efficiently
        res = root_scalar(boundary_condition_shooting, bracket=[-10, 10], method='brentq')
        initial_slope = res.root

        # Solve the IVP with the found initial slope
        u_solution = self.explicit_euler_ivp(0, initial_slope)
        return u_solution

    def finite_difference(self):
        """
        Uses the finite difference method to solve the BVP.
        Constructs a matrix system for solving the discretized version of the ODE.
        """
        A = np.zeros((self.N, self.N))  # Coefficient matrix
        b = np.zeros(self.N)  # RHS vector

        # Use vectorized assignment for matrix population
        A[1:-1, 0:-2] = 1 / self.dy**2  # Sub-diagonal
        A[1:-1, 1:-1] = -2 / self.dy**2  # Diagonal
        A[1:-1, 2:] = 1 / self.dy**2  # Super-diagonal
        b[1:-1] = -self.P / self.mu

        # Boundary conditions
        A[0, 0] = 1  # u(0) = 0
        A[-1, -1] = 1  # u(L) = U0
        b[-1] = self.U0

        # Use efficient solver to solve the linear system
        u = solve(A, b)
        return u

    def compute_velocity_profile(self):
        """
        Computes the velocity profile using different methods.
        Returns a dictionary with y-values and corresponding u-values.
        """
        # Use Shooting Method
        u_shooting = self.shooting_method()
        # Use Finite Difference method
        u_fd = self.finite_difference()
        # Analytical solution for comparison
        u_analytical = self.analytical_solution()

        return {"y": self.y_vals.tolist(), "u_shooting": u_shooting.tolist(), "u_fd": u_fd.tolist(), "u_analytical": u_analytical.tolist()}


