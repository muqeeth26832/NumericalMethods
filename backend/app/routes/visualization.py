from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from app.services.gaussian_quarature_solver import GaussianQuadratureSolver

router = APIRouter()

@router.get("/roots/gauss-legendre-quadrature")
async def get_roots_gauss_legendre_quadrature(n: int = 64):
  if n < 1:
    raise HTTPException(
      status_code=400, detail="Order of polynomial must be at least 1"
    )

  solver = GaussianQuadratureSolver(n)
  roots, weights = solver.gauss_legendre_quadrature()
  return JSONResponse(content={"roots": roots.tolist(), "weights": weights.tolist()})

@router.get("/roots/symbolic-legendre-quadrature")
async def get_roots_symbolic_legendre_quadrature(n: int = 64):
  if n < 1:
    raise HTTPException(
      status_code=400, detail="Order of polynomial must be at least 1"
    )

  solver = GaussianQuadratureSolver(n)
  roots, weights = solver.symbolic_legendre_quadrature()
  return JSONResponse(content={"roots": roots, "weights": weights})


@router.get("/gauss-legendre-quadrature")
async def get_gauss_legendre_quadrature(n: int = 64):
    if n < 1:
        raise HTTPException(
            status_code=400, detail="Order of polynomial must be at least 1"
        )

    solver = GaussianQuadratureSolver(n)
    roots, weights = solver.gauss_legendre_quadrature()
    return JSONResponse(content={"roots": roots.tolist(), "weights": weights.tolist()})


@router.get("/symbolic-legendre-quadrature")
async def get_symbolic_legendre_quadrature(n: int = 64):
    if n < 1:
        raise HTTPException(
            status_code=400, detail="Order of polynomial must be at least 1"
        )

    solver = GaussianQuadratureSolver(n)
    roots, weights = solver.symbolic_legendre_quadrature()
    return JSONResponse(content={"roots": roots, "weights": weights})
