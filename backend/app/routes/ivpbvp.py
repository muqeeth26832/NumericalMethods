from fastapi import APIRouter, HTTPException
from app.services.ivp_bvp_solver import VelocityProfile

# Define the router for the velocity profile API
router = APIRouter()


# Define the route to compute the velocity profile
@router.get("/compute_velocity")
async def compute_velocity(P: float):
    # Validate the input parameter P
    if P <= 0:
        return {
            "isOk": "false",
            "message": "Pressure gradient must be greater than zero.",
        }

    try:
        # Create an instance of VelocityProfile and compute the profile
        velocity_profile = VelocityProfile(P)
        results = velocity_profile.compute_velocity_profile()

        # Return the results
        return {
            "isOk": "true",
            "y": results["y"],
            "u_shooting": results["u_shooting"],
            "u_fd": results["u_fd"],
            "u_analytical": results["u_analytical"],
        }

    except Exception as e:
        # Handle unexpected errors gracefully
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")
