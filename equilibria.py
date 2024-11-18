
import numpy as np
from scipy.linalg import lu, inv, hilbert, eigvals
from numpy.linalg import cond, det, solve, qr



def read_matrix_and_vectors(file_name):
    """Reading matrix A and vectors b1 and b2 from a file"""

    data = np.loadtxt(file_name, delimiter=',')

    A = data[:5, :5]  # 5x5 matrix
    b1 = data[5, :]   # first vector
    b2 = data[6, :]   # second vector

    return A, b1, b2





def is_identity(A,tolerance = 1e-200):
    """To check if the input matrix is Identity matrix."""
    n = A.shape[0]

    for i in range(n):
        for j in range(n):
            if i == j :
                if abs(A[i,j] - 1 > tolerance):
                    return "Not"
            else:
                if abs(A[i,j]  > tolerance):
                    return "Not"
                
    return "Yes"

    



def eigenvalues_via_lu(A,max_iterations=10000):
    """ Finds out the eigenvalues using LU decomposition as per  the method given by Sir"""

    n = A.shape[0]
    iterations = 0

    while iterations < max_iterations:
        # LU decomposition using SciPy's built-in method
        P, L, U = lu(A)
        
        # Multiply U and L to get the next iteration of A
        A_next = U @ L
        
        if is_identity(L) == "Yes" or is_identity(U) == "Yes" :
            if is_identity(L) ==  "Yes" :
                # print(L)
                eigenvalues = np.diag(U)
            
            if is_identity(U) ==  "Yes" :
                # print(U)
                eigenvalues = np.diag(U)

            break

        # Update A for the next iteration
        A = A_next
        iterations += 1

    return eigenvalues, iterations





def eigenvalues_via_qr(A, tolerance=1e-10, max_iterations=1000):
    """Finds eigenvalues using the QR decomposition method,
        returns the eigenvalues and the number of iteration that were needed."""
    
    n = A.shape[0]
    iterations = 0
    diff = np.inf

    while diff > tolerance and iterations < max_iterations:
        # QR decomposition
        Q, R = qr(A)
        
        # Multiply R and Q to get the next iteration of A
        A_next = R @ Q
        
        # Check for convergence by comparing the diagonals
        diff = np.max(np.abs(np.diag(A_next) - np.diag(A)))
        
        # Update A for the next iteration
        A = A_next
        iterations += 1

    # Return the diagonal as the eigenvalues and number of iterations
    eigenvalues = np.diag(A)
    return eigenvalues, iterations





def power_method(A, num_iterations=1000, tol=1e-9):
    """Finds the largest eigenvalues using the power method."""

    n, _ = A.shape
    b = np.random.rand(n)
    b = b / np.linalg.norm(b)
    
    for _ in range(num_iterations):
        b_next = np.dot(A, b)
        b_next = b_next / np.linalg.norm(b_next)
        
        # Check for convergence
        if np.linalg.norm(b - b_next) < tol:
            break
        b = b_next
    
    eigenvalue = np.dot(b.T, np.dot(A, b)) / np.dot(b.T, b)
    return eigenvalue





def eigenvalue_polynomial(eigenvalues):
    """Generates a polynimial with given set of eigenvalues
       that is the characteristic equation."""
    
    # Generate the coefficients of the polynomial whose roots are the eigenvalues
    polynomial_coefficients = np.poly(eigenvalues)  # np.poly generates the coefficients
    # Create a readable polynomial equation
    characteristic_polynomial = np.poly1d(polynomial_coefficients)
    
    return characteristic_polynomial





def solve_using_lu(A, b):
    """Solves the given matrix equation using LU decomposition
    forward and backward substitution."""

    # Step 1: Perform LU decomposition
    P,L, U = lu(A)
    
    # Step 2: Forward substitution to solve Ly = b
    y = np.zeros_like(b)
    
    for i in range(len(y)):
        y[i] = b[i] - np.dot(L[i, :i], y[:i])
    
    # Step 3: Back substitution to solve Ux = y
    x = np.zeros_like(y)
    
    for i in range(len(x) - 1, -1, -1):
        x[i] = (y[i] - np.dot(U[i, i + 1:], x[i + 1:])) / U[i, i]
    
    return x


def thomas_algorithm(A, rhs):
    """
    Solve a tridiagonal system Ax = rhs using the Thomas algorithm.
    
    Parameters:
    A (numpy array): The tridiagonal matrix.
    rhs (numpy array): The right-hand side vector.
    
    Returns:
    x (numpy array): The solution vector.
    """
    n = len(rhs)
    c_prime = np.zeros(n-1)
    d_prime = np.zeros(n)
    
    # Forward sweep
    c_prime[0] = A[0, 1] / A[0, 0]
    d_prime[0] = rhs[0] / A[0, 0]
    for i in range(1, n-1):
        denom = A[i, i] - A[i, i-1] * c_prime[i-1]
        c_prime[i] = A[i, i+1] / denom
        d_prime[i] = (rhs[i] - A[i, i-1] * d_prime[i-1]) / denom
    d_prime[-1] = (rhs[-1] - A[-1, -2] * d_prime[-2]) / (A[-1, -1] - A[-1, -2] * c_prime[-2])
    
    # Back substitution
    x = np.zeros(n)
    x[-1] = d_prime[-1]
    for i in range(n-2, -1, -1):
        x[i] = d_prime[i] - c_prime[i] * x[i+1]
    
    return x




def solve_tridiagonal(A, rhs):
    """
    Solves a tridiagonal matrix system A * u = rhs using forward elimination and back substitution.

    Parameters:
    - A: 2D numpy array (N-1, N-1), tridiagonal coefficient matrix.
    - rhs: 1D numpy array, right-hand side vector.

    Returns:
    - u_interior: Solution vector for the interior points.
    """
    N = len(rhs)

    # Forward Elimination to transform A into upper triangular form
    for i in range(1, N):
        factor = A[i, i - 1] / A[i - 1, i - 1]
        A[i, i] -= factor * A[i - 1, i]
        rhs[i] -= factor * rhs[i - 1]

    # Back Substitution to solve for u_interior
    u_interior = np.zeros(N)
    u_interior[-1] = rhs[-1] / A[-1, -1]

    for i in range(N - 2, -1, -1):
        u_interior[i] = (rhs[i] - A[i, i + 1] * u_interior[i + 1]) / A[i, i]

    return u_interior




def print_section(title):
    """Define a simple function to print headers and dividers"""

    print(f"\n{'='*60}")
    print(f"{title:^60}")
    print(f"{'='*60}")





def print_subsection(title):
    """Define a simple function to print sections and dividers"""

    print(f"\n{'-'*60}")
    print(f"{title:^60}")
    print(f"{'-'*60}")