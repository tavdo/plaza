import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAppStore, isAgreementComplete } from '../stores/useAppStore'

export function LandingPage() {
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

  return (
    <div className="w-full flex flex-col">
      {/* HERO SECTION */}
      <section className="relative mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-12">
          {/* Left Hero Text */}
          <div className="lg:col-span-6 xl:col-span-5 relative z-10">
            <motion.h1
              className="font-display text-5xl font-bold uppercase leading-[1.1] tracking-wide text-zinc-100 sm:text-6xl md:text-7xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              The Next Era of <br />
              <span className="text-gradient-gold">Luxury</span> <br />
              Is Here
            </motion.h1>
            <motion.p
              className="mt-6 max-w-md text-base leading-relaxed text-zinc-400"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              MERGE STARS is a revolutionary platform combining advanced 3D filament technology
              with precious metals.
            </motion.p>
            <motion.div
              className="mt-10 flex flex-wrap items-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <Link to="#collection" className="ms-btn-gold px-8 py-4">
                EXPLORE COLLECTION <span className="ml-2">›</span>
              </Link>
              <button className="ms-btn-outline px-8 py-4">
                <span className="mr-2">▶</span> WATCH VIDEO
              </button>
            </motion.div>
          </div>

          {/* Center Graphic */}
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
                  {/* Outer ring */}
                  <div className="absolute inset-4 rounded-full border-[6px] border-gold-600/40 border-t-gold-400" />
                  <span className="text-8xl text-gold-500 drop-shadow-[0_0_30px_rgba(212,175,55,0.8)]" aria-hidden>
                    ★
                  </span>
                </div>
              </motion.div>
              {/* Stand/Platform effect */}
              <div className="absolute -bottom-10 left-1/2 h-16 w-3/4 -translate-x-1/2 rounded-[100%] bg-gold-500/10 blur-xl" />
              <div className="absolute -bottom-4 left-1/2 h-4 w-2/3 -translate-x-1/2 rounded-[100%] border-t border-gold-400/30 bg-void-800 shadow-[0_-10px_30px_rgba(212,175,55,0.2)]" />
            </div>
          </motion.div>

          {/* Right Info Panels */}
          <div className="lg:col-span-2 xl:col-span-3 flex flex-col justify-center gap-4">
            {[
              { title: '3D FILAMENT', desc: 'Patented 3D filament infused with real precious metals', icon: '🧊' },
              { title: 'REAL PRECIOUS METALS', desc: 'Gold, Silver, Platinum and more', icon: '🟨' },
              { title: 'LIMITLESS POSSIBILITIES', desc: 'From jewelry to architecture', icon: '✧' },
            ].map((item, i) => (
              <motion.div
                key={i}
                className="ms-glass rounded-xl p-5 border border-white/5 hover:border-gold-500/30"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + i * 0.1, duration: 0.5 }}
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded border border-gold-500/20 bg-void-800 text-xl text-gold-400">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="font-display text-sm font-bold tracking-wider text-zinc-100">{item.title}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-zinc-400">{item.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES STRIP */}
      <section className="w-full border-y border-white/5 bg-void-900/50 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl flex-wrap justify-center gap-8 px-4 py-8 sm:px-6 sm:justify-between lg:px-8">
          {[
            { icon: '△', title: '3D TECHNOLOGY', sub: 'Patented Innovation' },
            { icon: '👑', title: 'REAL PRECIOUS METALS', sub: 'Infused In Every Product' },
            { icon: '∞', title: 'LIMITLESS POSSIBILITIES', sub: 'Unlimited Applications' },
            { icon: '🌐', title: 'GLOBAL PLATFORM', sub: 'Serving Worldwide' },
            { icon: '⚖️', title: 'SUSTAINABLE & LIGHTWEIGHT', sub: 'Future of Luxury' },
          ].map((feat, i) => (
            <div key={i} className="flex flex-col items-center text-center">
              <span className="mb-2 text-2xl text-gold-400">{feat.icon}</span>
              <h4 className="text-xs font-bold tracking-widest text-zinc-200">{feat.title}</h4>
              <p className="mt-1 text-[10px] uppercase tracking-wider text-zinc-500">{feat.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* EXPLORE BY CATEGORY */}
      <section id="collection" className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <h2 className="mb-10 text-center font-display text-sm font-bold tracking-[0.2em] text-zinc-100">
          EXPLORE BY CATEGORY
        </h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-7">
          {[
            { title: 'JEWELRY', icon: '💍' },
            { title: 'ACCESSORIES', icon: '⌚' },
            { title: 'SOUVENIRS', icon: '🪙' },
            { title: 'SANITARYWARE', icon: '🚰' },
            { title: 'STATIONERY', icon: '✒️' },
            { title: 'CONSTRUCTION MATERIALS', icon: '🧱' },
            { title: 'MORE CATEGORIES', icon: '★' },
          ].map((cat, i) => (
            <div
              key={i}
              className="group cursor-pointer rounded-xl border border-white/5 bg-void-900/40 p-6 text-center transition-all hover:border-gold-500/40 hover:bg-void-800"
            >
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-gold-500/10 bg-gradient-to-b from-void-800 to-void-950 text-3xl shadow-[0_0_15px_rgba(212,175,55,0.05)] transition-transform group-hover:scale-110">
                {cat.icon}
              </div>
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-zinc-300 group-hover:text-gold-400">
                {cat.title}
              </h3>
            </div>
          ))}
        </div>
      </section>

      {/* REVOLUTIONARY TECHNOLOGY */}
      <section id="technology" className="relative w-full overflow-hidden border-y border-white/5 bg-void-900/30 py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-16 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <h2 className="font-display text-3xl font-bold uppercase leading-tight tracking-wide text-zinc-100 md:text-4xl">
              Revolutionary <br />
              <span className="text-zinc-300">3D Filament Technology</span>
            </h2>
            <p className="mt-6 max-w-lg text-sm leading-relaxed text-zinc-400">
              Our proprietary 3D filament is enriched with real precious metals, creating products that are
              lightweight, durable, and exude unmatched luxury.
            </p>
            <button className="ms-btn-outline mt-10 px-8 py-3">
              DISCOVER TECHNOLOGY <span className="ml-2">›</span>
            </button>
          </div>
          <div className="relative flex justify-center">
            {/* Visual representation of the glowing nozzle */}
            <div className="relative h-64 w-full max-w-md rounded-2xl border border-gold-500/20 bg-gradient-to-r from-void-900 to-void-800 p-8 shadow-[0_0_50px_rgba(212,175,55,0.05)]">
               <div className="absolute right-0 top-1/2 h-32 w-32 -translate-y-1/2 translate-x-1/4 rounded-full bg-gold-500/20 blur-3xl" />
               <div className="flex h-full flex-col justify-between">
                  {/* Callouts */}
                  <div className="flex items-center gap-4 border-l-2 border-gold-500 pl-4">
                    <div>
                      <h4 className="text-xs font-bold tracking-wider text-zinc-200">PRECIOUS METALS</h4>
                      <p className="text-[10px] text-zinc-500">Real gold, silver, platinum and more</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 border-l-2 border-gold-500 pl-4 ml-8">
                    <div>
                      <h4 className="text-xs font-bold tracking-wider text-zinc-200">ADVANCED COMPOSITE</h4>
                      <p className="text-[10px] text-zinc-500">Proprietary blend for strength and beauty</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 border-l-2 border-gold-500 pl-4 ml-16">
                    <div>
                      <h4 className="text-xs font-bold tracking-wider text-zinc-200">LIGHTWEIGHT CORE</h4>
                      <p className="text-[10px] text-zinc-500">Engineered for performance</p>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* INVEST IN THE FUTURE */}
      <section id="invest" className="mx-auto w-full max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="grid items-center gap-16 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <h2 className="font-display text-3xl font-bold uppercase tracking-wide text-zinc-100">
              Invest In The Future
            </h2>
            <p className="mt-4 text-sm text-zinc-400">
              Be part of a global movement redefining luxury, technology, and value.
            </p>
            <Link to={user ? dashboardTo : '/register'} className="ms-btn-gold mt-8 px-8 py-3">
              LEARN MORE <span className="ml-2">›</span>
            </Link>
          </div>
          <div className="flex justify-center lg:col-span-1">
            <div className="relative h-64 w-64 rounded-full border border-gold-500/20 shadow-[0_0_80px_rgba(212,175,55,0.15)] overflow-hidden">
               {/* Globe representation */}
               <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-void-800 to-void-950" />
               <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMjEyLCAxNzUsIDU1LCAwLjQpIi8+PC9zdmc+')] opacity-30 animate-pulse" />
            </div>
          </div>
          <div className="flex flex-col gap-8 lg:col-span-1">
            {[
              { title: 'HIGH GROWTH POTENTIAL', icon: '📈' },
              { title: 'INNOVATIVE TECHNOLOGY', icon: '⚙️' },
              { title: 'STRONG PARTNERSHIP', icon: '🤝' },
              { title: 'GLOBAL IMPACT', icon: '🌍' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="text-2xl text-gold-400">{item.icon}</div>
                <h4 className="text-sm font-bold tracking-wider text-zinc-200">{item.title}</h4>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER STRIP */}
      <div className="border-t border-white/5 bg-void-900/50 py-8">
        <div className="mx-auto flex max-w-7xl flex-wrap justify-between gap-6 px-4 sm:px-6 lg:px-8">
          {[
            { title: 'SECURE PLATFORM', desc: 'Your data is 100% protected', icon: '🔒' },
            { title: 'FAST & RELIABLE', desc: 'Seamless experience', icon: '⚡' },
            { title: 'GLOBAL COMMUNITY', desc: 'Join thousands of members', icon: '🌐' },
            { title: 'DEDICATED SUPPORT', desc: 'We are here for you', icon: '💬' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="text-2xl text-gold-400">{item.icon}</div>
              <div>
                <h4 className="text-xs font-bold tracking-wider text-zinc-200">{item.title}</h4>
                <p className="text-[10px] text-zinc-500">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
    </div>
  )
}

