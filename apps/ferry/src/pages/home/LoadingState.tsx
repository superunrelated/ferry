export function LoadingState() {
  return (
    <div className="text-center py-12">
      <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-slate-600 border-t-cyan-400 vision-impaired:h-12 vision-impaired:w-12 vision-impaired:border-white vision-impaired:border-t-cyan-500 vision-impaired:border-4"></div>
      <div className="text-slate-400 mt-4 vision-impaired:text-base vision-impaired:text-white vision-impaired:font-bold">Loading...</div>
    </div>
  );
}

