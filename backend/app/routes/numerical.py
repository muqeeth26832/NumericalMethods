import numpy as np
import matplotlib.pyplot as plt
from scipy.optimize import root_scalar

# Problem parameters
L = 1.0       # Distance between the walls
U0 = 1.0      # Velocity at y = L
P_values = [-2, 0, 2, 5, 10]  # Different values of pressure gradient
mu = 1.0      # Dynamic viscosity
dy = 0.01     # Step size in y
N = int(L / dy)  # Number of steps in the y direction

# Set up the grid for y
y_vals = np.linspace(0, L, N)

# Analytical solution for comparison
def analytical_solution(P, y, L, U0):
    return (-P / (2 * mu) * y**2) + (P * y / (2 * mu) + U0 * y / L)

# Explicit Euler method for solving the ODE system
def explicit_euler_ivp(y_range, u0, u0_prime, P, mu, dy):
    N = len(y_range)
    u = np.zeros(N)
    u_prime = np.zeros(N)
    u[0] = u0
    u_prime[0] = u0_prime

    for i in range(1, N):
        u[i] = u[i-1] + dy * u_prime[i-1]
        u_prime[i] = u_prime[i-1] + dy * (-P / mu)

    return u

# Implicit Euler method for solving the ODE system
def implicit_euler_ivp(y_range, u0, u0_prime, P, mu, dy):
    N = len(y_range)
    u = np.zeros(N)
    u_prime = np.zeros(N)
    u[0] = u0
    u_prime[0] = u0_prime

    for i in range(1, N):
        # Iterative step for implicit Euler
        u_prime[i] = u_prime[i-1] + dy * (-P / mu)
        u[i] = u[i-1] + dy * u_prime[i]

    return u

# Shooting method to adjust initial slope to satisfy boundary conditions
def shooting_method(P, mu, L, U0, dy, method='explicit'):
    def boundary_condition_shooting(guess):
        # Choose the solver based on the method argument
        if method == 'explicit':
            u_vals = explicit_euler_ivp(y_vals, 0, guess, P, mu, dy)
        elif method == 'implicit':
            u_vals = implicit_euler_ivp(y_vals, 0, guess, P, mu, dy)
        
        # Evaluate solution at y = L
        u_L = u_vals[-1]
        return u_L - U0  # Difference from the desired boundary condition u(L) = U0

    # Find the correct initial slope using a root-finding method
    res = root_scalar(boundary_condition_shooting, bracket=[-10, 10], method='brentq')
    initial_slope = res.root

    # Solve the IVP with the found initial slope using the specified method
    if method == 'explicit':
        u_solution = explicit_euler_ivp(y_vals, 0, initial_slope, P, mu, dy)
    elif method == 'implicit':
        u_solution = implicit_euler_ivp(y_vals, 0, initial_slope, P, mu, dy)

    return u_solution

# Finite Difference method for BVP
def finite_difference(P, mu, dy, N, U0):
    A = np.zeros((N, N))
    b = np.zeros(N)

    # Fill matrix A for interior points
    for i in range(1, N-1):
        A[i, i-1] = 1 / dy**2
        A[i, i] = -2 / dy**2
        A[i, i+1] = 1 / dy**2
        b[i] = -P / mu

    # Boundary conditions
    A[0, 0] = 1  # u(0) = 0
    A[-1, -1] = 1
    b[-1] = U0  # u(L) = U0

    # Solve the system
    u = np.linalg.solve(A, b)
    return u

# Plotting solutions for different values of P
plt.figure(figsize=(12, 8))

for P in P_values:
    # Shooting method solution with Explicit Euler
    u_shooting_explicit = shooting_method(P, mu, L, U0, dy, method='explicit')
    # Shooting method solution with Implicit Euler
    u_shooting_implicit = shooting_method(P, mu, L, U0, dy, method='implicit')
    # Finite difference solution
    u_fd = finite_difference(P, mu, dy, N, U0)
    # Analytical solution
    u_analytical = analytical_solution(P, y_vals, L, U0)
    
    # Plot each method's solution
    plt.plot(y_vals, u_shooting_explicit, label=f'Shooting Explicit Euler (P={P})')
    plt.plot(y_vals, u_shooting_implicit, '--', label=f'Shooting Implicit Euler (P={P})')
    plt.plot(y_vals, u_fd, '-.', label=f'Finite Difference (P={P})')
    plt.plot(y_vals, u_analytical, ':', label=f'Analytical (P={P})')

# Labeling the plot
plt.xlabel('y')
plt.ylabel('u(y)')
plt.title('Velocity Profile for Couette-Poiseuille Flow using Various Methods')
plt.legend(loc='upper left')
plt.grid(True)
plt.show()
