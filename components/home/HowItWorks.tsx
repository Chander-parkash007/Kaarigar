export function HowItWorks() {
  const steps = [
    {
      icon: '🔍',
      title: 'Search',
      description: 'Select the service you need and your city. Browse verified local professionals.',
      color: 'bg-blue-50 border-blue-200',
      iconBg: 'bg-blue-100',
    },
    {
      icon: '👤',
      title: 'View Profile',
      description: 'Check ratings, reviews, and work photos. See what real customers are saying.',
      color: 'bg-orange-50 border-orange-200',
      iconBg: 'bg-orange-100',
    },
    {
      icon: '📞',
      title: 'Call & Hire',
      description: 'Call or WhatsApp directly. Agree on price. Pay in cash. No middleman.',
      color: 'bg-green-50 border-green-200',
      iconBg: 'bg-green-100',
    },
  ]

  return (
    <section className="bg-[#F8F9FA] py-16 px-4" aria-label="How it works">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-block bg-[#1B3A6B]/10 text-[#1B3A6B] text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider mb-3">
            Simple Process
          </span>
          <h2 className="text-3xl font-bold text-[#1B3A6B]">How It Works</h2>
          <p className="text-gray-500 mt-2">3 simple steps to hire a professional</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {/* Connecting line on desktop */}
          <div className="hidden md:block absolute top-12 left-[calc(16.66%+2rem)] right-[calc(16.66%+2rem)] h-0.5 bg-gradient-to-r from-blue-200 via-orange-200 to-green-200 z-0" />

          {steps.map((step, i) => (
            <div key={i} className={`relative z-10 rounded-2xl border-2 ${step.color} p-6 text-center shadow-sm hover:shadow-md transition-shadow`}>
              {/* Step number */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white border-2 border-gray-200 text-[#1B3A6B] text-xs font-bold w-7 h-7 rounded-full flex items-center justify-center shadow-sm">
                {i + 1}
              </div>

              <div className={`w-16 h-16 ${step.iconBg} rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 mt-2`}>
                {step.icon}
              </div>
              <h3 className="text-lg font-bold text-[#1B3A6B] mb-2">{step.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12 bg-gradient-to-r from-[#1B3A6B] to-[#0f2240] rounded-2xl p-8 text-white">
          <p className="text-blue-200 text-sm mb-1">Are you a skilled professional?</p>
          <h3 className="text-2xl font-bold mb-4">Join KaariGar — It&apos;s Free!</h3>
          <div className="flex flex-wrap justify-center gap-4 mb-6 text-sm text-blue-200">
            <span>✅ No commission fees</span>
            <span>✅ Direct customer contact</span>
            <span>✅ Free profile forever</span>
          </div>
          <a
            href="/register"
            className="inline-block bg-[#FF6B00] hover:bg-[#e05f00] text-white px-8 py-3 rounded-xl font-bold transition-colors"
          >
            Create Free Profile →
          </a>
        </div>
      </div>
    </section>
  )
}
