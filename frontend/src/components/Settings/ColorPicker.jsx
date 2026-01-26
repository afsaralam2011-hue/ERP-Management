// src/components/Settings/ColorPicker.jsx

import React, { useState, useEffect } from 'react';
import { isValidHexColor } from '../../utils/themeUtils';
import './ColorPicker.css';

const ColorPicker = ({ 
  color = '#1976D2', 
  onChange, 
  label = 'Pick Color',
  showInput = true 
}) => {
  const [selectedColor, setSelectedColor] = useState(color);
  const [inputValue, setInputValue] = useState(color);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setSelectedColor(color);
    setInputValue(color);
  }, [color]);

  const handleColorChange = (e) => {
    const newColor = e.target.value;
    setSelectedColor(newColor);
    setInputValue(newColor);
    if (onChange) {
      onChange(newColor);
    }
  };

  const handleInputChange = (e) => {
    let value = e.target.value;
    
    // Add # if not present
    if (value && !value.startsWith('#')) {
      value = '#' + value;
    }
    
    setInputValue(value);
    
    // Validate and update color if valid
    if (isValidHexColor(value)) {
      setSelectedColor(value);
      if (onChange) {
        onChange(value);
      }
    }
  };

  const handleInputBlur = () => {
    // Reset to last valid color if invalid
    if (!isValidHexColor(inputValue)) {
      setInputValue(selectedColor);
    }
  };

  return (
    <div className="color-picker">
      {label && <label className="color-picker-label">{label}</label>}
      
      <div className="color-picker-wrapper">
        <div className="color-picker-preview-wrapper">
          <div 
            className="color-picker-preview"
            style={{ backgroundColor: selectedColor }}
            onClick={() => setIsOpen(!isOpen)}
          >
            <input
              type="color"
              value={selectedColor}
              onChange={handleColorChange}
              className="color-picker-input-hidden"
            />
          </div>
        </div>

        {showInput && (
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            className="color-picker-text-input"
            placeholder="#000000"
            maxLength={7}
          />
        )}
      </div>
    </div>
  );
};

export default ColorPicker;