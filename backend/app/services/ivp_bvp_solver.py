import numpy as np
from scipy.optimize import root_scalar
from numpy.linalg import eigvals

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

    def explicit_euler_ivp(self, y_range, u0, u0_prime):
        """
        Solves the ODE using the explicit Euler method.
        Args:
            y_range: The y-grid
            u0: Initial velocity
            u0_prime: Initial slope (velocity derivative)
        """
        N = len(y_range)
        u = np.zeros(N)  # Array to hold velocity values
        u_prime = np.zeros(N)  # Array to hold velocity gradient values
        u[0] = u0  # Boundary condition at y=0
        u_prime[0] = u0_prime  # Initial slope at y=0

        for i in range(1, N):
            # Update velocity and gradient at each step
            u[i] = u[i-1] + self.dy * u_prime[i-1]
            u_prime[i] = u_prime[i-1] + self.dy * (-self.P / self.mu)

        return u

    def implicit_euler_ivp(self, y_range, u0, u0_prime):
        """
        Solves the ODE using the implicit Euler method.
        """
        N = len(y_range)
        u = np.zeros(N)  # Array to hold velocity values
        u_prime = np.zeros(N)  # Array to hold velocity gradient values
        u[0] = u0  # Boundary condition at y=0
        u_prime[0] = u0_prime  # Initial slope at y=0

        for i in range(1, N):
            # Implicit Euler update for velocity and gradient
            u_prime[i] = u_prime[i-1] + self.dy * (-self.P / self.mu)
            u[i] = u[i-1] + self.dy * u_prime[i]

        return u

    def shooting_method(self):
        """
        Uses the shooting method to solve the boundary value problem.
        Finds the initial slope that satisfies the boundary condition at y = L.
        """
        def boundary_condition_shooting(guess):
            u_vals = self.explicit_euler_ivp(self.y_vals, 0, guess)
            u_L = u_vals[-1]
            return u_L - self.U0  # Difference from desired u(L) = U0

        # Use root-finding to determine initial slope
        res = root_scalar(boundary_condition_shooting, bracket=[-10, 10], method='brentq')
        initial_slope = res.root

        # Solve the IVP with the found initial slope
        u_solution = self.explicit_euler_ivp(self.y_vals, 0, initial_slope)
        return u_solution

    def finite_difference(self):
        """
        Uses the finite difference method to solve the BVP.
        Constructs a matrix system for solving the discretized version of the ODE.
        """
        N = self.N
        A = np.zeros((N, N))  # Coefficient matrix
        b = np.zeros(N)  # RHS vector

        # Populate matrix A for interior points
        for i in range(1, N-1):
            A[i, i-1] = 1 / self.dy**2
            A[i, i] = -2 / self.dy**2
            A[i, i+1] = 1 / self.dy**2
            b[i] = -self.P / self.mu

        # Boundary conditions
        A[0, 0] = 1  # u(0) = 0
        A[-1, -1] = 1  # u(L) = U0
        b[-1] = self.U0

        # Solve linear system
        u = np.linalg.solve(A, b)
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



