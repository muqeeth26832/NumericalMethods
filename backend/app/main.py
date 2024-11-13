from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import matrix, visualization  # Import the new visualization router

app = FastAPI(title="Advanced Matrix Operations API", version="1.1.0")

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(matrix.router, prefix="/api/v1/matrix", tags=["matrix"])
app.include_router(
    visualization.router, prefix="/api/v1/visualization", tags=["visualization"]
)


@app.get("/")
async def root():
    return {"message": "Welcome to the Advanced Matrix Operations API!"}
