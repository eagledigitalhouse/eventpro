export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Skeleton */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-20 h-8 bg-gray-200 rounded animate-pulse" />
              <div>
                <div className="w-40 h-6 bg-gray-200 rounded animate-pulse mb-2" />
                <div className="w-32 h-4 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-20 h-6 bg-gray-200 rounded animate-pulse" />
              <div className="w-24 h-8 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="container mx-auto px-4 py-6">
        <div className="space-y-6">
          <div className="w-full h-10 bg-gray-200 rounded animate-pulse" />
          <div className="h-96 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    </div>
  )
}
