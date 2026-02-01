import React from 'react';
import PropTypes from 'prop-types';
import './GlowButton.css';

/**
 * GlowButton Component - ایک خوبصورت Glow Effect والا بٹن
 * @param {Object} props - Component properties
 * @param {React.ReactNode} props.children - بٹن کا content
 * @param {Function} props.onClick - Click handler
 * @param {React.Component} props.icon - Icon component
 * @param {string} props.color - بنیادی رنگ
 * @param {string} props.bgColor - پس منظر کا رنگ
 * @param {string} props.textColor - متن کا رنگ
 * @param {string} props.borderColor - بارڈر کا رنگ
 * @param {string} props.className - اضافی CSS کلاسیں
 * @param {'sm' | 'md' | 'lg'} props.size - بٹن کا سائز
 * @param {'default' | 'primary' | 'success' | 'danger' | 'warning' | 'outline'} props.variant - بٹن کی قسم
 * @param {boolean} props.disabled - بٹن غیر فعال ہے یا نہیں
 * @param {string} props.type - بٹن کی قسم (button, submit, reset)
 * @param {Object} props.style - اضافی ان لائن سٹائلز
 * @returns {JSX.Element} GlowButton component
 */
const GlowButton = ({
  children,
  onClick,
  icon: Icon,
  color = '#2563eb',
  bgColor,
  textColor,
  borderColor,
  className = '',
  size = 'md',
  variant = 'default',
  disabled = false,
  type = 'button',
  style = {},
  ...props
}) => {
  /**
   * بٹن کی کلاسیں بنانا
   */
  const getButtonClasses = () => {
    const classes = ['glow-button'];
    
    // Size class
    if (size) classes.push(`glow-btn-${size}`);
    
    // Variant class
    if (variant && variant !== 'default') classes.push(`glow-btn-${variant}`);
    
    // Disabled class
    if (disabled) classes.push('glow-btn-disabled');
    
    // Additional classes
    if (className) classes.push(className);
    
    return classes.join(' ');
  };

  /**
   * ان لائن سٹائلز بنانا
   */
  const getButtonStyles = () => {
    const buttonStyles = {
      '--glow-primary-color': color,
      '--glow-bg-color': bgColor || getComputedBgColor(color),
      '--glow-text-color': textColor || getComputedTextColor(color),
      '--glow-border-color': borderColor || color,
      ...style
    };

    // If specific colors are provided
    if (bgColor) buttonStyles['--glow-bg-color'] = bgColor;
    if (textColor) buttonStyles['--glow-text-color'] = textColor;
    if (borderColor) buttonStyles['--glow-border-color'] = borderColor;

    return buttonStyles;
  };

  /**
   * پس منظر کا رنگ حساب کرنا (اگر دیا نہ گیا ہو)
   */
  const getComputedBgColor = (baseColor) => {
    if (variant === 'outline') return 'transparent';
    return `${baseColor}15`; // 15% opacity
  };

  /**
   * متن کا رنگ حساب کرنا (اگر دیا نہ گیا ہو)
   */
  const getComputedTextColor = (baseColor) => {
    if (variant === 'outline') return baseColor;
    return '#ffffff';
  };

  /**
   * Click handler
   */
  const handleClick = (e) => {
    if (!disabled && onClick) {
      onClick(e);
    }
  };

  return (
    <button
      type={type}
      className={getButtonClasses()}
      onClick={handleClick}
      disabled={disabled}
      style={getButtonStyles()}
      aria-disabled={disabled}
      {...props}
    >
      {/* Icon */}
      {Icon && (
        <span className="glow-button-icon">
          <Icon size={getIconSize(size)} />
        </span>
      )}
      
      {/* Button Text */}
      <span className="glow-button-text">{children}</span>
    </button>
  );
};

/**
 * Icon سائز کا تعین سائز کے مطابق
 */
const getIconSize = (size) => {
  switch (size) {
    case 'sm': return 12;
    case 'lg': return 18;
    case 'md':
    default: return 14;
  }
};

/**
 * PropTypes
 */
GlowButton.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
  icon: PropTypes.elementType,
  color: PropTypes.string,
  bgColor: PropTypes.string,
  textColor: PropTypes.string,
  borderColor: PropTypes.string,
  className: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  variant: PropTypes.oneOf(['default', 'primary', 'success', 'danger', 'warning', 'outline']),
  disabled: PropTypes.bool,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  style: PropTypes.object,
};

export default GlowButton;