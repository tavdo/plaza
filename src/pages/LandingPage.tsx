import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAppStore, isAgreementComplete } from '../stores/useAppStore'
import { useTranslation } from '../hooks/useTranslation'
import { HeroMarketColumn } from '../components/HeroMarketColumn'
import type { Key } from '../lib/i18n'

export function LandingPage() {
  const { t } = useTranslation()
  const user = useAppStore((s) => s.user)
  const agreement = useAppStore((s) => s.agreement)
  const application = useAppStore((s) => s.application)

  const dashboardTo =
    user && isAgreementComplete(agreement) && application
      ? '/dashboard'
      : user && isAgreementComplete(agreement)
        ? '/application'
        : user
          ? '/terms'
          : '/register'

  const strip: { icon: string; titleKey: Key; subKey: Key }[] = [
    { icon: '△', titleKey: 'land.strip.tech.title', subKey: 'land.strip.tech.sub' },
    { icon: '👑', titleKey: 'land.strip.metals.title', subKey: 'land.strip.metals.sub' },
    { icon: '∞', titleKey: 'land.strip.limitless.title', subKey: 'land.strip.limitless.sub' },
    { icon: '🌐', titleKey: 'land.strip.global.title', subKey: 'land.strip.global.sub' },
    { icon: '⚖️', titleKey: 'land.strip.sustainable.title', subKey: 'land.strip.sustainable.sub' },
  ]

  const categories: { titleKey: Key; icon: string }[] = [
    { titleKey: 'land.cat.jewelry', icon: '💍' },
    { titleKey: 'land.cat.accessories', icon: '⌚' },
    { titleKey: 'land.cat.souvenirs', icon: '🪙' },
    { titleKey: 'land.cat.sanitary', icon: '🚰' },
    { titleKey: 'land.cat.stationery', icon: '✒️' },
    { titleKey: 'land.cat.construction', icon: '🧱' },
    { titleKey: 'land.cat.more', icon: '★' },
  ]

  const investBullets: { titleKey: Key; icon: string }[] = [
    { titleKey: 'land.invest.bullet1', icon: '📈' },
    { titleKey: 'land.invest.bullet2', icon: '⚙️' },
    { titleKey: 'land.invest.bullet3', icon: '🤝' },
    { titleKey: 'land.invest.bullet4', icon: '🌍' },
  ]

  const footerItems: { titleKey: Key; descKey: Key; icon: string }[] = [
    { titleKey: 'land.footer.secure.title', descKey: 'land.footer.secure.desc', icon: '🔒' },
    { titleKey: 'land.footer.fast.title', descKey: 'land.footer.fast.desc', icon: '⚡' },
    { titleKey: 'land.footer.community.title', descKey: 'land.footer.community.desc', icon: '🌐' },
    { titleKey: 'land.footer.support.title', descKey: 'land.footer.support.desc', icon: '💬' },
  ]

  return (
    <div className="w-full flex flex-col">
      <section className="relative mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-12">
          <div className="lg:col-span-6 xl:col-span-5 relative z-10">
            <motion.h1
              className="font-display text-5xl font-bold uppercase leading-[1.1] tracking-wide text-zinc-100 sm:text-6xl md:text-7xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {t('land.hero.line1')} <br />
              <span className="text-gradient-gold">{t('land.hero.line2')}</span> <br />
              {t('land.hero.line3')}
            </motion.h1>
            <motion.p
              className="mt-6 max-w-md text-base leading-relaxed text-zinc-400"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              {t('land.hero.sub')}
            </motion.p>
            <motion.div
              className="mt-10 flex flex-wrap items-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <Link to="#collection" className="ms-btn-gold px-8 py-4">
                {t('land.cta.explore')} <span className="ml-2">›</span>
              </Link>
              <button type="button" className="ms-btn-outline px-8 py-4">
                <span className="mr-2">▶</span> {t('land.cta.watch')}
              </button>
            </motion.div>
          </div>

          <motion.div
            className="relative lg:col-span-4 xl:col-span-4 flex justify-center lg:justify-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <div className="relative h-[24rem] w-[24rem] sm:h-[32rem] sm:w-[32rem]">
              <div className="absolute inset-0 rounded-full border border-gold-500/20 shadow-[0_0_120px_rgba(212,175,55,0.15)]" />
              <motion.div
                className="absolute inset-8 flex items-center justify-center rounded-full border border-gold-400/30 bg-gradient-to-b from-void-800 to-void-950 shadow-[inset_0_0_80px_rgba(212,175,55,0.1)]"
                animate={{ rotate: 360 }}
                transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
              >
                <div className="relative flex items-center justify-center h-full w-full">
                  <div className="absolute inset-4 rounded-full border-[6px] border-gold-600/40 border-t-gold-400" />
                  <span className="text-8xl text-gold-500 drop-shadow-[0_0_30px_rgba(212,175,55,0.8)]" aria-hidden>
                    ★
                  </span>
                </div>
              </motion.div>
              <div className="absolute -bottom-10 left-1/2 h-16 w-3/4 -translate-x-1/2 rounded-[100%] bg-gold-500/10 blur-xl" />
              <div className="absolute -bottom-4 left-1/2 h-4 w-2/3 -translate-x-1/2 rounded-[100%] border-t border-gold-400/30 bg-void-800 shadow-[0_-10px_30px_rgba(212,175,55,0.2)]" />
            </div>
          </motion.div>

          <div className="lg:col-span-2 xl:col-span-3 flex flex-col items-stretch justify-center gap-4">
            <HeroMarketColumn />
          </div>
        </div>
      </section>

      <section className="w-full border-y border-white/5 bg-void-900/50 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl flex-wrap justify-center gap-8 px-4 py-8 sm:px-6 sm:justify-between lg:px-8">
          {strip.map((feat, i) => (
            <div key={i} className="flex flex-col items-center text-center">
              <span className="mb-2 text-2xl text-gold-400">{feat.icon}</span>
              <h4 className="text-xs font-bold tracking-widest text-zinc-200">{t(feat.titleKey)}</h4>
              <p className="mt-1 text-[10px] uppercase tracking-wider text-zinc-500">{t(feat.subKey)}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="collection" className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <h2 className="mb-10 text-center font-display text-sm font-bold tracking-[0.2em] text-zinc-100">
          {t('land.categories.title')}
        </h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-7">
          {categories.map((cat, i) => (
            <div
              key={i}
              className="group cursor-pointer rounded-xl border border-white/5 bg-void-900/40 p-6 text-center transition-all hover:border-gold-500/40 hover:bg-void-800"
            >
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-gold-500/10 bg-gradient-to-b from-void-800 to-void-950 text-3xl shadow-[0_0_15px_rgba(212,175,55,0.05)] transition-transform group-hover:scale-110">
                {cat.icon}
              </div>
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-zinc-300 group-hover:text-gold-400">
                {t(cat.titleKey)}
              </h3>
            </div>
          ))}
        </div>
      </section>

      <section id="technology" className="relative w-full overflow-hidden border-y border-white/5 bg-void-900/30 py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-16 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <h2 className="font-display text-3xl font-bold uppercase leading-tight tracking-wide text-zinc-100 md:text-4xl">
              {t('land.tech.title1')} <br />
              <span className="text-zinc-300">{t('land.tech.title2')}</span>
            </h2>
            <p className="mt-6 max-w-lg text-sm leading-relaxed text-zinc-400">{t('land.tech.body')}</p>
            <button type="button" className="ms-btn-outline mt-10 px-8 py-3">
              {t('land.tech.cta')} <span className="ml-2">›</span>
            </button>
          </div>
          <div className="relative flex justify-center">
            <div className="relative h-64 w-full max-w-md rounded-2xl border border-gold-500/20 bg-gradient-to-r from-void-900 to-void-800 p-8 shadow-[0_0_50px_rgba(212,175,55,0.05)]">
               <div className="absolute right-0 top-1/2 h-32 w-32 -translate-y-1/2 translate-x-1/4 rounded-full bg-gold-500/20 blur-3xl" />
               <div className="flex h-full flex-col justify-between">
                  <div className="flex items-center gap-4 border-l-2 border-gold-500 pl-4">
                    <div>
                      <h4 className="text-xs font-bold tracking-wider text-zinc-200">{t('land.tech.callout1.title')}</h4>
                      <p className="text-[10px] text-zinc-500">{t('land.tech.callout1.desc')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 border-l-2 border-gold-500 pl-4 ml-8">
                    <div>
                      <h4 className="text-xs font-bold tracking-wider text-zinc-200">{t('land.tech.callout2.title')}</h4>
                      <p className="text-[10px] text-zinc-500">{t('land.tech.callout2.desc')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 border-l-2 border-gold-500 pl-4 ml-16">
                    <div>
                      <h4 className="text-xs font-bold tracking-wider text-zinc-200">{t('land.tech.callout3.title')}</h4>
                      <p className="text-[10px] text-zinc-500">{t('land.tech.callout3.desc')}</p>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      <section id="invest" className="mx-auto w-full max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="grid items-center gap-16 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <h2 className="font-display text-3xl font-bold uppercase tracking-wide text-zinc-100">
              {t('land.invest.title')}
            </h2>
            <p className="mt-4 text-sm text-zinc-400">{t('land.invest.body')}</p>
            <Link to={user ? dashboardTo : '/register'} className="ms-btn-gold mt-8 px-8 py-3">
              {t('land.invest.cta')} <span className="ml-2">›</span>
            </Link>
          </div>
          <div className="flex justify-center lg:col-span-1">
            <div className="relative h-64 w-64 rounded-full border border-gold-500/20 shadow-[0_0_80px_rgba(212,175,55,0.15)] overflow-hidden">
               <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-void-800 to-void-950" />
               <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMjEyLCAxNzUsIDU1LCAwLjQpIi8+PC9zdmc+')] opacity-30 animate-pulse" />
            </div>
          </div>
          <div className="flex flex-col gap-8 lg:col-span-1">
            {investBullets.map((item, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="text-2xl text-gold-400">{item.icon}</div>
                <h4 className="text-sm font-bold tracking-wider text-zinc-200">{t(item.titleKey)}</h4>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="border-t border-white/5 bg-void-900/50 py-8">
        <div className="mx-auto flex max-w-7xl flex-wrap justify-between gap-6 px-4 sm:px-6 lg:px-8">
          {footerItems.map((item, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="text-2xl text-gold-400">{item.icon}</div>
              <div>
                <h4 className="text-xs font-bold tracking-wider text-zinc-200">{t(item.titleKey)}</h4>
                <p className="text-[10px] text-zinc-500">{t(item.descKey)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
