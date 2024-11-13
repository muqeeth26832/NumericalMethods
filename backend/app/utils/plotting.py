# app/utils/plotting.py
import matplotlib.pyplot as plt
import numpy as np
import os
from app.config import settings


def plot_matrix(matrix: np.ndarray) -> str:
    plt.figure(figsize=(10, 8))
    plt.imshow(matrix, cmap="viridis")
    plt.colorbar()
    plt.title("Matrix Visualization")
    filename = os.path.join(settings.STATIC_DIR, "matrix_plot.png")
    plt.savefig(filename)
    plt.close()
    return filename


def plot_eigenvalues(eigenvalues: np.ndarray) -> str:
    plt.figure(figsize=(10, 8))
    plt.scatter(np.real(eigenvalues), np.imag(eigenvalues))
    plt.xlabel("Real part")
    plt.ylabel("Imaginary part")
    plt.title("Eigenvalue Distribution")
    filename = os.path.join(settings.STATIC_DIR, "eigenvalues_plot.png")
    plt.savefig(filename)
    plt.close()
    return filename
