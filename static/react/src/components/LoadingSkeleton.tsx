export default function LoadingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          {/* Header skeleton */}
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>

          {/* Date skeleton */}
          <div className="h-4 bg-gray-100 rounded w-1/2 mb-4"></div>

          {/* Metrics grid skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map((j) => (
              <div key={j} className="bg-gray-100 rounded-lg p-4">
                <div className="h-3 bg-gray-200 rounded w-16 mb-2"></div>
                <div className="h-5 bg-gray-200 rounded w-12"></div>
              </div>
            ))}
          </div>

          {/* Info skeleton */}
          <div className="h-4 bg-gray-100 rounded w-2/3 mb-4"></div>

          {/* Buttons skeleton */}
          <div className="flex flex-col sm:flex-row gap-3">
            {[1, 2, 3].map((j) => (
              <div key={j} className="h-10 bg-gray-200 rounded-lg flex-1"></div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
