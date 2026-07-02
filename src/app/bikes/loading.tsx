export default function BikesLoading() {
  return (
    <div className="animate-pulse">
      {/* Page header */}
      <div className="bg-white border-b border-gray-100 py-10">
        <div className="container mx-auto px-4 space-y-3">
          <div className="h-9 w-56 bg-gray-200 rounded-xl" />
          <div className="h-4 w-80 bg-gray-100 rounded-full" />
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters sidebar */}
          <aside className="w-full lg:w-64 shrink-0 space-y-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 space-y-3">
                <div className="h-4 w-24 bg-gray-200 rounded-full" />
                <div className="space-y-2">
                  {Array.from({ length: 4 }).map((_, j) => (
                    <div key={j} className="h-8 bg-gray-100 rounded-lg" />
                  ))}
                </div>
              </div>
            ))}
          </aside>

          {/* Bikes grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <div className="h-4 w-32 bg-gray-200 rounded-full" />
              <div className="h-8 w-28 bg-gray-100 rounded-lg" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                  <div className="aspect-[4/3] bg-gray-200" />
                  <div className="p-4 space-y-3">
                    <div className="h-5 w-3/4 bg-gray-200 rounded-lg" />
                    <div className="h-3 w-1/2 bg-gray-100 rounded-full" />
                    <div className="h-8 w-1/3 bg-gray-200 rounded-lg" />
                    <div className="h-11 w-full bg-gray-100 rounded-xl" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
