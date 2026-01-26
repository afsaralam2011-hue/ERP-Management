import React, { useState } from 'react';

const ThemeSettingsBenchmarks = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const benchmarks = [
    {
      category: 'Rendering Performance',
      metrics: [
        {
          name: 'Initial Page Load',
          target: '< 1.5s',
          good: '< 1s',
          acceptable: '1-2s',
          poor: '> 2s',
          description: 'Time from navigation to interactive UI',
          priority: 'Critical'
        },
        {
          name: 'Theme Switch Time',
          target: '< 200ms',
          good: '< 150ms',
          acceptable: '150-300ms',
          poor: '> 300ms',
          description: 'Time to apply new theme across all components',
          priority: 'High'
        },
        {
          name: 'Modal Open/Close',
          target: '< 100ms',
          good: '< 80ms',
          acceptable: '80-150ms',
          poor: '> 150ms',
          description: 'Animation smoothness for custom theme modal',
          priority: 'Medium'
        },
        {
          name: 'Color Picker Response',
          target: '< 50ms',
          good: '< 30ms',
          acceptable: '30-100ms',
          poor: '> 100ms',
          description: 'Delay between color selection and UI update',
          priority: 'High'
        }
      ]
    },
    {
      category: 'Component Performance',
      metrics: [
        {
          name: 'Theme Grid Render (10 items)',
          target: '< 100ms',
          good: '< 80ms',
          acceptable: '80-150ms',
          poor: '> 150ms',
          description: 'Time to render predefined theme grid',
          priority: 'Medium'
        },
        {
          name: 'Custom Theme Creation',
          target: '< 300ms',
          good: '< 200ms',
          acceptable: '200-500ms',
          poor: '> 500ms',
          description: 'End-to-end time to create and apply custom theme',
          priority: 'Medium'
        },
        {
          name: 'Theme Export',
          target: '< 500ms',
          good: '< 300ms',
          acceptable: '300-800ms',
          poor: '> 800ms',
          description: 'Time to generate and download theme JSON',
          priority: 'Low'
        }
      ]
    },
    {
      category: 'Memory & Resources',
      metrics: [
        {
          name: 'Memory Usage (Idle)',
          target: '< 15MB',
          good: '< 10MB',
          acceptable: '10-20MB',
          poor: '> 20MB',
          description: 'Component memory footprint when idle',
          priority: 'Medium'
        },
        {
          name: 'Memory Usage (Active)',
          target: '< 30MB',
          good: '< 25MB',
          acceptable: '25-40MB',
          poor: '> 40MB',
          description: 'Memory during theme switching/creation',
          priority: 'Medium'
        },
        {
          name: 'CSS Variables Applied',
          target: '< 10ms',
          good: '< 5ms',
          acceptable: '5-20ms',
          poor: '> 20ms',
          description: 'Time to update CSS custom properties',
          priority: 'High'
        }
      ]
    },
    {
      category: 'User Interaction',
      metrics: [
        {
          name: 'Click Response Time',
          target: '< 100ms',
          good: '< 50ms',
          acceptable: '50-150ms',
          poor: '> 150ms',
          description: 'Delay from click to visual feedback',
          priority: 'Critical'
        },
        {
          name: 'Hover Effect Latency',
          target: '< 50ms',
          good: '< 30ms',
          acceptable: '30-80ms',
          poor: '> 80ms',
          description: 'Time for hover states to appear',
          priority: 'Medium'
        },
        {
          name: 'Input Field Response',
          target: '< 16ms',
          good: '< 10ms',
          acceptable: '10-30ms',
          poor: '> 30ms',
          description: 'Typing latency in theme name input',
          priority: 'High'
        }
      ]
    },
    {
      category: 'Accessibility',
      metrics: [
        {
          name: 'Keyboard Navigation',
          target: '100%',
          good: '100%',
          acceptable: '90-99%',
          poor: '< 90%',
          description: 'All interactive elements accessible via keyboard',
          priority: 'Critical'
        },
        {
          name: 'Focus Indicator Visibility',
          target: '3:1 contrast',
          good: '4.5:1+',
          acceptable: '3:1-4.5:1',
          poor: '< 3:1',
          description: 'Focus outline contrast ratio',
          priority: 'Critical'
        },
        {
          name: 'Color Contrast (Text)',
          target: '4.5:1',
          good: '7:1+',
          acceptable: '4.5:1-7:1',
          poor: '< 4.5:1',
          description: 'Text readability across themes',
          priority: 'Critical'
        }
      ]
    },
    {
      category: 'Mobile Performance',
      metrics: [
        {
          name: 'Touch Response Time',
          target: '< 100ms',
          good: '< 70ms',
          acceptable: '70-150ms',
          poor: '> 150ms',
          description: 'Delay from touch to action',
          priority: 'High'
        },
        {
          name: 'Scroll Performance (FPS)',
          target: '60 FPS',
          good: '60 FPS',
          acceptable: '45-60 FPS',
          poor: '< 45 FPS',
          description: 'Smoothness when scrolling theme grid',
          priority: 'High'
        },
        {
          name: 'Modal Rendering (Mobile)',
          target: '< 150ms',
          good: '< 100ms',
          acceptable: '100-200ms',
          poor: '> 200ms',
          description: 'Modal appearance on smaller screens',
          priority: 'Medium'
        }
      ]
    }
  ];

  const categories = ['all', ...new Set(benchmarks.map(b => b.category))];
  
  const filteredBenchmarks = selectedCategory === 'all' 
    ? benchmarks 
    : benchmarks.filter(b => b.category === selectedCategory);

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'Critical': return 'text-red-600 bg-red-50';
      case 'High': return 'text-orange-600 bg-orange-50';
      case 'Medium': return 'text-blue-600 bg-blue-50';
      case 'Low': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl">⚡</span>
            <h1 className="text-4xl font-bold text-gray-900">
              Theme Settings Performance Benchmarks
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Comprehensive performance targets for optimal user experience
          </p>
          
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">✓</span>
                <span className="font-semibold text-green-900">Good Range</span>
              </div>
              <p className="text-sm text-green-700">Optimal performance targets</p>
            </div>
            <div className="bg-gradient-to-br from-yellow-50 to-amber-50 p-4 rounded-xl border border-yellow-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">⚠</span>
                <span className="font-semibold text-yellow-900">Acceptable</span>
              </div>
              <p className="text-sm text-yellow-700">Needs monitoring</p>
            </div>
            <div className="bg-gradient-to-br from-red-50 to-rose-50 p-4 rounded-xl border border-red-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">✕</span>
                <span className="font-semibold text-red-900">Poor</span>
              </div>
              <p className="text-sm text-red-700">Requires optimization</p>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat === 'all' ? 'All Categories' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Benchmark Sections */}
        {filteredBenchmarks.map((section, idx) => (
          <div key={idx} className="bg-white rounded-2xl shadow-lg p-8 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl">📊</span>
              <h2 className="text-2xl font-bold text-gray-900">{section.category}</h2>
            </div>

            <div className="space-y-4">
              {section.metrics.map((metric, metricIdx) => (
                <div 
                  key={metricIdx}
                  className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xl">⏱️</span>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {metric.name}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(metric.priority)}`}>
                          {metric.priority}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm">{metric.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-indigo-600">{metric.target}</div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide">Target</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-green-600">✓</span>
                        <span className="text-xs font-semibold text-green-900 uppercase">Good</span>
                      </div>
                      <div className="text-lg font-bold text-green-700">{metric.good}</div>
                    </div>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-yellow-600">⚠</span>
                        <span className="text-xs font-semibold text-yellow-900 uppercase">Acceptable</span>
                      </div>
                      <div className="text-lg font-bold text-yellow-700">{metric.acceptable}</div>
                    </div>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-red-600">✕</span>
                        <span className="text-xs font-semibold text-red-900 uppercase">Poor</span>
                      </div>
                      <div className="text-lg font-bold text-red-700">{metric.poor}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Implementation Notes */}
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 rounded-2xl p-8">
          <h3 className="text-xl font-bold text-indigo-900 mb-4">📊 Measurement Guidelines</h3>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-indigo-600 font-bold">•</span>
              <span>Use Chrome DevTools Performance tab for render timing measurements</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-600 font-bold">•</span>
              <span>Test on representative devices: Desktop (high-end), Laptop (mid-range), Mobile (low-end)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-600 font-bold">•</span>
              <span>Measure under typical load conditions (10-20 custom themes, normal network)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-600 font-bold">•</span>
              <span>Run each test 5+ times and report median values to reduce variance</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-600 font-bold">•</span>
              <span>Use React DevTools Profiler for component-specific performance data</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-600 font-bold">•</span>
              <span>Validate accessibility with automated tools (axe, Lighthouse) + manual keyboard testing</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ThemeSettingsBenchmarks;