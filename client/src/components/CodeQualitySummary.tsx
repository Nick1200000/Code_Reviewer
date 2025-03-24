import { ReviewResult } from "@shared/schema";

interface CodeQualitySummaryProps {
  metrics: ReviewResult['metrics'];
}

export default function CodeQualitySummary({ metrics }: CodeQualitySummaryProps) {
  return (
    <div className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
      <div className="px-6 py-5">
        <h4 className="font-semibold text-lg mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
          Code Quality Summary
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          {/* Overall Quality */}
          <MetricCard
            title="Overall Quality"
            grade={metrics.overall.grade}
            change={metrics.overall.change}
            color="from-blue-600 to-indigo-600"
            bgColor="from-blue-50 to-indigo-50"
          />
          
          {/* Maintainability */}
          <MetricCard
            title="Maintainability"
            grade={metrics.maintainability.grade}
            change={metrics.maintainability.change}
            color="from-emerald-600 to-teal-600"
            bgColor="from-emerald-50 to-teal-50"
          />
          
          {/* Performance */}
          <MetricCard
            title="Performance"
            grade={metrics.performance.grade}
            change={metrics.performance.change}
            color="from-purple-600 to-fuchsia-600"
            bgColor="from-purple-50 to-fuchsia-50"
          />
          
          {/* Security */}
          <MetricCard
            title="Security"
            grade={metrics.security.grade}
            change={metrics.security.change}
            color="from-amber-600 to-orange-600"
            bgColor="from-amber-50 to-orange-50"
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
  color: string;
  bgColor: string;
}

function MetricCard({ title, grade, change, color, bgColor }: MetricCardProps) {
  let changeDisplay: JSX.Element | null = null;
  
  const getGradeClass = (grade: string) => {
    switch(grade.toUpperCase()) {
      case 'A':
      case 'A+':
        return 'text-emerald-600';
      case 'B':
      case 'B+':
        return 'text-blue-600';
      case 'C':
      case 'C+':
        return 'text-amber-600';
      case 'D':
      case 'D+':
        return 'text-orange-600';
      default:
        return 'text-red-600';
    }
  };
  
  if (change !== undefined) {
    if (change > 0) {
      changeDisplay = (
        <div className="ml-2 flex items-baseline text-sm font-semibold text-emerald-600 bg-emerald-50 rounded-full px-2 py-0.5">
          <svg className="self-center flex-shrink-0 h-4 w-4 mr-1 text-emerald-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
          <span className="sr-only">Increased by</span>
          {change}%
        </div>
      );
    } else if (change < 0) {
      changeDisplay = (
        <div className="ml-2 flex items-baseline text-sm font-semibold text-red-600 bg-red-50 rounded-full px-2 py-0.5">
          <svg className="self-center flex-shrink-0 h-4 w-4 mr-1 text-red-500 transform rotate-180" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
          <span className="sr-only">Decreased by</span>
          {Math.abs(change)}%
        </div>
      );
    } else {
      changeDisplay = (
        <div className="ml-2 flex items-baseline text-sm font-semibold text-gray-600 bg-gray-100 rounded-full px-2 py-0.5">
          <svg className="self-center flex-shrink-0 h-4 w-4 mr-1 text-gray-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path fillRule="evenodd" d="M10 3a1 1 0 01.707.293l7 7a1 1 0 01-1.414 1.414L10 5.414 3.707 11.707a1 1 0 01-1.414-1.414l7-7A1 1 0 0110 3z" clipRule="evenodd" />
          </svg>
          <span className="sr-only">No change</span>
          0%
        </div>
      );
    }
  }
  
  return (
    <div className={`bg-gradient-to-r ${bgColor} p-5 rounded-lg shadow-sm border border-gray-100 transition-all hover:shadow-md`}>
      <p className={`text-sm font-medium bg-clip-text text-transparent bg-gradient-to-r ${color}`}>{title}</p>
      <div className="mt-2 flex items-center">
        <p className={`text-3xl font-bold ${getGradeClass(grade)}`}>{grade}</p>
        {changeDisplay}
      </div>
    </div>
  );
}
