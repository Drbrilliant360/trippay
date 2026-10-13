/**
 * Feature flags for approval-gated features. When off, the feature is shown
 * with a ComingSoonBadge and an explanation — never as a working feature.
 */
export const flags = {
  travelFinancing: false,
  crypto: false,
  p2pTransfers: false,
  currencyExchangeExecution: false,
  currencyAlerts: true,
  savingsPlanner: true,
  aiAssistant: true,
} as const;

export type FeatureFlag = keyof typeof flags;

export function isEnabled(flag: FeatureFlag): boolean {
  return flags[flag];
}
