'use client';

import { useState, useEffect } from 'react';
import { Play, Settings, CheckCircle2, AlertCircle, Loader2, Database } from 'lucide-react';
import AutomationConfig from '../components/AutomationConfig';
import StepProgress from '../components/StepProgress';

interface AutomationStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  error?: string;
}

export default function ProvidenceAutomation() {
  const [isRunning, setIsRunning] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [config, setConfig] = useState({
    username: '',
    password: '',
    googleSheetUrl: ''
  });
  const [steps, setSteps] = useState<AutomationStep[]>([]);
  const [currentStepId, setCurrentStepId] = useState('');
  const [error, setError] = useState('');
  const [results, setResults] = useState<any[]>([]);

  const startAutomation = async () => {
    if (!config.username || !config.password || !config.googleSheetUrl) {
      alert('Please configure your credentials and Google Sheet URL first');
      setShowConfig(true);
      return;
    }

    setIsRunning(true);
    setError('');
    setSteps([]);
    setResults([]);

    try {
      const response = await fetch('/api/providence-automation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: config.username,
          password: config.password,
          googleSheetUrl: config.googleSheetUrl
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              setSteps(data.steps || []);
              setCurrentStepId(data.currentStepId || '');
              setIsRunning(data.isRunning ?? true);
              setResults(data.results || []);
              
              if (data.error) {
                setError(data.error);
              }
            } catch (e) {
              console.error('Error parsing SSE data:', e);
            }
          }
        }
      }
    } catch (err) {
      console.error('Automation error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsRunning(false);
    }
  };

  const handleConfigChange = (newConfig: any) => {
    setConfig(newConfig);
    setShowConfig(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl mb-4">
            <Settings className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Providence Order Automation
          </h1>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Automated navigation to Providence portal Manual Items section.
            Logs into Providence, selects YYZ5 facility, and navigates to Manual Items.
          </p>
        </div>

        {/* Configuration */}
        {showConfig && (
          <div className="mb-6">
            <AutomationConfig 
              config={config} 
              onConfigChange={handleConfigChange}
            />
          </div>
        )}

        {/* Control Panel */}
        <div className="card p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Automation Control</h2>
              <p className="text-slate-600">
                {config.username && config.googleSheetUrl ? `Ready to run as ${config.username}` : 'Configure credentials and Google Sheet URL to start'}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowConfig(!showConfig)}
                className="btn-secondary flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                Configure
              </button>
              
              <button
                onClick={startAutomation}
                disabled={isRunning || !config.username || !config.password || !config.googleSheetUrl}
                className="btn-primary flex items-center gap-2"
              >
                {isRunning ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Running...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Start Automation
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="card p-6 mb-6 border-red-200 bg-red-50">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <div>
                <h3 className="font-medium text-red-900">Automation Error</h3>
                <p className="text-red-700 text-sm mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Progress Steps */}
        {steps.length > 0 && (
          <div className="card p-6 mb-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Automation Progress</h2>
            <StepProgress 
              steps={steps} 
              currentStepId={currentStepId} 
              isRunning={isRunning} 
            />
          </div>
        )}

        {/* Results Display */}
        {results.length > 0 && (
          <div className="card p-6 mb-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Search Results</h2>
            <div className="space-y-3">
              {results.map((result, index) => (
                <div key={index} className={`p-4 rounded-lg border ${
                  result.status === 'success' ? 'border-green-200 bg-green-50' :
                  result.status === 'error' ? 'border-red-200 bg-red-50' :
                  'border-yellow-200 bg-yellow-50'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-slate-900">Order: {result.orderNumber}</h3>
                      {result.locations && result.locations.length > 0 ? (
                        <ul className="text-sm text-slate-600 mt-1 list-disc list-inside">
                          {result.locations.map((loc: string, locIndex: number) => (
                            <li key={locIndex}>Location: {loc}</li>
                          ))}
                        </ul>
                      ) : result.message && (
                        <p className="text-sm text-slate-600">{result.message}</p>
                      )}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      result.status === 'success' ? 'bg-green-100 text-green-800' :
                      result.status === 'error' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {result.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-12 text-center text-slate-600 text-sm py-6 border-t border-slate-200">
          <p>
            "Made with Ambitions by Pawandeep" &copy; {new Date().getFullYear()}
          </p>
        </footer>
      </div>
    </div>
  );
}