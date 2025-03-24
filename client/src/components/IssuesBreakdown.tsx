import { ReviewResult } from "@shared/schema";

interface IssuesBreakdownProps {
  issues: ReviewResult['issues'];
}

export default function IssuesBreakdown({ issues }: IssuesBreakdownProps) {
  return (
    <div className="mt-8 bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
      <div className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100 px-5 py-4">
        <h4 className="font-semibold text-base bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">
          Issues Breakdown
        </h4>
      </div>
      
      <div className="p-5">
        <div className="flex items-center space-x-4 mb-5">
          <div className="flex-1 p-4 rounded-lg bg-gradient-to-r from-red-50 to-rose-50 border border-red-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-2 rounded-full bg-red-100">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="ml-3 font-medium text-red-600">Critical Issues</span>
              </div>
              <span className="text-2xl font-bold text-red-600">{issues.critical}</span>
            </div>
          </div>
          
          <div className="flex-1 p-4 rounded-lg bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-2 rounded-full bg-amber-100">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="ml-3 font-medium text-amber-600">Warnings</span>
              </div>
              <span className="text-2xl font-bold text-amber-600">{issues.warnings}</span>
            </div>
          </div>
          
          <div className="flex-1 p-4 rounded-lg bg-gradient-to-r from-blue-50 to-sky-50 border border-blue-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-2 rounded-full bg-blue-100">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="ml-3 font-medium text-blue-600">Info</span>
              </div>
              <span className="text-2xl font-bold text-blue-600">{issues.info}</span>
            </div>
          </div>
        </div>
        
        {issues.types && issues.types.length > 0 && (
          <div className="rounded-lg border border-gray-200 overflow-hidden shadow-sm">
            <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 p-3 text-sm font-medium text-indigo-700 border-b border-indigo-200">
              Issue Types
            </div>
            <ul className="divide-y divide-gray-100">
              {issues.types.map((type, index) => (
                <li key={index} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start">
                    <div className={`p-1.5 rounded-full ${getSeverityBgColor(type.severity)} mr-3 mt-0.5`}>
                      {getSeverityIcon(type.severity)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm font-semibold ${getSeverityTextColor(type.severity)}`}>
                        {type.name}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">{type.description}</p>
                    </div>
                    <div className="ml-3 flex-shrink-0">
                      <span className={`inline-flex items-center rounded-full ${getSeverityBgColor(type.severity)} px-3 py-0.5 text-xs font-medium ${getSeverityTextColor(type.severity)} border ${getSeverityBorderColor(type.severity)}`}>
                        {capitalize(type.severity)}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

function getSeverityIcon(severity: string): JSX.Element {
  switch (severity) {
    case 'high':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-600" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      );
    case 'medium':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-600" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      );
    case 'low':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
      );
    default:
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
      );
  }
}

function getSeverityBgColor(severity: string): string {
  switch (severity) {
    case 'high':
      return 'bg-red-50';
    case 'medium':
      return 'bg-amber-50';
    case 'low':
      return 'bg-blue-50';
    default:
      return 'bg-gray-50';
  }
}

function getSeverityBorderColor(severity: string): string {
  switch (severity) {
    case 'high':
      return 'border-red-200';
    case 'medium':
      return 'border-amber-200';
    case 'low':
      return 'border-blue-200';
    default:
      return 'border-gray-200';
  }
}

function getSeverityTextColor(severity: string): string {
  switch (severity) {
    case 'high':
      return 'text-red-700';
    case 'medium':
      return 'text-amber-700';
    case 'low':
      return 'text-blue-700';
    default:
      return 'text-gray-700';
  }
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
