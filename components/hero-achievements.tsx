import type { Settings } from "@/lib/content-model";

export default function HeroAchievements({ settings }: { settings: Settings }) {
  return <aside className="hero-proof" aria-label="Research highlights">
    <div className="hero-proof-metrics">
      <div className="hero-proof-metric">
        <span className="hero-proof-label">{settings.homeInfluenceLabel}</span>
        <strong>{settings.homeHIndex}</strong>
        <span className="hero-proof-note">{settings.homeHIndexNote}</span>
      </div>
      <div className="hero-proof-metric">
        <span className="hero-proof-label">{settings.homeHcrLabel}</span>
        <strong className="hero-proof-years">{settings.homeHcrYears}</strong>
        <span className="hero-proof-note">{settings.homeHcrNote}</span>
      </div>
    </div>
  </aside>;
}
