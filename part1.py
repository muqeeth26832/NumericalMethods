import matplotlib.pyplot as plt
import numpy as np
from equilibria import *
# Function to define the system of ODEs
#the final code
def system_equations(u, v, P):
    du = v
    dv = -P
    return du, dv

# Function to compute the Jacobian programmatically using finite differences
def compute_jacobian(u, v, P, delta=1e-5):
    # Create the Jacobian matrix
    J = np.zeros((2,2))
    
    # Evaluate the system at the current state
    f0 = system_equations(u, v, P)
    
    # Compute partial derivatives using finite differences
    for i in range(2):  # Two variables: u and v
        # Perturb u
        if i == 0:  # Perturb u
            f1 = system_equations(u + delta, v, P)
            J[0][0] = (f1[0] - f0[0]) / delta  # du/du
            J[1][0] = (f1[1] - f0[1]) / delta  # dv/du
        else:  # Perturb v
            f1 = system_equations(u, v + delta, P)
            J[0][1] = (f1[0] - f0[0]) / delta  # du/dv
            J[1][1] = (f1[1] - f0[1]) / delta  # dv/dv

    return J

# Function to implement the Explicit Euler method for the system of ODEs
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

#     return y_values, u_values

# Function to implement the Implicit Euler method for the system of ODEs
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

# Function to perform the shooting method
def shooting_method(P, y0, y_end, step_size):
    v0_lower = 0  # Lower bound for v0
    v0_upper = 10  # Upper bound for v0
    tolerance = 1e-5

    while (v0_upper - v0_lower) > tolerance:
        v0_mid = (v0_lower + v0_upper) / 2
        y_values, u_values = explicit_euler(y0, v0_mid, step_size, y_end, P)

        if u_values[-1] < 1:  # Adjust this condition based on final value you want to check
            v0_lower = v0_mid  # Increase v0
        else:
            v0_upper = v0_mid  # Decrease v0

    return (v0_lower + v0_upper) / 2

# Function to calculate eigenvalues for both methods
def calculate_eigenvalues(mat):
   return eigenvalues_via_qr(mat)

# Function to plot the results for a given value of P
def plot_results(P, y0, y_end, step_size):
    # Find the correct initial guess for v0 using the shooting method
    v0_correct = shooting_method(P, y0, y_end, step_size)
    print(f"Correct initial derivative v0 for P={P}: {v0_correct}")

    # Solve the initial value problem with the correct v0 using smaller step size for Explicit Euler
    smaller_step_size = 0.0001  # Smaller step size
    y_values_explicit, u_values_explicit = explicit_euler(y0, v0_correct, smaller_step_size, y_end, P)

    # Solve the initial value problem with the correct v0 using Implicit Euler
    y_values_implicit, u_values_implicit = implicit_euler(y0, v0_correct, smaller_step_size, y_end, P)

    # Calculate eigenvalues
    eigen_vals = calculate_eigenvalues(compute_jacobian(y0,y_end,P))
    print("Eigenvalues of Jacobian:", eigen_vals[0].tolist())
    print("Now, since eigenvalue is 0, this matrix is not jacobian")
    #print(f"Eigenvalue of Implicit Euler: {eigen_implicit}")

    # Plot the solutions
    plt.plot(y_values_explicit, u_values_explicit, label="Explicit Euler", linestyle='--')
    plt.plot(y_values_implicit, u_values_implicit, label="Implicit Euler", linestyle='-')
    plt.xlabel("y")
    plt.ylabel("u(y)")
    plt.title(f"Solution of the Boundary Value Problem for P = {P}")
    plt.legend()
    plt.grid()
    plt.show()

# Example usage:
P_value = 10  # You can change this value to test with different P
initial_value = 0 # Initial value for u
final_value = 1# Final value for u
step_size = 0.1  # Step size for the methods

plot_results(P_value, initial_value, final_value, step_size)
