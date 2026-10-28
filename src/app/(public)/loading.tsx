export default function PublicLoading() {
  return (
    <div className="storefront mx-auto max-w-6xl animate-pulse px-6 py-16 lg:px-8">
      <div className="bg-muted mb-6 h-10 w-48" />
      <div className="bg-muted mb-12 h-4 w-72 max-w-full" />
      <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <div className="bg-muted aspect-[3/4] w-full" />
            <div className="bg-muted h-3 w-20" />
            <div className="bg-muted h-5 w-36" />
            <div className="bg-muted h-3 w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}
