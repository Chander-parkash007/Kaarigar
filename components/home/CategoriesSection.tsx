'use client'
import { useRouter } from 'next/navigation'
import { CATEGORIES } from '@/lib/constants'

const CATEGORY_COLORS = [
  'from-blue-500 to-blue-600',
  'from-yellow-400 to-orange-500',
  'from-amber-600 to-yellow-700',
  'from-green-500 to-emerald-600',
  'from-cyan-500 to-teal-600',
  'from-sky-400 to-blue-500',
  'from-pink-500 to-rose-600',
  'from-purple-500 to-violet-600',
  'from-slate-500 to-gray-600',
  'from-fuchsia-500 to-pink-600',
]

export function CategoriesSection() {
  const router = useRouter()

  return (
    <section className="py-16 px-4 bg-white" aria-label="Service categories">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <span className="inline-block bg-[#FF6B00]/10 text-[#FF6B00] text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider mb-3">
            Services
          </span>
          <h2 className="text-3xl font-bold text-[#1B3A6B]">Browse by Category</h2>
          <p className="text-gray-500 mt-2">Find the right professional for every job</p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {CATEGORIES.map((cat, i) => (
            <button
              key={cat.value}
              onClick={() => router.push(`/search?category=${cat.value}`)}
              className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer text-left"
              aria-label={`Search for ${cat.label}`}
            >
              {/* Gradient top bar */}
              <div className={`h-1.5 w-full bg-gradient-to-r ${CATEGORY_COLORS[i]}`} />

              <div className="p-5 flex flex-col items-center text-center gap-2">
                {/* Icon bubble */}
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${CATEGORY_COLORS[i]} flex items-center justify-center text-2xl shadow-md group-hover:scale-110 transition-transform duration-300`}>
                  {cat.icon}
                </div>

                <div>
                  <p className="font-semibold text-[#1B3A6B] text-sm leading-tight">{cat.label}</p>
                  <p className="text-gray-400 text-xs mt-0.5" dir="rtl" lang="ur">{cat.urdu}</p>
                </div>

                {/* Hover arrow */}
                <span className="text-xs text-[#FF6B00] font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  Browse →
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-10">
          <button
            onClick={() => router.push('/search')}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#1B3A6B] border-2 border-[#1B3A6B] px-6 py-2.5 rounded-xl hover:bg-[#1B3A6B] hover:text-white transition-colors"
          >
            View All Workers →
          </button>
        </div>
      </div>
    </section>
  )
}
