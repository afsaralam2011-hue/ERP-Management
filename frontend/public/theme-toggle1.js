// theme-toggle.js

// Theme management system
class ThemeManager {
  constructor() {
    this.themeKey = 'pwi_theme';
    this.defaultTheme = 'light';
    this.supportedThemes = ['light', 'dark'];
    
    this.initialize();
  }
  
  // Initialize theme system
  initialize() {
    console.log('Initializing theme system...');
    
    // Check if theme is saved
    const savedTheme = this.getSavedTheme();
    
    // Apply theme
    this.applyTheme(savedTheme || this.defaultTheme);
    
    // Add theme toggle button to DOM if not exists
    this.injectThemeToggleButton();
    
    // Listen for system theme changes
    this.listenForSystemThemeChanges();
  }
  
  // Get saved theme from localStorage
  getSavedTheme() {
    try {
      return localStorage.getItem(this.themeKey);
    } catch (error) {
      console.error('Error reading theme from localStorage:', error);
      return null;
    }
  }
  
  // Save theme to localStorage
  saveTheme(theme) {
    if (!this.supportedThemes.includes(theme)) {
      console.error('Unsupported theme:', theme);
      return false;
    }
    
    try {
      localStorage.setItem(this.themeKey, theme);
      console.log('Theme saved:', theme);
      return true;
    } catch (error) {
      console.error('Error saving theme to localStorage:', error);
      return false;
    }
  }
  
  // Apply theme to document
  applyTheme(theme) {
    if (!this.supportedThemes.includes(theme)) {
      theme = this.defaultTheme;
    }
    
    // Set data-theme attribute on documentElement
    document.documentElement.setAttribute('data-theme', theme);
    
    // Update theme color meta tag
    this.updateThemeColorMeta(theme);
    
    // Dispatch theme change event
    this.dispatchThemeChangeEvent(theme);
    
    // Update toggle button icon
    this.updateToggleButtonIcon(theme);
  }
  
  // Update theme color meta tag for mobile browsers
  updateThemeColorMeta(theme) {
    let themeColor = '#005461'; // Default primary color
    
    if (theme === 'dark') {
      themeColor = '#0f172a'; // Dark theme background
    }
    
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', themeColor);
    }
  }
  
  // Toggle between themes
  toggleTheme() {
    const currentTheme = this.getCurrentTheme();
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    this.applyTheme(newTheme);
    this.saveTheme(newTheme);
    
    // Show theme change notification
    this.showThemeChangeNotification(newTheme);
    
    return newTheme;
  }
  
  // Get current theme
  getCurrentTheme() {
    return document.documentElement.getAttribute('data-theme') || this.defaultTheme;
  }
  
  // Check system preference
  getSystemPreference() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }
  
  // Listen for system theme changes
  listenForSystemThemeChanges() {
    if (!window.matchMedia) return;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e) => {
      const systemTheme = e.matches ? 'dark' : 'light';
      const savedTheme = this.getSavedTheme();
      
      // Only auto-switch if user hasn't set a preference
      if (!savedTheme) {
        this.applyTheme(systemTheme);
      }
    };
    
    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } 
    // Old browsers
    else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleChange);
    }
  }
  
  // Inject theme toggle button into DOM
  injectThemeToggleButton() {
    // Check if button already exists
    if (document.getElementById('theme-toggle-button')) {
      return;
    }
    
    // Create toggle button
    const toggleButton = document.createElement('button');
    toggleButton.id = 'theme-toggle-button';
    toggleButton.className = 'theme-toggle-button';
    toggleButton.title = 'Toggle theme';
    toggleButton.setAttribute('aria-label', 'Toggle theme');
    
    // Set initial icon
    const currentTheme = this.getCurrentTheme();
    this.updateToggleButtonIcon(currentTheme, toggleButton);
    
    // Add click event
    toggleButton.addEventListener('click', () => {
      this.toggleTheme();
    });
    
    // Add to DOM (you might want to customize where to add it)
    const header = document.querySelector('.header-right-section');
    if (header) {
      header.appendChild(toggleButton);
    } else {
      // Add to body if no header found
      document.body.appendChild(toggleButton);
      
      // Style for floating button
      toggleButton.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 1000;
        background: var(--btn-primary-bg);
        color: var(--btn-primary-text);
        border: none;
        border-radius: 50%;
        width: 56px;
        height: 56px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        box-shadow: 0 4px 12px var(--shadow-color);
        transition: all 0.3s ease;
      `;
      
      toggleButton.addEventListener('mouseenter', () => {
        toggleButton.style.transform = 'scale(1.1)';
        toggleButton.style.boxShadow = '0 6px 20px var(--shadow-color)';
      });
      
      toggleButton.addEventListener('mouseleave', () => {
        toggleButton.style.transform = 'scale(1)';
        toggleButton.style.boxShadow = '0 4px 12px var(--shadow-color)';
      });
    }
  }
  
  // Update toggle button icon
  updateToggleButtonIcon(theme, buttonElement = null) {
    const button = buttonElement || document.getElementById('theme-toggle-button');
    if (!button) return;
    
    // Clear existing content
    button.innerHTML = '';
    
    // Create SVG icon based on theme
    const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    icon.setAttribute('width', '24');
    icon.setAttribute('height', '24');
    icon.setAttribute('viewBox', '0 0 24 24');
    icon.setAttribute('fill', 'none');
    icon.setAttribute('stroke', 'currentColor');
    icon.setAttribute('stroke-width', '2');
    icon.setAttribute('stroke-linecap', 'round');
    icon.setAttribute('stroke-linejoin', 'round');
    
    if (theme === 'dark') {
      // Sun icon for dark theme (click to switch to light)
      icon.innerHTML = `
        <circle cx="12" cy="12" r="5"></circle>
        <line x1="12" y1="1" x2="12" y2="3"></line>
        <line x1="12" y1="21" x2="12" y2="23"></line>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
        <line x1="1" y1="12" x2="3" y2="12"></line>
        <line x1="21" y1="12" x2="23" y2="12"></line>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
      `;
      button.title = 'Switch to light mode';
    } else {
      // Moon icon for light theme (click to switch to dark)
      icon.innerHTML = `
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
      `;
      button.title = 'Switch to dark mode';
    }
    
    button.appendChild(icon);
  }
  
  // Show theme change notification
  showThemeChangeNotification(theme) {
    // Remove existing notification if any
    const existingNotification = document.getElementById('theme-change-notification');
    if (existingNotification) {
      existingNotification.remove();
    }
    
    // Create notification
    const notification = document.createElement('div');
    notification.id = 'theme-change-notification';
    notification.className = 'theme-change-notification';
    notification.innerHTML = `
      <span>Switched to ${theme === 'dark' ? 'Dark' : 'Light'} theme</span>
    `;
    
    // Style notification
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: var(--bg-secondary);
      color: var(--text-primary);
      padding: 12px 20px;
      border-radius: 12px;
      box-shadow: 0 4px 20px var(--shadow-color);
      z-index: 9999;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 10px;
      border: 1px solid var(--border-color);
      animation: slideIn 0.3s ease, fadeOut 0.3s ease 2s forwards;
    `;
    
    // Add icon
    const icon = document.createElement('span');
    icon.innerHTML = theme === 'dark' ? '🌙' : '☀️';
    notification.insertBefore(icon, notification.firstChild);
    
    document.body.appendChild(notification);
    
    // Remove after animation
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 2300);
  }
  
  // Dispatch theme change event
  dispatchThemeChangeEvent(theme) {
    const event = new CustomEvent('theme-change', {
      detail: {
        theme: theme,
        timestamp: new Date().toISOString()
      }
    });
    window.dispatchEvent(event);
  }
  
  // Export theme state for React/other frameworks
  getThemeState() {
    return {
      currentTheme: this.getCurrentTheme(),
      savedTheme: this.getSavedTheme(),
      systemPreference: this.getSystemPreference(),
      supportedThemes: this.supportedThemes
    };
  }
}

// Initialize theme manager
window.themeManager = new ThemeManager();

// Make toggleTheme function globally available
window.toggleTheme = function() {
  return window.themeManager.toggleTheme();
};

// Get current theme globally
window.getCurrentTheme = function() {
  return window.themeManager.getCurrentTheme();
};

// Apply specific theme globally
window.setTheme = function(theme) {
  window.themeManager.applyTheme(theme);
  window.themeManager.saveTheme(theme);
  return theme;
};

// Listen for theme changes
window.addEventListener('theme-change', (event) => {
  console.log('Theme changed to:', event.detail.theme);
  
  // Update React app if exists
  if (window.updateReactTheme) {
    window.updateReactTheme(event.detail.theme);
  }
});

// Add CSS for theme toggle button
const style = document.createElement('style');
style.textContent = `
  .theme-toggle-button {
    background: var(--btn-primary-bg);
    color: var(--btn-primary-text);
    border: none;
    border-radius: 12px;
    padding: 10px;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
  }
  
  .theme-toggle-button:hover {
    background: var(--btn-primary-hover);
    transform: translateY(-2px);
  }
  
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateX(100%);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  @keyframes fadeOut {
    from {
      opacity: 1;
    }
    to {
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

console.log('Theme toggle system loaded');