// src/components/Settings/ColorPicker.jsx

import React, { useState, useRef, useEffect } from 'react';
import './ColorPicker.css';

/**
 * کلر پکر کمپوننٹ
 * یہ کمپوننٹ رنگ منتخب کرنے کے لیے استعمال ہوتا ہے
 */
const ColorPicker = ({ 
  label, 
  color = '#1976D2', 
  onChange, 
  className = '',
  showPreview = true,
  showInput = true,
  showPresets = true,
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputColor, setInputColor] = useState(color);
  const [hue, setHue] = useState(210);
  const [saturation, setSaturation] = useState(100);
  const [lightness, setLightness] = useState(50);
  const [alpha, setAlpha] = useState(100);
  const [colorFormat, setColorFormat] = useState('hex'); // 'hex', 'rgb', 'hsl'
  
  const pickerRef = useRef(null);
  const colorPreviewRef = useRef(null);

  // پری ڈیفائنڈ رنگوں کا سیٹ - BLACK سے INDIGO/NAVY میں تبدیل
  const colorPresets = {
    primary: [
      '#1976D2', '#2196F3', '#03A9F4', '#00BCD4', '#009688',
      '#4CAF50', '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107',
      '#FF9800', '#FF5722', '#F44336', '#E91E63', '#9C27B0'
    ],
    grayscale: [
      '#1A237E', '#283593', '#303F9F', '#3949AB', '#3F51B5', // INDIGO/NAVY shades
      '#5C6BC0', '#7986CB', '#9FA8DA', '#C5CAE9', '#E8EAF6',
      '#F3F4F9', '#FFFFFF'
    ],
    material: [
      '#FF5252', '#FF4081', '#E040FB', '#7C4DFF', '#536DFE',
      '#448AFF', '#40C4FF', '#18FFFF', '#64FFDA', '#69F0AE',
      '#B2FF59', '#EEFF41', '#FFFF00', '#FFD740', '#FFAB40'
    ],
    indigo: [  // نیا INDIGO رنگوں کا سیٹ
      '#0D1B2A', '#1B263B', '#2D3E5D', '#415A77', '#5C7AA5',
      '#7986CB', '#9FA8DA', '#C5CAE9', '#E8EAF6', '#F3F4F9'
    ]
  };

  // رنگ کو مختلف فارمیٹس میں تبدیل کرنے کے فنکشنز
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  };

  const rgbToHex = (r, g, b) => {
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  };

  const rgbToHsl = (r, g, b) => {
    r /= 255;
    g /= 255;
    b /= 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0; // achromatic
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
        default: h = 0;
      }
      
      h /= 6;
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  };

  const hslToRgb = (h, s, l) => {
    h /= 360;
    s /= 100;
    l /= 100;
    
    let r, g, b;

    if (s === 0) {
      r = g = b = l; // achromatic
    } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }

    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255)
    };
  };

  // ہیکس رنگ کی تصدیق
  const isValidHex = (hex) => {
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);
  };

  // رنگ کو مختلف فارمیٹس میں ڈسپلے کرنے کے لیے
  const formatColor = () => {
    switch (colorFormat) {
      case 'hex':
        return inputColor;
      case 'rgb':
        const rgb = hexToRgb(inputColor);
        return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
      case 'hsl':
        const rgb2 = hexToRgb(inputColor);
        const hsl = rgbToHsl(rgb2.r, rgb2.g, rgb2.b);
        return `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
      default:
        return inputColor;
    }
  };

  // ابتدائی ترتیب
  useEffect(() => {
    if (color && isValidHex(color)) {
      setInputColor(color.toUpperCase());
      const rgb = hexToRgb(color);
      const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
      setHue(hsl.h);
      setSaturation(hsl.s);
      setLightness(hsl.l);
    }
  }, [color]);

  // باہر کلک کرنے پر کلوز
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // رنگ تبدیل ہونے پر
  useEffect(() => {
    if (!isValidHex(inputColor)) return;
    
    const rgb = hexToRgb(inputColor);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    setHue(hsl.h);
    setSaturation(hsl.s);
    setLightness(hsl.l);
    
    if (onChange && inputColor !== color) {
      onChange(inputColor);
    }
  }, [inputColor, onChange, color]);

  // HSL سے ہیکس میں تبدیل
  const updateColorFromHSL = (h, s, l, a = alpha) => {
    const rgb = hslToRgb(h, s, l);
    const newColor = rgbToHex(rgb.r, rgb.g, rgb.b);
    setInputColor(newColor);
  };

  // رنگ منتخب کرنے کا ہینڈلر
  const handleColorChange = (newColor) => {
    if (isValidHex(newColor)) {
      setInputColor(newColor.toUpperCase());
    }
  };

  // HSL سلائیڈرز کا ہینڈلر
  const handleHueChange = (e) => {
    const newHue = parseInt(e.target.value);
    setHue(newHue);
    updateColorFromHSL(newHue, saturation, lightness);
  };

  const handleSaturationChange = (e) => {
    const newSaturation = parseInt(e.target.value);
    setSaturation(newSaturation);
    updateColorFromHSL(hue, newSaturation, lightness);
  };

  const handleLightnessChange = (e) => {
    const newLightness = parseInt(e.target.value);
    setLightness(newLightness);
    updateColorFromHSL(hue, saturation, newLightness);
  };

  const handleAlphaChange = (e) => {
    const newAlpha = parseInt(e.target.value);
    setAlpha(newAlpha);
  };

  // ان پٹ کا ہینڈلر
  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputColor(value);
  };

  // ان پٹ پر انٹر
  const handleInputKeyPress = (e) => {
    if (e.key === 'Enter') {
      if (isValidHex(inputColor)) {
        onChange(inputColor);
        setIsOpen(false);
      } else {
        setInputColor(color);
      }
    }
  };

  // رنگ فارمیٹ تبدیل کریں
  const toggleColorFormat = () => {
    const formats = ['hex', 'rgb', 'hsl'];
    const currentIndex = formats.indexOf(colorFormat);
    const nextIndex = (currentIndex + 1) % formats.length;
    setColorFormat(formats[nextIndex]);
  };

  // رنگ کو کلپ بورڈ پر کاپی کریں
  const copyToClipboard = () => {
    navigator.clipboard.writeText(inputColor).then(() => {
      // نوٹیفکیشن (اپ کے سسٹم میں شامل کریں)
      alert(`Color ${inputColor} copied to clipboard!`);
    });
  };

  // رنگ کی برائٹنیس چیک کریں
  const getColorBrightness = (hexColor) => {
    const rgb = hexToRgb(hexColor);
    // YIQ formula for brightness
    const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
    return brightness > 128 ? 'light' : 'dark';
  };

  const textColor = getColorBrightness(inputColor) === 'light' ? '#1A237E' : '#FFFFFF'; // INDIGO/NAVY

  return (
    <div className={`color-picker ${className} ${disabled ? 'disabled' : ''}`} ref={pickerRef}>
      {/* لیبل */}
      {label && (
        <div className="color-picker-label">
          <span className="label-text">{label}</span>
          <span 
            className="color-format-toggle"
            onClick={toggleColorFormat}
            title={`Switch to ${colorFormat === 'hex' ? 'RGB' : colorFormat === 'rgb' ? 'HSL' : 'HEX'} format`}
          >
            {colorFormat.toUpperCase()}
          </span>
        </div>
      )}

      {/* رنگ پریویو اور ٹوگل بٹن */}
      <div className="color-picker-preview" onClick={() => !disabled && setIsOpen(!isOpen)}>
        <div 
          className="color-display"
          style={{ 
            backgroundColor: inputColor,
            color: textColor
          }}
          ref={colorPreviewRef}
        >
          <span className="color-value">{formatColor()}</span>
        </div>
        
        <button 
          className={`picker-toggle ${isOpen ? 'active' : ''}`}
          type="button"
          disabled={disabled}
        >
          {isOpen ? '▲' : '▼'}
        </button>
      </div>

      {/* کلر پکر پاپ اپ */}
      {isOpen && !disabled && (
        <div className="color-picker-popup">
          {/* HSL سلائیڈرز */}
          <div className="hsl-controls">
            <div className="hsl-slider">
              <label>Hue: {hue}°</label>
              <input
                type="range"
                min="0"
                max="360"
                value={hue}
                onChange={handleHueChange}
                className="hue-slider"
                style={{
                  background: `linear-gradient(to right, 
                    #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)`
                }}
              />
            </div>
            
            <div className="hsl-slider">
              <label>Saturation: {saturation}%</label>
              <input
                type="range"
                min="0"
                max="100"
                value={saturation}
                onChange={handleSaturationChange}
                className="saturation-slider"
                style={{
                  background: `linear-gradient(to right, 
                    hsl(${hue}, 0%, ${lightness}%), 
                    hsl(${hue}, 100%, ${lightness}%))`
                }}
              />
            </div>
            
            <div className="hsl-slider">
              <label>Lightness: {lightness}%</label>
              <input
                type="range"
                min="0"
                max="100"
                value={lightness}
                onChange={handleLightnessChange}
                className="lightness-slider"
                style={{
                  background: `linear-gradient(to right, 
                    hsl(${hue}, ${saturation}%, 0%), 
                    hsl(${hue}, ${saturation}%, 50%), 
                    hsl(${hue}, ${saturation}%, 100%))`
                }}
              />
            </div>

            <div className="hsl-slider">
              <label>Opacity: {alpha}%</label>
              <input
                type="range"
                min="0"
                max="100"
                value={alpha}
                onChange={handleAlphaChange}
                className="alpha-slider"
                style={{
                  background: `linear-gradient(to right, 
                    rgba(${hexToRgb(inputColor).r}, ${hexToRgb(inputColor).g}, ${hexToRgb(inputColor).b}, 0),
                    rgba(${hexToRgb(inputColor).r}, ${hexToRgb(inputColor).g}, ${hexToRgb(inputColor).b}, 1))`,
                  position: 'relative'
                }}
              />
            </div>
          </div>

          {/* رنگ ان پٹ */}
          {showInput && (
            <div className="color-input-section">
              <div className="input-group">
                <input
                  type="text"
                  value={inputColor}
                  onChange={handleInputChange}
                  onKeyPress={handleInputKeyPress}
                  className="color-input"
                  placeholder="#RRGGBB"
                  maxLength="7"
                />
                <div 
                  className="input-preview"
                  style={{ backgroundColor: inputColor }}
                />
              </div>
              
              <div className="input-actions">
                <button
                  type="button"
                  onClick={() => handleColorChange(inputColor)}
                  className="apply-button"
                  disabled={!isValidHex(inputColor)}
                >
                  Apply
                </button>
                
                <button
                  type="button"
                  onClick={copyToClipboard}
                  className="copy-button"
                  title="Copy to clipboard"
                >
                  📋
                </button>
              </div>
            </div>
          )}

          {/* پری ڈیفائنڈ رنگ */}
          {showPresets && (
            <div className="color-presets">
              <div className="presets-section">
                <h4>Primary Colors</h4>
                <div className="preset-grid">
                  {colorPresets.primary.map((presetColor, index) => (
                    <button
                      key={`primary-${index}`}
                      type="button"
                      className="preset-color"
                      style={{ backgroundColor: presetColor }}
                      onClick={() => handleColorChange(presetColor)}
                      title={presetColor}
                    />
                  ))}
                </div>
              </div>
              
              <div className="presets-section">
                <h4>Grayscale</h4>
                <div className="preset-grid">
                  {colorPresets.grayscale.map((presetColor, index) => (
                    <button
                      key={`gray-${index}`}
                      type="button"
                      className="preset-color"
                      style={{ backgroundColor: presetColor }}
                      onClick={() => handleColorChange(presetColor)}
                      title={presetColor}
                    />
                  ))}
                </div>
              </div>
              
              <div className="presets-section">
                <h4>Material Colors</h4>
                <div className="preset-grid">
                  {colorPresets.material.map((presetColor, index) => (
                    <button
                      key={`material-${index}`}
                      type="button"
                      className="preset-color"
                      style={{ backgroundColor: presetColor }}
                      onClick={() => handleColorChange(presetColor)}
                      title={presetColor}
                    />
                  ))}
                </div>
              </div>

              {/* نیا INDIGO رنگوں کا سیٹ */}
              <div className="presets-section">
                <h4>Indigo/Navy Blues</h4>
                <div className="preset-grid">
                  {colorPresets.indigo.map((presetColor, index) => (
                    <button
                      key={`indigo-${index}`}
                      type="button"
                      className="preset-color"
                      style={{ backgroundColor: presetColor }}
                      onClick={() => handleColorChange(presetColor)}
                      title={presetColor}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* اضافی انفارمیشن */}
          <div className="color-info">
            <div className="info-row">
              <span className="info-label">HEX:</span>
              <span className="info-value">{inputColor}</span>
            </div>
            <div className="info-row">
              <span className="info-label">RGB:</span>
              <span className="info-value">
                rgb({hexToRgb(inputColor).r}, {hexToRgb(inputColor).g}, {hexToRgb(inputColor).b})
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">HSL:</span>
              <span className="info-value">
                hsl({hue}, {saturation}%, {lightness}%)
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">Brightness:</span>
              <span className="info-value">{getColorBrightness(inputColor)}</span>
            </div>
          </div>

          {/* کلوز بٹن */}
          <button
            type="button"
            className="close-picker"
            onClick={() => setIsOpen(false)}
          >
            Close Picker
          </button>
        </div>
      )}

      {/* اضافی پریویو (اختیاری) */}
      {showPreview && !isOpen && (
        <div className="additional-previews">
          <div className="preview-row">
            <div 
              className="preview-item"
              style={{ 
                backgroundColor: inputColor,
                color: textColor,
                border: `1px solid ${getColorBrightness(inputColor) === 'light' ? '#1A237E20' : '#ffffff20'}` // INDIGO
              }}
            >
              Aa
            </div>
            <div 
              className="preview-item light"
              style={{ 
                backgroundColor: inputColor,
                opacity: 0.8
              }}
            />
            <div 
              className="preview-item lighter"
              style={{ 
                backgroundColor: inputColor,
                opacity: 0.6
              }}
            />
            <div 
              className="preview-item dark"
              style={{ 
                backgroundColor: inputColor,
                opacity: 0.4
              }}
            />
            <div 
              className="preview-item darker"
              style={{ 
                backgroundColor: inputColor,
                opacity: 0.2
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ColorPicker;