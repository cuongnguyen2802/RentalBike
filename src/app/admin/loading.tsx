export default function AdminLoading() {
  return (
    <div className="p-8 animate-pulse">
      <div className="mb-8 space-y-2">
        <div className="h-7 w-36 bg-gray-200 rounded-xl" />
        <div className="h-4 w-64 bg-gray-100 rounded-full" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-3">
            <div className="h-10 w-10 bg-gray-100 rounded-xl" />
            <div className="h-7 w-16 bg-gray-200 rounded-lg" />
            <div className="h-4 w-28 bg-gray-100 rounded-full" />
            <div className="h-3 w-40 bg-gray-100 rounded-full" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <div className="h-5 w-36 bg-gray-200 rounded-lg" />
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-12 bg-gray-50 rounded-xl" />
          ))}
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <div className="h-5 w-40 bg-gray-200 rounded-lg" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <div className="h-4 w-full bg-gray-100 rounded-full" />
              <div className="h-2 bg-gray-100 rounded-full" style={{ width: `${70 - i * 12}%` }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
