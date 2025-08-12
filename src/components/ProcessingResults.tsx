'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, Download, Search, Filter } from 'lucide-react';

interface ProcessingResult {
  orderNumber: string;
  status: 'success' | 'error' | 'processing' | 'pending';
  message?: string;
  data?: {
    code?: string;
    order?: string;
    organization?: string;
    customer?: string;
  };
}

interface ProcessingResultsProps {
  results: ProcessingResult[];
}

export default function ProcessingResults({ results }: ProcessingResultsProps) {
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<'all' | 'success' | 'error'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const toggleOrder = (orderNumber: string) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderNumber)) {
      newExpanded.delete(orderNumber);
    } else {
      newExpanded.add(orderNumber);
    }
    setExpandedOrders(newExpanded);
  };

  const filteredResults = results.filter(result => {
    const matchesFilter = filter === 'all' || result.status === filter;
    const matchesSearch = result.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         result.data?.customer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         result.data?.organization?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const downloadResults = () => {
    const csvContent = [
      ['Order Number', 'Status', 'Code', 'Organization', 'Customer', 'Message'].join(','),
      ...filteredResults.map(result => [
        result.orderNumber,
        result.status,
        result.data?.code || '',
        result.data?.organization || '',
        result.data?.customer || '',
        result.message || ''
      ].map(field => `"${field}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `providence-orders-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <span className="status-badge status-success">Success</span>;
      case 'error':
        return <span className="status-badge status-error">Error</span>;
      case 'processing':
        return <span className="status-badge status-processing">Processing</span>;
      case 'pending':
        return <span className="status-badge status-pending">Pending</span>;
      default:
        return <span className="status-badge status-pending">Unknown</span>;
    }
  };

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Processing Results</h2>
          <p className="text-slate-600">
            {filteredResults.length} of {results.length} orders shown
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={downloadResults}
            className="btn-secondary flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search orders, customers, or organizations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'all' | 'success' | 'error')}
            className="pl-10 pr-8 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
          >
            <option value="all">All Results</option>
            <option value="success">Success Only</option>
            <option value="error">Errors Only</option>
          </select>
        </div>
      </div>

      {/* Results List */}
      <div className="space-y-3">
        {filteredResults.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            {results.length === 0 ? 'No results yet' : 'No results match your filters'}
          </div>
        ) : (
          filteredResults.map((result, index) => (
            <div key={`${result.orderNumber}-${index}`} className="border border-slate-200 rounded-lg">
              <div 
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={() => toggleOrder(result.orderNumber)}
              >
                <div className="flex items-center gap-3">
                  {expandedOrders.has(result.orderNumber) ? 
                    <ChevronDown className="h-4 w-4 text-slate-400" /> :
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  }
                  <div>
                    <div className="font-medium text-slate-900">
                      Order #{result.orderNumber}
                    </div>
                    {result.data?.customer && (
                      <div className="text-sm text-slate-500">
                        {result.data.customer}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {result.data?.organization && (
                    <span className="text-sm text-slate-600 bg-slate-100 px-2 py-1 rounded">
                      {result.data.organization}
                    </span>
                  )}
                  {getStatusBadge(result.status)}
                </div>
              </div>
              
              {expandedOrders.has(result.orderNumber) && (
                <div className="border-t border-slate-200 p-4 bg-slate-50">
                  <div className="grid md:grid-cols-2 gap-4">
                    {result.data && (
                      <div>
                        <h4 className="font-medium text-slate-900 mb-3">Order Details</h4>
                        <dl className="space-y-2 text-sm">
                          {result.data.code && (
                            <div className="flex justify-between">
                              <dt className="text-slate-600">Code:</dt>
                              <dd className="font-medium text-slate-900">{result.data.code}</dd>
                            </div>
                          )}
                          {result.data.order && (
                            <div className="flex justify-between">
                              <dt className="text-slate-600">Order:</dt>
                              <dd className="font-medium text-slate-900">{result.data.order}</dd>
                            </div>
                          )}
                          {result.data.organization && (
                            <div className="flex justify-between">
                              <dt className="text-slate-600">Organization:</dt>
                              <dd className="font-medium text-slate-900">{result.data.organization}</dd>
                            </div>
                          )}
                          {result.data.customer && (
                            <div className="flex justify-between">
                              <dt className="text-slate-600">Customer:</dt>
                              <dd className="font-medium text-slate-900">{result.data.customer}</dd>
                            </div>
                          )}
                        </dl>
                      </div>
                    )}
                    
                    {result.message && (
                      <div>
                        <h4 className="font-medium text-slate-900 mb-3">
                          {result.status === 'error' ? 'Error Details' : 'Status Message'}
                        </h4>
                        <div className={`p-3 rounded-lg text-sm ${
                          result.status === 'error' 
                            ? 'bg-red-50 text-red-700 border border-red-200' 
                            : 'bg-green-50 text-green-700 border border-green-200'
                        }`}>
                          {result.message}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}