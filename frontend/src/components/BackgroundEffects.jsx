export default function BackgroundEffects() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10 select-none" aria-hidden="true">
      {/* --- Light Mode Subtle Accent --- */}
      <div className="dark:hidden absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(219,234,254,0.65),transparent_70%)]" />

      {/* --- Dark Mode Ambient Atmospheric Shadows & Glows --- */}
      {/* Base Canvas */}
      <div className="hidden dark:block absolute inset-0 bg-[#060813]" />

      {/* Top Center Primary Spotlight & Soft Halo */}
      <div className="hidden dark:block absolute -top-48 left-1/2 -translate-x-1/2 w-[760px] max-w-[95vw] h-[520px] rounded-full bg-primary-600/20 blur-[140px] animate-ambient-slow" />

      {/* Right-Side Indigo Ambient Light / Shadow Cast */}
      <div className="hidden dark:block absolute top-1/4 -right-28 w-[550px] h-[550px] rounded-full bg-indigo-600/15 blur-[150px] animate-ambient-delayed" />

      {/* Left-Side Sky Blue Ambient Light */}
      <div className="hidden dark:block absolute top-2/3 -left-32 w-[520px] h-[500px] rounded-full bg-sky-500/12 blur-[140px] animate-ambient-slow" />

      {/* Subtle Bottom Deep Violet Fill */}
      <div className="hidden dark:block absolute -bottom-36 right-1/4 w-[600px] h-[450px] rounded-full bg-violet-700/10 blur-[160px]" />

      {/* Fine Tech Dot Matrix with Smooth Radial Mask */}
      <div className="hidden dark:block absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:28px_28px] [mask-image:radial-gradient(ellipse_75%_65%_at_50%_35%,#000_40%,transparent_100%)] opacity-70" />

      {/* Cinematic Deep Edge Vignette Shadow */}
      <div className="hidden dark:block absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(5,7,16,0.6)_65%,rgba(3,5,13,0.94)_100%)]" />

      {/* Sleek Top Horizon Light Beam */}
      <div className="hidden dark:block absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary-500/30 to-transparent" />
    </div>
  );
}
