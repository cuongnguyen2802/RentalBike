export default function BookingLoading() {
  return (
    <div className="animate-pulse min-h-[calc(100vh-64px)] bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
      <div className="px-8 pt-5">
        <div className="h-4 w-24 bg-white/10 rounded-full" />
      </div>

      <div className="flex items-start gap-12 max-w-7xl mx-auto px-8 py-8">
        {/* Left: bike image skeleton */}
        <div className="flex-1 min-w-0 hidden md:flex flex-col gap-7">
          <div className="aspect-[3/2] bg-white/10 rounded-3xl" />
          <div className="space-y-4">
            <div className="h-3 w-40 bg-white/10 rounded-full" />
            <div className="h-12 w-72 bg-white/10 rounded-2xl" />
            <div className="h-8 w-48 bg-white/10 rounded-xl" />
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-4 w-80 bg-white/10 rounded-full" />
              ))}
            </div>
          </div>
        </div>

        {/* Right: booking form skeleton */}
        <div className="w-full md:w-[420px] shrink-0">
          <div className="bg-white/5 rounded-3xl p-6 space-y-5 border border-white/10">
            <div className="h-6 w-40 bg-white/10 rounded-xl" />
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-12 bg-white/10 rounded-xl" />
              ))}
            </div>
            <div className="h-16 bg-white/10 rounded-2xl" />
            <div className="h-12 bg-emerald-500/30 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
