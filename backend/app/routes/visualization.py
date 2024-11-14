from fastapi import APIRouter, HTTPException
from app.services.gaussian_quarature_solver import GaussianQuadratureSolver

router = APIRouter()


@router.get("/roots/gauss-legendre")
async def get_roots_gauss_legendre_quadrature(n: int = 64):
    if n < 1:
        raise HTTPException(
            status_code=400, detail="Order of polynomial must be at least 1"
        )

    solver = GaussianQuadratureSolver(n)
    roots, weights = solver.gauss_legendre_quadrature()
    print(roots)
    return {"roots": roots.tolist(), "weights": weights.tolist()}


@router.get("/roots/symbolic-legendre")
async def get_roots_symbolic_legendre_quadrature(n: int = 64):
    if n < 1:
        raise HTTPException(
            status_code=400, detail="Order of polynomial must be at least 1"
        )

    solver = GaussianQuadratureSolver(n)
    roots, weights = solver.symbolic_legendre_quadrature()

    # Optional: print for debugging purposes
    print(roots)
    print(weights)
    return {"roots": roots.tolist(), "weights": weights.tolist()}
