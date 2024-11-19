# Couette-Poiseuille Flow

The **Couette-Poiseuille flow** describes the fluid motion between two parallel plates, where one plate is moving at a constant velocity, and the other is stationary. The flow is a combination of two components:
- **Couette flow**, driven by the motion of the plate.
- **Poiseuille flow**, driven by a pressure gradient.

This flow is used as a model for many practical applications in fluid dynamics, including microfluidic devices, lubrication, and blood flow in arteries.

In this implementation, we model the Couette-Poiseuille flow using a class `CouettePoiseuilleFlow`. The class implements different numerical methods to solve the governing differential equations, such as the **explicit Euler method**, **implicit Euler method**, **shooting method**, and **finite difference method**. Additionally, it provides an **analytical solution** and performs an **eigenvalue analysis** to analyze the stability of the system.

## Overview of the Class

### Parameters
The `CouettePoiseuilleFlow` class is initialized with the following parameters:

- **L**: Distance between the two plates (default: 1.0).
- **U0**: Velocity at the moving plate (boundary condition) (default: 1.0).
- **mu**: Dynamic viscosity of the fluid (default: 1.0).
- **dy**: Step size in the y-direction (default: 0.01).

### Methods

1. **`analytical_solution(P)`**
   - Calculates the analytical solution for the velocity profile at a given pressure gradient **P**.
   - The solution combines both Poiseuille and Couette components.

2. **`explicit_euler_ivp(u0, u0_prime, P)`**
   - Solves the initial value problem (IVP) using the explicit Euler method.
   - Provides a numerical approximation of the velocity profile at each step.

3. **`implicit_euler_ivp(u0, u0_prime, P)`**
   - Solves the IVP using the implicit Euler method.
   - This method is more stable for stiff problems but involves solving for future values.

4. **`shooting_method(P, method='explicit')`**
   - Uses the shooting method to solve the boundary value problem (BVP) by iteratively adjusting the initial slope.
   - The method can be applied with either the explicit or implicit Euler method for numerical integration.

5. **`finite_difference(P)`**
   - Uses the finite difference method to solve the BVP.
   - This method approximates derivatives using discrete steps and forms a system of equations to be solved.

6. **`eigenvalue_analysis(P)`**
   - Computes the eigenvalues of the Jacobian matrix of the system.
   - Used for analyzing the stability of the numerical solution, especially for explicit methods.

7. **`plot_solutions(P_values)`**
   - Plots the velocity profiles for different pressure gradients **P**.
   - Compares the results of the shooting method, finite difference method, and the analytical solution.
   - Prints eigenvalues for each pressure gradient to assist with stability analysis.

## Example Usage

```python
# Create an instance of the Couette-Poiseuille flow model
flow = CouettePoiseuilleFlow()

# Define a list of pressure gradients to simulate
P_values = [0.5, 1.0, 2.0]

# Plot the solutions for these pressure gradients
flow.plot_solutions(P_values)

