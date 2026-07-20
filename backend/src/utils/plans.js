const PLANS = {
  free: {
    maxInboxesPerMonth: 100,
    maxApiKeys: 1,
    messageRetentionHours: 24,
    webhooks: false,
  },
  pro: {
    maxInboxesPerMonth: 5000,
    maxApiKeys: 5,
    messageRetentionHours: 168,
    webhooks: true,
  },
  team: {
    maxInboxesPerMonth: 50000,
    maxApiKeys: -1,
    messageRetentionHours: 720,
    webhooks: true,
  },
};

function getPlanLimits(plan) {
  return PLANS[plan] || PLANS.free;
}

module.exports = { getPlanLimits, PLANS };
