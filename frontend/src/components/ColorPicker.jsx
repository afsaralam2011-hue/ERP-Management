// src/components/ColorPicker.jsx
import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

const ColorPicker = () => {
  const { theme } = useTheme();
  
  return (
    <div className="p-4">
      <h3>Color Picker</h3>
      <p>Current theme: {theme.name}</p>
    </div>
  );
};

export default ColorPicker;