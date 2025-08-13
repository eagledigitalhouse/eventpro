export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="w-48 h-8 bg-gray-200 rounded animate-pulse mb-2" />
          <div className="w-64 h-4 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>

      {/* Estatísticas Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="w-24 h-4 bg-gray-200 rounded animate-pulse mb-2" />
                <div className="w-12 h-8 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="w-8 h-8 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>

      {/* Filtros Skeleton */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 h-10 bg-gray-200 rounded animate-pulse" />
        <div className="w-full sm:w-48 h-10 bg-gray-200 rounded animate-pulse" />
      </div>

      {/* Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white rounded-lg border overflow-hidden">
            <div className="aspect-video bg-gray-200 animate-pulse" />
            <div className="p-4 space-y-3">
              <div className="w-3/4 h-6 bg-gray-200 rounded animate-pulse" />
              <div className="w-1/2 h-4 bg-gray-200 rounded animate-pulse" />
              <div className="flex gap-2">
                <div className="flex-1 h-8 bg-gray-200 rounded animate-pulse" />
                <div className="w-10 h-8 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
