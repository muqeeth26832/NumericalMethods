import pandas as pd
import numpy as np
from fastapi import UploadFile
from io import StringIO


async def read_csv_matrix(file: UploadFile):
    contents = await file.read()
    s = str(contents.decode("utf-8"))
    data = StringIO(s)
    df = pd.read_csv(data, header=None)

    # Check if all elements are numeric
    if not df.apply(
        lambda col: pd.to_numeric(col, errors="coerce").notnull().all()
    ).all():
        raise ValueError("All elements in the CSV must be numeric")

    # Convert to float
    df = df.astype(float)

    # Extract matrix and vectors
    matrix_A = df.iloc[:-2].values  # All rows except last two
    vector_b1 = df.iloc[-2].values  # Second last row
    vector_b2 = df.iloc[-1].values  # Last row

    # Check if matrix is square
    if matrix_A.shape[0] != matrix_A.shape[1]:
        raise ValueError("The uploaded matrix must be square")

    # Check if vectors have correct length
    if len(vector_b1) != matrix_A.shape[1] or len(vector_b2) != matrix_A.shape[1]:
        raise ValueError(
            "The vectors b1 and b2 must have the same length as the number of columns in the matrix"
        )

    return {"matrix_A": matrix_A, "vector_b1": vector_b1, "vector_b2": vector_b2}


def save_matrix_to_file(matrix, filename):
    np.savetxt(filename, matrix, delimiter=",")


def read_matrix_from_file(filename):
    return np.loadtxt(filename, delimiter=",")
