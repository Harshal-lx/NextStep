export default function FloatingBg() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden>
      <div className="absolute inset-0 bg-grid opacity-30" />
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-blue-500/20 blur-[120px] animate-float-slow" />
      <div className="absolute top-1/3 -right-40 w-[600px] h-[600px] rounded-full bg-purple-500/20 blur-[140px] animate-float-slow" style={{animationDelay:'2s'}}/>
      <div className="absolute -bottom-40 left-1/3 w-[500px] h-[500px] rounded-full bg-blue-600/15 blur-[120px] animate-float-slow" style={{animationDelay:'4s'}}/>
    </div>
  );
}
