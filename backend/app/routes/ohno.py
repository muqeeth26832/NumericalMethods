import numpy as np
import matplotlib.pyplot as plt
from scipy.optimize import root_scalar
from numpy.linalg import eigvals

# Problem parameters
L = 1.0       # Distance between the walls
U0 = 1.0      # Velocity at y = L (boundary condition)
P_values = [-2, 0, 2, 5, 10]  # Different pressure gradient values
mu = 1.0      # Dynamic viscosity
dy = 0.01     # Step size in the y-direction
N = int(L / dy)  # Number of discrete steps in the y-direction

# Setting up the grid in the y-direction from 0 to L
y_vals = np.linspace(0, L, N)

# Analytical solution for comparison
def analytical_solution(P, y, L, U0):
    """
    Analytical solution for Couette-Poiseuille flow.
    Returns velocity u(y) for given pressure gradient P, viscosity mu, and wall conditions.
    """
    return (-P / (2 * mu) * y**2) + (P * y / (2 * mu) + U0 * y / L)

# Explicit Euler method for solving the ODE
def explicit_euler_ivp(y_range, u0, u0_prime, P, mu, dy):
    """
    Solves the ODE using the explicit Euler method.
    Args:
        y_range: The y-grid
        u0: Initial velocity
        u0_prime: Initial slope (velocity derivative)
        P: Pressure gradient
        mu: Dynamic viscosity
        dy: Step size in y
    """
    N = len(y_range)
    u = np.zeros(N)       # Array to hold velocity values
    u_prime = np.zeros(N) # Array to hold velocity gradient values
    u[0] = u0             # Boundary condition at y=0
    u_prime[0] = u0_prime # Initial slope at y=0

    for i in range(1, N):
        # Update velocity and gradient at each step
        u[i] = u[i-1] + dy * u_prime[i-1]
        u_prime[i] = u_prime[i-1] + dy * (-P / mu)

    return u

# Implicit Euler method for solving the ODE
def implicit_euler_ivp(y_range, u0, u0_prime, P, mu, dy):
    """
    Solves the ODE using the implicit Euler method.
    Args:
        y_range: The y-grid
        u0: Initial velocity
        u0_prime: Initial slope (velocity derivative)
        P: Pressure gradient
        mu: Dynamic viscosity
        dy: Step size in y
    """
    N = len(y_range)
    u = np.zeros(N)       # Array to hold velocity values
    u_prime = np.zeros(N) # Array to hold velocity gradient values
    u[0] = u0             # Boundary condition at y=0
    u_prime[0] = u0_prime # Initial slope at y=0

    for i in range(1, N):
        # Implicit Euler update for velocity and gradient
        u_prime[i] = u_prime[i-1] + dy * (-P / mu)
        u[i] = u[i-1] + dy * u_prime[i]

    return u

# Shooting method to adjust initial slope to satisfy boundary conditions
def shooting_method(P, mu, L, U0, dy, method='explicit'):
    """
    Uses the shooting method to solve the boundary value problem.
    Finds the initial slope that satisfies the boundary condition at y = L.
    Args:
        P: Pressure gradient
        mu: Dynamic viscosity
        L: Length between the walls
        U0: Boundary velocity at y = L
        dy: Step size in y
        method: 'explicit' or 'implicit' to choose solver type
    """
    def boundary_condition_shooting(guess):
        # Choose solver based on the specified method
        if method == 'explicit':
            u_vals = explicit_euler_ivp(y_vals, 0, guess, P, mu, dy)
        elif method == 'implicit':
            u_vals = implicit_euler_ivp(y_vals, 0, guess, P, mu, dy)
        
        # Check the boundary condition at y = L
        u_L = u_vals[-1]
        return u_L - U0  # Difference from desired u(L) = U0

    # Use root-finding to determine initial slope
    res = root_scalar(boundary_condition_shooting, bracket=[-10, 10], method='brentq')
    initial_slope = res.root

    # Solve the IVP with the found initial slope using specified method
    if method == 'explicit':
        u_solution = explicit_euler_ivp(y_vals, 0, initial_slope, P, mu, dy)
    elif method == 'implicit':
        u_solution = implicit_euler_ivp(y_vals, 0, initial_slope, P, mu, dy)

    return u_solution

# Finite Difference method for solving the BVP
def finite_difference(P, mu, dy, N, U0):
    """
    Uses the finite difference method to solve the BVP.
    Constructs a matrix system for solving the discretized version of the ODE.
    Args:
        P: Pressure gradient
        mu: Dynamic viscosity
        dy: Step size in y
        N: Number of steps in y direction
        U0: Boundary velocity at y = L
    """
    A = np.zeros((N, N))  # Coefficient matrix
    b = np.zeros(N)       # RHS vector

    # Populate matrix A for interior points
    for i in range(1, N-1):
        A[i, i-1] = 1 / dy**2
        A[i, i] = -2 / dy**2
        A[i, i+1] = 1 / dy**2
        b[i] = -P / mu

    # Boundary conditions
    A[0, 0] = 1           # u(0) = 0
    A[-1, -1] = 1         # u(L) = U0
    b[-1] = U0

    # Solve linear system
    u = np.linalg.solve(A, b)
    return u

# Eigenvalue analysis for stability (Explicit Euler)
def eigenvalue_analysis(P, mu, dy):
    """
    Computes eigenvalues for stability analysis of Explicit Euler.
    """
    J = np.array([[0, 1], [-P/mu, 0]])  # Jacobian matrix for Couette-Poiseuille system
    eigenvalues = eigvals(J)
    return eigenvalues

# Plotting solutions for different pressure gradients
plt.figure(figsize=(12, 8))

for P in P_values:
    # Solution using Shooting method with Explicit Euler
    u_shooting_explicit = shooting_method(P, mu, L, U0, dy, method='explicit')
    # Solution using Shooting method with Implicit Euler
    u_shooting_implicit = shooting_method(P, mu, L, U0, dy, method='implicit')
    # Solution using Finite Difference method
    u_fd = finite_difference(P, mu, dy, N, U0)
    # Analytical solution for comparison
    u_analytical = analytical_solution(P, y_vals, L, U0)
    
    # Eigenvalue analysis
    eigenvalues = eigenvalue_analysis(P, mu, dy)
    print(f"Eigenvalues for P={P}: {eigenvalues}")
    
    # Plot each solution
    plt.plot(y_vals, u_shooting_explicit, label=f'Shooting Explicit Euler (P={P})')
    plt.plot(y_vals, u_shooting_implicit, '--', label=f'Shooting Implicit Euler (P={P})')
    plt.plot(y_vals, u_fd, '-.', label=f'Finite Difference (P={P})')
    plt.plot(y_vals, u_analytical, ':', label=f'Analytical (P={P})')

# Label and show the plot
plt.xlabel('y')
plt.ylabel('u(y)')
plt.title('Velocity Profile for Couette-Poiseuille Flow using Various Methods')
plt.legend(loc='upper left')
plt.grid(True)
plt.show()