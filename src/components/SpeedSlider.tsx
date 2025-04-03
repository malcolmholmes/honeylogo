import React from 'react';

interface SpeedSliderProps {
  speed: number;
  onChange: (speed: number) => void;
}

const SpeedSlider: React.FC<SpeedSliderProps> = ({ speed, onChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(parseInt(e.target.value, 10));
  };

  return (
    <div className="card">
      <div className="card-body py-2">
        <div className="d-flex align-items-center">
          <span className="mr-2">Speed:</span>
          <input
            type="range"
            className="custom-range flex-grow-1 mx-2"
            min="0"
            max="100"
            value={speed}
            onChange={handleChange}
            aria-label="Turtle speed"
          />
          <span className="badge badge-primary ml-2">{speed}%</span>
        </div>
      </div>
    </div>
  );
};

export default SpeedSlider;
