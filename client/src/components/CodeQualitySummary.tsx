import { ReviewResult } from "@shared/schema";

interface CodeQualitySummaryProps {
  metrics: ReviewResult['metrics'];
}

export default function CodeQualitySummary({ metrics }: CodeQualitySummaryProps) {
  return (
    <div className="border-b border-gray-200">
      <div className="px-6 py-4">
        <h4 className="font-medium text-base mb-3">Code Quality Summary</h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Overall Quality */}
          <MetricCard
            title="Overall Quality"
            grade={metrics.overall.grade}
            change={metrics.overall.change}
          />
          
          {/* Maintainability */}
          <MetricCard
            title="Maintainability"
            grade={metrics.maintainability.grade}
            change={metrics.maintainability.change}
          />
          
          {/* Performance */}
          <MetricCard
            title="Performance"
            grade={metrics.performance.grade}
            change={metrics.performance.change}
          />
          
          {/* Security */}
          <MetricCard
            title="Security"
            grade={metrics.security.grade}
            change={metrics.security.change}
          />
        </div>
      </div>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  grade: string;
  change?: number;
}

function MetricCard({ title, grade, change }: MetricCardProps) {
  let changeDisplay: JSX.Element | null = null;
  
  if (change !== undefined) {
    if (change > 0) {
      changeDisplay = (
        <p className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
          <svg className="self-center flex-shrink-0 h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
          <span className="sr-only">Increased by</span>
          {change}%
        </p>
      );
    } else if (change < 0) {
      changeDisplay = (
        <p className="ml-2 flex items-baseline text-sm font-semibold text-red-600">
          <svg className="self-center flex-shrink-0 h-5 w-5 text-red-500 transform rotate-180" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
          <span className="sr-only">Decreased by</span>
          {Math.abs(change)}%
        </p>
      );
    } else {
      changeDisplay = (
        <p className="ml-2 flex items-baseline text-sm font-semibold text-yellow-600">
          <svg className="self-center flex-shrink-0 h-5 w-5 text-yellow-500 transform rotate-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path fillRule="evenodd" d="M10 3a1 1 0 01.707.293l7 7a1 1 0 01-1.414 1.414L10 5.414 3.707 11.707a1 1 0 01-1.414-1.414l7-7A1 1 0 0110 3z" clipRule="evenodd" />
          </svg>
          <span className="sr-only">No change</span>
          0%
        </p>
      );
    }
  }
  
  return (
    <div className="bg-gray-50 p-4 rounded-md">
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <div className="mt-1 flex items-baseline">
        <p className="text-2xl font-semibold text-gray-900">{grade}</p>
        {changeDisplay}
      </div>
    </div>
  );
}
