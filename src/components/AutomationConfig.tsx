'use client';

import { useState } from 'react';
import { Eye, EyeOff, Save, AlertTriangle } from 'lucide-react';

interface ConfigProps {
  config: {
    username: string;
    password: string;
    googleSheetUrl: string;
  };
  onConfigChange: (config: any) => void;
}

export default function AutomationConfig({ config, onConfigChange }: ConfigProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [localConfig, setLocalConfig] = useState(config);

  const handleSave = () => {
    onConfigChange(localConfig);
    alert('Configuration saved successfully!');
  };

  const handleInputChange = (field: string, value: string) => {
    setLocalConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="card p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-amber-100 rounded-lg">
          <AlertTriangle className="h-5 w-5 text-amber-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Configuration</h2>
          <p className="text-slate-600">Set up your Providence login credentials</p>
        </div>
      </div>

      <div className="space-y-6">

        {/* Providence Credentials */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Providence Username
            </label>
            <input
              type="text"
              value={localConfig.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              placeholder="Your username"
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Providence Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={localConfig.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="Your password"
                className="w-full px-4 py-3 pr-12 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Google Sheet URL */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Google Sheet URL
          </label>
          <input
            type="url"
            value={localConfig.googleSheetUrl}
            onChange={(e) => handleInputChange('googleSheetUrl', e.target.value)}
            placeholder="https://docs.google.com/spreadsheets/d/your-sheet-id/edit"
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
          <p className="text-xs text-slate-500 mt-1">
            The Google Sheet containing BoltYYZ3 orders to update with locations
          </p>
        </div>

        {/* Security Notice */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex gap-3">
            <AlertTriangle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <strong>Security Note:</strong> Your credentials and sheet URL are stored securely and used only for automation. 
              They are not saved permanently and need to be re-entered each session.
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="btn-primary flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
}