import React, { useState, useEffect } from 'react';
import { 
  FiSun, 
  FiMoon, 
  FiCheck, 
  FiMonitor,
  FiDroplet,
  FiImage,
  FiUpload,
  FiX,
  FiArrowLeft,
  FiSave
} from 'react-icons/fi';

const ChromeThemeSettings = () => {
  const [theme, setTheme] = useState('device');
  const [selectedColor, setSelectedColor] = useState('#1a73e8');
  const [customTheme, setCustomTheme] = useState(null);

  const themeOptions = [
    { id: 'light', name: 'Light', icon: <FiSun />, description: 'Light background with dark text' },
    { id: 'dark', name: 'Dark', icon: <FiMoon />, description: 'Dark background with light text' },
    { id: 'device', name: 'Device', icon: <FiMonitor />, description: 'Follows your device theme' }
  ];

  const colorOptions = [
    { name: 'Default Blue', value: '#1a73e8' },
    { name: 'Red', value: '#d93025' },
    { name: 'Yellow', value: '#f29900' },
    { name: 'Green', value: '#0d904f' },
    { name: 'Teal', value: '#007c83' },
    { name: 'Blue', value: '#1a73e8' },
    { name: 'Purple', value: '#9334e6' },
    { name: 'Pink', value: '#e52592' },
    { name: 'Brown', value: '#a1423c' },
    { name: 'Gray', value: '#5f6368' },
    { name: 'Cyan', value: '#03b2cb' },
    { name: 'Orange', value: '#fa903e' }
  ];

  const sampleWallpapers = [
    { id: 1, name: 'Geometric Shapes', color: '#4285f4', thumbnail: 'https://via.placeholder.com/150x85/4285f4/ffffff?text=+', category: 'Solid Colors' },
    { id: 2, name: 'Sunset Gradient', color: '#ea4335', thumbnail: 'https://via.placeholder.com/150x85/ea4335/ffffff?text=+', category: 'Solid Colors' },
    { id: 3, name: 'Nature Green', color: '#34a853', thumbnail: 'https://via.placeholder.com/150x85/34a853/ffffff?text=+', category: 'Solid Colors' },
    { id: 4, name: 'Galaxy', thumbnail: 'https://via.placeholder.com/150x85/6b46c1/ffffff?text=✨', category: 'Landscapes' },
    { id: 5, name: 'Beach', thumbnail: 'https://via.placeholder.com/150x85/00a5ff/ffffff?text=🌊', category: 'Landscapes' },
    { id: 6, name: 'Mountains', thumbnail: 'https://via.placeholder.com/150x85/059669/ffffff?text=⛰️', category: 'Landscapes' },
    { id: 7, name: 'Abstract Art', thumbnail: 'https://via.placeholder.com/150x85/7c3aed/ffffff?text=🎨', category: 'Art' },
    { id: 8, name: 'Minimal', thumbnail: 'https://via.placeholder.com/150x85/9ca3af/ffffff?text=◼', category: 'Art' }
  ];

  useEffect(() => {
    const savedTheme = localStorage.getItem('chrome-theme') || 'device';
    const savedColor = localStorage.getItem('chrome-color') || '#1a73e8';
    const savedCustomTheme = localStorage.getItem('chrome-custom-theme');
    
    setTheme(savedTheme);
    setSelectedColor(savedColor);
    if (savedCustomTheme) {
      setCustomTheme(JSON.parse(savedCustomTheme));
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--primary-chrome-color', selectedColor);
    
    if (theme === 'dark') {
      document.body.classList.add('dark-theme');
      root.style.setProperty('--chrome-bg', '#202124');
      root.style.setProperty('--chrome-text', '#e8eaed');
    } else if (theme === 'light') {
      document.body.classList.remove('dark-theme');
      root.style.setProperty('--chrome-bg', '#ffffff');
      root.style.setProperty('--chrome-text', '#202124');
    } else if (theme === 'device') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        document.body.classList.add('dark-theme');
        root.style.setProperty('--chrome-bg', '#202124');
        root.style.setProperty('--chrome-text', '#e8eaed');
      } else {
        document.body.classList.remove('dark-theme');
        root.style.setProperty('--chrome-bg', '#ffffff');
        root.style.setProperty('--chrome-text', '#202124');
      }
    }
    
    localStorage.setItem('chrome-theme', theme);
    localStorage.setItem('chrome-color', selectedColor);
  }, [theme, selectedColor]);

  const handleThemeSelect = (themeId) => {
    setTheme(themeId);
  };

  const handleColorSelect = (color) => {
    setSelectedColor(color);
    setCustomTheme(null);
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newTheme = {
          type: 'custom',
          name: 'Uploaded Image',
          thumbnail: reader.result,
          isCustom: true
        };
        setCustomTheme(newTheme);
        setSelectedColor('#1a73e8');
        localStorage.setItem('chrome-custom-theme', JSON.stringify(newTheme));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveCustomTheme = () => {
    setCustomTheme(null);
    localStorage.removeItem('chrome-custom-theme');
  };

  const handleWallpaperSelect = (wallpaper) => {
    const newTheme = {
      type: 'wallpaper',
      name: wallpaper.name,
      thumbnail: wallpaper.thumbnail,
      color: wallpaper.color,
      isCustom: false
    };
    setCustomTheme(newTheme);
    setSelectedColor(wallpaper.color || '#1a73e8');
    localStorage.setItem('chrome-custom-theme', JSON.stringify(newTheme));
  };

  const handleResetToDefault = () => {
    setTheme('device');
    setSelectedColor('#1a73e8');
    setCustomTheme(null);
    localStorage.setItem('chrome-theme', 'device');
    localStorage.setItem('chrome-color', '#1a73e8');
    localStorage.removeItem('chrome-custom-theme');
    alert('Theme reset to default settings!');
  };

  const handleSaveChanges = () => {
    alert('Chrome theme settings saved successfully!');
    window.location.href = '/settings/theme';
  };

  const handleGoBack = () => {
    window.location.href = '/settings/theme';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <button
            onClick={handleGoBack}
            className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-4 transition-colors"
          >
            <FiArrowLeft />
            Back to Theme Settings
          </button>
          
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Chrome Browser Theme Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Customize your Chrome browser appearance. These settings apply to your Chrome browser theme.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <FiSun className="text-gray-600 dark:text-gray-300" />
                Appearance
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {themeOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleThemeSelect(option.id)}
                    className={`relative p-4 rounded-lg border-2 transition-all ${
                      theme === option.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-3">
                      <div className={`p-3 rounded-full ${
                        theme === option.id 
                          ? 'bg-blue-100 dark:bg-blue-800' 
                          : 'bg-gray-100 dark:bg-gray-700'
                      }`}>
                        <span className="text-xl text-gray-700 dark:text-gray-300">
                          {option.icon}
                        </span>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-gray-900 dark:text-white">{option.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {option.description}
                        </div>
                      </div>
                    </div>
                    {theme === option.id && (
                      <div className="absolute top-3 right-3">
                        <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                          <FiCheck className="text-white text-sm" />
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <FiDroplet className="text-gray-600 dark:text-gray-300" />
                  Color Picker
                </h3>
                
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Theme color</span>
                    {customTheme && (
                      <button
                        onClick={handleRemoveCustomTheme}
                        className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1"
                      >
                        <FiX /> Remove custom theme
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-12 gap-2 mb-6">
                    {colorOptions.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => handleColorSelect(color.value)}
                        className={`relative p-4 rounded-lg border-2 transition-transform ${
                          selectedColor === color.value && !customTheme
                            ? 'border-blue-500 scale-105 shadow-md'
                            : 'border-gray-200 dark:border-gray-700'
                        }`}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      >
                        {selectedColor === color.value && !customTheme && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <FiCheck className="text-white" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <FiImage className="text-gray-600 dark:text-gray-300" />
                    Custom Theme
                  </h4>
                  
                  {customTheme ? (
                    <div className="relative">
                      <div className="border-2 border-blue-500 rounded-lg overflow-hidden max-w-xs">
                        <img 
                          src={customTheme.thumbnail} 
                          alt={customTheme.name}
                          className="w-full h-32 object-cover"
                        />
                        <div className="p-3 bg-white dark:bg-gray-800">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {customTheme.name}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Custom theme applied
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                      <FiUpload className="text-3xl text-gray-400 dark:text-gray-500 mx-auto mb-3" />
                      <p className="text-gray-600 dark:text-gray-400 mb-3">
                        Upload your own background image
                      </p>
                      <label className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer transition-colors">
                        <FiUpload className="mr-2" />
                        Upload Image
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        PNG, JPG up to 5MB
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">
                    Sample Wallpapers
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {sampleWallpapers.map((wallpaper) => (
                      <button
                        key={wallpaper.id}
                        onClick={() => handleWallpaperSelect(wallpaper)}
                        className={`group relative overflow-hidden rounded-lg border-2 transition-all ${
                          customTheme?.thumbnail === wallpaper.thumbnail
                            ? 'border-blue-500 ring-2 ring-blue-300'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        <div className="aspect-video overflow-hidden">
                          <div 
                            className="w-full h-full flex items-center justify-center text-white font-bold text-lg"
                            style={{ backgroundColor: wallpaper.color || '#6b46c1' }}
                          >
                            {!wallpaper.color && wallpaper.name.charAt(0)}
                          </div>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/70 to-transparent p-2">
                          <div className="text-xs text-white font-medium truncate">
                            {wallpaper.name}
                          </div>
                          <div className="text-xs text-white/70 truncate">
                            {wallpaper.category}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Live Preview
              </h2>
              
              <div className="space-y-4">
                <div 
                  className="rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600 shadow-lg"
                  style={customTheme?.thumbnail ? {
                    backgroundImage: `url(${customTheme.thumbnail})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  } : {}}
                >
                  <div 
                    className="h-10 flex items-center px-4"
                    style={{ backgroundColor: selectedColor }}
                  >
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <div className="flex-1 mx-4">
                      <div className="h-6 bg-white/20 rounded text-center">
                        <span className="text-white text-sm font-medium">dashboard.example.com</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className={`p-6 ${customTheme?.thumbnail ? 'bg-white/90 dark:bg-gray-900/90' : 'bg-white dark:bg-gray-900'}`}>
                    <div className="flex items-center gap-3 mb-4">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                        style={{ backgroundColor: selectedColor }}
                      >
                        U
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">Welcome back, User!</div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">Here's your dashboard</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-800">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">Overview</div>
                        <div className="text-xs text-gray-600 dark:text-gray-300">Monthly stats</div>
                      </div>
                      <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-800">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">Analytics</div>
                        <div className="text-xs text-gray-600 dark:text-gray-300">View reports</div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700 dark:text-gray-300">Performance</span>
                        <span className="text-sm font-medium" style={{ color: selectedColor }}>75%</span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full"
                          style={{ backgroundColor: selectedColor, width: '75%' }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">Current Theme Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Mode:</span>
                      <span className="font-medium text-gray-900 dark:text-white capitalize">{theme}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Color:</span>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded border"
                          style={{ backgroundColor: selectedColor }}
                        ></div>
                        <span className="font-medium text-gray-900 dark:text-white">{selectedColor}</span>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Background:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {customTheme ? 'Custom Image' : 'Solid Color'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="space-y-4">
                <button
                  onClick={handleSaveChanges}
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <FiSave />
                  Save Changes
                </button>
                
                <button
                  onClick={handleResetToDefault}
                  className="w-full py-3 px-4 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors"
                >
                  Reset to Default
                </button>
                
                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Changes are saved automatically. Refresh the page to see them everywhere.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChromeThemeSettings;