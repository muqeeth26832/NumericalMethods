// components/AnimationToggle.tsx
import React from "react";

interface AnimationToggleProps {
  animation: boolean;
  setAnimation: React.Dispatch<React.SetStateAction<boolean>>;
}

const AnimationToggle: React.FC<AnimationToggleProps> = ({
  animation,
  setAnimation,
}) => {
  return (
    <div className="flex mt-6 items-center mb-8">
      <label htmlFor="toggle-animation" className="mr-2">
        Toggle Animation:
      </label>
      <input
        id="toggle-animation"
        type="checkbox"
        checked={animation}
        onChange={() => setAnimation(!animation)}
      />
    </div>
  );
};

export default AnimationToggle;
