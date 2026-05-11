import { LandingMarketCards } from './LandingMarketCards'

/** Hero right column: USD/GEL course + compact metal prices (anchors target #markets band below too). */
export function HeroMarketColumn() {
  return (
    <div className="flex w-full max-w-md flex-col justify-center gap-4 lg:mx-0 lg:max-w-none">
      <LandingMarketCards interaction="hero" />
    </div>
  )
}
