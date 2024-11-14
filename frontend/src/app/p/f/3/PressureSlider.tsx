// components/PressureSlider.tsx
import React from "react";

interface PressureSliderProps {
  pressureGradient: number;
  setPressureGradient: React.Dispatch<React.SetStateAction<number>>;
}

const PressureSlider: React.FC<PressureSliderProps> = ({
  pressureGradient,
  setPressureGradient,
}) => {
  return (
    <div className="mb-4">
      <label className="block mb-2">Pressure Gradient (P):</label>
      <input
        type="range"
        min="-2"
        max="10"
        value={pressureGradient}
        onChange={(e) => setPressureGradient(Number(e.target.value))}
        className="w-full"
      />
      <span className="block mt-2">Current P: {pressureGradient}</span>
    </div>
  );
};

export default PressureSlider;
