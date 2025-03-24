import { ReviewResult } from "@shared/schema";

interface IssuesBreakdownProps {
  issues: ReviewResult['issues'];
}

export default function IssuesBreakdown({ issues }: IssuesBreakdownProps) {
  return (
    <div className="mt-6">
      <h4 className="font-medium text-base mb-3">Issues Breakdown</h4>
      <div className="flex flex-col space-y-3">
        <div className="flex items-center space-x-2 flex-wrap gap-2">
          <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded">
            Critical: {issues.critical}
          </span>
          <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded">
            Warnings: {issues.warnings}
          </span>
          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
            Info: {issues.info}
          </span>
        </div>
        {issues.types && issues.types.length > 0 && (
          <div className="rounded-md border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 p-2 text-xs font-medium text-gray-700">Issue Types</div>
            <ul className="divide-y divide-gray-200">
              {issues.types.map((type, index) => (
                <li key={index} className="p-3">
                  <div className="flex items-start">
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm font-medium ${getSeverityTextColor(type.severity)}`}>
                        {type.name}
                      </p>
                      <p className="text-xs text-gray-500">{type.description}</p>
                    </div>
                    <div className="ml-3 flex-shrink-0">
                      <span className={`inline-flex items-center rounded-full ${getSeverityBgColor(type.severity)} px-2.5 py-0.5 text-xs font-medium ${getSeverityTextColor(type.severity)}`}>
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

function getSeverityBgColor(severity: string): string {
  switch (severity) {
    case 'high':
      return 'bg-red-100';
    case 'medium':
      return 'bg-yellow-100';
    case 'low':
      return 'bg-blue-100';
    default:
      return 'bg-gray-100';
  }
}

function getSeverityTextColor(severity: string): string {
  switch (severity) {
    case 'high':
      return 'text-red-800';
    case 'medium':
      return 'text-yellow-800';
    case 'low':
      return 'text-blue-800';
    default:
      return 'text-gray-800';
  }
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
