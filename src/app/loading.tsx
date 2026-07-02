export default function HomeLoading() {
  return (
    <div className="animate-pulse">
      {/* Hero skeleton */}
      <div className="relative h-[85vh] bg-gray-900">
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-6">
          <div className="h-4 w-32 bg-white/20 rounded-full" />
          <div className="h-12 w-96 bg-white/20 rounded-2xl" />
          <div className="h-6 w-64 bg-white/10 rounded-full" />
          <div className="flex gap-4 mt-4">
            <div className="h-12 w-40 bg-emerald-500/40 rounded-xl" />
            <div className="h-12 w-36 bg-white/10 rounded-xl" />
          </div>
        </div>
      </div>

      {/* Bikes section skeleton */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-10">
            <div className="space-y-2">
              <div className="h-3 w-20 bg-gray-200 rounded-full" />
              <div className="h-8 w-48 bg-gray-200 rounded-xl" />
              <div className="h-4 w-32 bg-gray-100 rounded-full" />
            </div>
            <div className="h-4 w-24 bg-gray-200 rounded-full" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
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
      </section>
    </div>
  );
}
