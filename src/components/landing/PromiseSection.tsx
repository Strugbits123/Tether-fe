import React from 'react'

export default function PromiseSection() {
  return (
    <section className="bg-[#0B0B1E] text-white py-24 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-3xl mb-12">
          <span className="text-orange-400 text-xs font-bold uppercase tracking-widest">// THE PROMISE</span>
          <h2 className="text-4xl md:text-5xl font-bold mt-4 mb-6">
            The promise <em className="text-violet-400 font-normal not-italic">tether makes</em>
          </h2>
          <p className="text-slate-400 text-lg leading-relaxed mb-4">
            Tether is more than a product. We believe every life has a story — their values, their memories, their documents — and makes it accessible to the right people at the right times, exactly as they intended.
          </p>
          <p className="text-slate-400 text-base leading-relaxed">
            Tether is not just a product. Every person who uses Tether makes a promise — a promise to the people they love.
          </p>
        </div>

        <blockquote className="bg-white/5 border border-white/10 rounded-2xl p-8 max-w-3xl">
          <p className="text-white/90 text-lg italic leading-relaxed">
            &ldquo;Tether is for all those times we take our loved ones for granted. I struggled talking to my friends and family. They will have everything they need, when they need it.&rdquo;
          </p>
          <div className="mt-6 flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center text-sm font-bold text-white">JM</div>
            <div>
              <div className="text-white font-semibold text-sm">John M.</div>
              <div className="text-slate-400 text-xs">Tether member since 2024</div>
            </div>
          </div>
        </blockquote>
      </div>
    </section>
  )
}
