"use client";
import { useState, useEffect } from "react";
import axios from "axios";

import PressureSlider from "./PressureSlider";
import VelocityChart from "./VelocityChart";
import AnimationToggle from "./AnimationToggle";
import FlowParticles from "./FlowParticle";

import { Canvas } from "@react-three/fiber";

interface VelocityDataPoint {
  y: number;
  u: number;
}

export default function Page() {
  const [pressureGradient, setPressureGradient] = useState<number>(-2);
  const [velocityData, setVelocityData] = useState<VelocityDataPoint[]>([]);
  const [animation, setAnimation] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const fetchData = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8000/api/v1/ivpbvp/compute_velocity?P=${pressureGradient}`
      );

      const { isOk, message, y, u } = response.data;

      if (isOk === "false") {
        setError(message); // Show the error message from the response
        setVelocityData([]); // Clear the velocity data
        return;
      }

      const formattedData = y.map((yValue: number, index: number) => ({
        y: yValue,
        u: u[index],
      }));

      setVelocityData(formattedData); // Set the new velocity data
      setError(""); // Clear any previous error messages
    } catch (error) {
      setError("An error occurred while fetching the data. Please try again.");
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [pressureGradient]);

  return (
    <div className="dark bg-gray-900 text-white min-h-screen p-8 relative">
      <h1 className="text-3xl font-bold mb-6">
        Couette-Poiseuille Flow Simulation
      </h1>

      {/* Show the error message if there's any */}
      {error && <div className="text-red-500 mb-4">{error}</div>}

      <PressureSlider
        pressureGradient={pressureGradient}
        setPressureGradient={setPressureGradient}
      />

      <VelocityChart velocityData={velocityData} animation={animation} />

      <AnimationToggle animation={animation} setAnimation={setAnimation} />

      {/* Canvas for the fluid flow animation */}
      <div className="absolute top-0 left-0 w-full h-full -z-10">
        <Canvas>
          <ambientLight intensity={0.1} />
          <pointLight position={[10, 10, 10]} />
          <FlowParticles />
        </Canvas>
      </div>
    </div>
  );
}

