import numpy as np
import matplotlib.pyplot as plt
from scipy.optimize import root_scalar
from numpy.linalg import eigvals

class CouettePoiseuilleFlow:
    def __init__(self, L=1.0, U0=1.0, mu=1.0, dy=0.01):
        self.L = L  # Distance between the walls
        self.U0 = U0  # Velocity at y = L (boundary condition)
        self.mu = mu  # Dynamic viscosity
        self.dy = dy  # Step size in the y-direction
        self.N = int(L / dy)  # Number of discrete steps in the y-direction
        self.y_vals = np.linspace(0, L, self.N)  # y-grid

    def analytical_solution(self, P):
        """Analytical solution for Couette-Poiseuille flow."""
        return (-P / (2 * self.mu) * self.y_vals**2) + (P * self.y_vals / (2 * self.mu) + self.U0 * self.y_vals / self.L)

    def explicit_euler_ivp(self, u0, u0_prime, P):
        """Solves the ODE using the explicit Euler method."""
        u = np.zeros(self.N)
        u_prime = np.zeros(self.N)
        u[0] = u0
        u_prime[0] = u0_prime

        for i in range(1, self.N):
            u[i] = u[i-1] + self.dy * u_prime[i-1]
            u_prime[i] = u_prime[i-1] + self.dy * (-P / self.mu)

        return u

    def implicit_euler_ivp(self, u0, u0_prime, P):
        """Solves the ODE using the implicit Euler method."""
        u = np.zeros(self.N)
        u_prime = np.zeros(self.N)
        u[0] = u0
        u_prime[0] = u0_prime

        for i in range(1, self.N):
            u_prime[i] = u_prime[i-1] + self.dy * (-P / self.mu)
            u[i] = u[i-1] + self.dy * u_prime[i]

        return u

    def shooting_method(self, P, method='explicit'):
        """Uses the shooting method to solve the boundary value problem."""
        def boundary_condition_shooting(guess):
            if method == 'explicit':
                u_vals = self.explicit_euler_ivp(0, guess, P)
            elif method == 'implicit':
                u_vals = self.implicit_euler_ivp(0, guess, P)

            return u_vals[-1] - self.U0  # Difference from desired u(L) = U0

        res = root_scalar(boundary_condition_shooting, bracket=[-10, 10], method='brentq')
        initial_slope = res.root

        if method == 'explicit':
            return self.explicit_euler_ivp(0, initial_slope, P)
        elif method == 'implicit':
            return self.implicit_euler_ivp(0, initial_slope, P)

    def finite_difference(self, P):
        """Uses the finite difference method to solve the BVP."""
        A = np.zeros((self.N, self.N))
        b = np.zeros(self.N)

        for i in range(1, self.N - 1):
            A[i, i-1] = 1 / self.dy**2
            A[i, i] = -2 / self.dy**2
            A[i, i+1] = 1 / self.dy**2
            b[i] = -P / self.mu

        A[0, 0] = 1           # Boundary condition: u(0) = 0
        A[-1, -1] = 1         # Boundary condition: u(L) = U0
        b[-1] = self.U0

        return np.linalg.solve(A, b)

    def eigenvalue_analysis(self, P):
        """Computes eigenvalues for stability analysis of Explicit Euler."""
        J = np.array([[0, 1], [-P/self.mu, 0]])  # Jacobian matrix for Couette-Poiseuille system
        return eigvals(J)

    def plot_solutions(self, P_values):
        """Plots solutions for different pressure gradients."""
        plt.figure(figsize=(12, 8))

        for P in P_values:
            # Solutions using different methods
            u_shooting_explicit = self.shooting_method(P, method='explicit')
            u_shooting_implicit = self.shooting_method(P, method='implicit')
            u_fd = self.finite_difference(P)
            u_analytical = self.analytical_solution(P)

            # Eigenvalue analysis
            eigenvalues = self.eigenvalue_analysis(P)
            print(f"Eigenvalues for P={P}: {eigenvalues}")

            # Plot each solution
            plt.plot(self.y_vals, u_shooting_explicit, label=f'Shooting Explicit Euler (P={P})')
            plt.plot(self.y_vals, u_shooting_implicit, '--', label=f'Shooting Implicit Euler (P={P})')
            plt.plot(self.y_vals, u_fd, '-.', label=f'Finite Difference (P={P})')
            plt.plot(self.y_vals, u_analytical, ':', label=f'Analytical (P={P})')

        # Label and show the plot
        plt.xlabel('y')
        plt.ylabel('u(y)')
        plt.title('Velocity Profile for Couette-Poiseuille Flow using Various Methods')
        plt.legend(loc='upper left')
        plt.grid(True)
        plt.show()


