import Link from 'next/link';

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'For personal projects and getting started',
    features: [
      '100 inboxes/month',
      '1 API key',
      '24h message retention',
      'Auto OTP parsing',
      'Long polling',
    ],
    cta: 'Get Started',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '$9',
    period: '/month',
    description: 'For professional QA engineers and teams',
    features: [
      '5,000 inboxes/month',
      '5 API keys',
      '7 days message retention',
      'Webhooks',
      'Priority support',
      'Custom inbox prefix',
    ],
    cta: 'Start Pro Trial',
    highlighted: true,
  },
  {
    name: 'Team',
    price: '$29',
    period: '/month',
    description: 'For QA teams and CI/CD pipelines at scale',
    features: [
      '50,000 inboxes/month',
      'Unlimited API keys',
      '30 days message retention',
      'Webhooks',
      'Priority support',
      'Custom domain',
      'Team management',
    ],
    cta: 'Contact Us',
    highlighted: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-lg text-slate-600">
            Start free. Upgrade when you need more.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-xl p-8 ${
                plan.highlighted
                  ? 'bg-white shadow-xl border-2 border-brand-500 scale-105'
                  : 'bg-white shadow-sm border border-slate-200'
              }`}
            >
              {plan.highlighted && (
                <div className="text-brand-600 text-sm font-semibold mb-2">Most Popular</div>
              )}
              <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
              <div className="mt-4 mb-2">
                <span className="text-4xl font-bold text-slate-900">{plan.price}</span>
                <span className="text-slate-500 ml-1">{plan.period}</span>
              </div>
              <p className="text-slate-600 mb-6">{plan.description}</p>

              <Link
                href="/auth/register"
                className={`block w-full text-center py-3 rounded-lg font-semibold transition ${
                  plan.highlighted
                    ? 'bg-brand-600 text-white hover:bg-brand-700'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {plan.cta}
              </Link>

              <ul className="mt-8 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-slate-600">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
