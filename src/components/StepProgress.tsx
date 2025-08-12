'use client';

import { CheckCircle2, Clock, Loader2, AlertCircle, ArrowRight } from 'lucide-react';

interface AutomationStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  error?: string;
}

interface StepProgressProps {
  steps: AutomationStep[];
  currentStepId: string;
  isRunning: boolean;
}

export default function StepProgress({ steps, currentStepId, isRunning }: StepProgressProps) {
  const getStepIcon = (step: AutomationStep) => {
    switch (step.status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'running':
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-slate-400" />;
    }
  };

  const getStepStatus = (step: AutomationStep) => {
    switch (step.status) {
      case 'completed':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'running':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'error':
        return 'text-red-700 bg-red-50 border-red-200';
      default:
        return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  const getConnectorStatus = (index: number) => {
    const currentStep = steps[index];
    const nextStep = steps[index + 1];
    
    if (currentStep.status === 'completed') {
      return 'bg-green-500';
    } else if (currentStep.status === 'running' || currentStep.status === 'error') {
      return 'bg-blue-500';
    }
    return 'bg-slate-300';
  };

  return (
    <div className="space-y-4">
      {steps.map((step, index) => (
        <div key={step.id} className="relative">
          {/* Step Content */}
          <div className={`p-4 rounded-lg border transition-all duration-300 ${getStepStatus(step)}`}>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                {getStepIcon(step)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium text-slate-900">{step.title}</h3>
                  {step.status === 'running' && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Active
                    </span>
                  )}
                  {step.status === 'completed' && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Done
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-600">{step.description}</p>
                {step.error && (
                  <div className="mt-2 p-2 bg-red-100 border border-red-200 rounded text-sm text-red-700">
                    <strong>Error:</strong> {step.error}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Connector Line */}
          {index < steps.length - 1 && (
            <div className="flex justify-center py-2">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-0.5 transition-colors duration-300 ${getConnectorStatus(index)}`}></div>
                <ArrowRight className={`h-4 w-4 transition-colors duration-300 ${
                  step.status === 'completed' ? 'text-green-500' : 
                  step.status === 'running' || step.status === 'error' ? 'text-blue-500' : 
                  'text-slate-400'
                }`} />
                <div className={`w-8 h-0.5 transition-colors duration-300 ${getConnectorStatus(index)}`}></div>
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Summary */}
      <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600">Progress:</span>
          <span className="font-medium text-slate-900">
            {steps.filter(s => s.status === 'completed').length} / {steps.length} steps completed
          </span>
        </div>
        <div className="mt-2 w-full bg-slate-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500"
            style={{ 
              width: `${(steps.filter(s => s.status === 'completed').length / steps.length) * 100}%` 
            }}
          ></div>
        </div>
      </div>
    </div>
  );
}