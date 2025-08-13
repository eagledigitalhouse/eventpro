export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Banner Skeleton */}
      <div className="h-96 bg-gray-200 animate-pulse" />

      {/* Content Skeleton */}
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Title Skeleton */}
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded animate-pulse w-3/4" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
          </div>

          {/* Cards Skeleton */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow p-6">
                <div className="space-y-4">
                  <div className="h-6 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                  <div className="h-10 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
