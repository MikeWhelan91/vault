/**
 * Pricing tiers and feature limits for Forebearer
 */

export type TierName = 'free' | 'plus_monthly' | 'plus_annual' | 'plus_lifetime';

export interface TierLimits {
  name: string;
  displayName: string;
  billingCycle: 'free' | 'monthly' | 'annual' | 'lifetime';
  price: {
    amount: number;
    display: string;
  };
  storage: {
    bytes: number;
    display: string;
  };
  bundles: {
    max: number | null; // null = unlimited
    display: string;
  };
  trustees: {
    maxPerBundle: number | null; // null = unlimited
    display: string;
  };
  heartbeat: {
    minIntervalDays: number; // Minimum days between check-ins
    customSchedules: boolean;
    display: string;
  };
  videos: {
    max: number | null; // null = unlimited
    display: string;
  };
  releaseWindow: {
    maxYears: number | null; // null = unlimited
    display: string;
  };
  retention: {
    vaultInactivityYears: number; // Years of inactivity before orphaned items deleted
    postReleaseDays: number; // Days after bundle release before deletion
    display: string;
  };
  features: {
    analytics: boolean;
    prioritySupport: boolean;
    multipleCheckInMethods: boolean;
    bulkUpload: boolean;
    conditionalReleases: boolean;
    letterScheduler: boolean;
  };
}

export const TIER_LIMITS: Record<TierName, TierLimits> = {
  free: {
    name: 'free',
    displayName: 'Free',
    billingCycle: 'free',
    price: {
      amount: 0,
      display: '$0',
    },
    storage: {
      bytes: 300 * 1024 * 1024, // 300 MB
      display: '300 MB',
    },
    bundles: {
      max: 1,
      display: '1 active bundle',
    },
    trustees: {
      maxPerBundle: 10,
      display: 'Up to 10 trustees per bundle',
    },
    heartbeat: {
      minIntervalDays: 30, // Monthly only
      customSchedules: false,
      display: 'Monthly check-ins only',
    },
    videos: {
      max: 1,
      display: '1 video only',
    },
    releaseWindow: {
      maxYears: 1,
      display: 'Up to 1 year',
    },
    retention: {
      vaultInactivityYears: 2,
      postReleaseDays: 30,
      display: 'Items not in bundles deleted after 2 years of inactivity. Released bundles available for 30 days.',
    },
    features: {
      analytics: false,
      prioritySupport: false,
      multipleCheckInMethods: false,
      bulkUpload: false,
      conditionalReleases: false,
      letterScheduler: false,
    },
  },
  plus_monthly: {
    name: 'plus_monthly',
    displayName: 'Plus Monthly',
    billingCycle: 'monthly',
    price: {
      amount: 12.99,
      display: '$12.99/month',
    },
    storage: {
      bytes: 5 * 1024 * 1024 * 1024, // 5 GB
      display: '5 GB',
    },
    bundles: {
      max: null, // Unlimited
      display: 'Unlimited bundles',
    },
    trustees: {
      maxPerBundle: null, // Unlimited
      display: 'Unlimited trustees',
    },
    heartbeat: {
      minIntervalDays: 7, // Can do weekly
      customSchedules: true,
      display: 'Custom schedules (weekly, bi-weekly, custom)',
    },
    videos: {
      max: null, // Unlimited
      display: 'Unlimited videos',
    },
    releaseWindow: {
      maxYears: 5,
      display: 'Up to 5 years',
    },
    retention: {
      vaultInactivityYears: 2,
      postReleaseDays: 90,
      display: 'Items not in bundles deleted after 2 years of inactivity. Released bundles available for 90 days.',
    },
    features: {
      analytics: true,
      prioritySupport: true,
      multipleCheckInMethods: true,
      bulkUpload: true,
      conditionalReleases: true,
      letterScheduler: true,
    },
  },
  plus_annual: {
    name: 'plus_annual',
    displayName: 'Plus Annual',
    billingCycle: 'annual',
    price: {
      amount: 89,
      display: '$89/year (Save 43%)',
    },
    storage: {
      bytes: 5 * 1024 * 1024 * 1024, // 5 GB
      display: '5 GB',
    },
    bundles: {
      max: null, // Unlimited
      display: 'Unlimited bundles',
    },
    trustees: {
      maxPerBundle: null, // Unlimited
      display: 'Unlimited trustees',
    },
    heartbeat: {
      minIntervalDays: 7, // Can do weekly
      customSchedules: true,
      display: 'Custom schedules (weekly, bi-weekly, custom)',
    },
    videos: {
      max: null, // Unlimited
      display: 'Unlimited videos',
    },
    releaseWindow: {
      maxYears: 10,
      display: 'Up to 10 years',
    },
    retention: {
      vaultInactivityYears: 2,
      postReleaseDays: 90,
      display: 'Items not in bundles deleted after 2 years of inactivity. Released bundles available for 90 days.',
    },
    features: {
      analytics: true,
      prioritySupport: true,
      multipleCheckInMethods: true,
      bulkUpload: true,
      conditionalReleases: true,
      letterScheduler: true,
    },
  },
  plus_lifetime: {
    name: 'plus_lifetime',
    displayName: 'Plus Lifetime',
    billingCycle: 'lifetime',
    price: {
      amount: 299,
      display: '$299 one-time (Best Value)',
    },
    storage: {
      bytes: 10 * 1024 * 1024 * 1024, // 10 GB
      display: '10 GB',
    },
    bundles: {
      max: null, // Unlimited
      display: 'Unlimited bundles',
    },
    trustees: {
      maxPerBundle: null, // Unlimited
      display: 'Unlimited trustees',
    },
    heartbeat: {
      minIntervalDays: 7, // Can do weekly
      customSchedules: true,
      display: 'Custom schedules (weekly, bi-weekly, custom)',
    },
    videos: {
      max: null, // Unlimited
      display: 'Unlimited videos',
    },
    releaseWindow: {
      maxYears: null, // Unlimited - 15+ years
      display: 'Unlimited (15+ years)',
    },
    retention: {
      vaultInactivityYears: 2,
      postReleaseDays: 180,
      display: 'Items not in bundles deleted after 2 years of inactivity. Released bundles available for 6 months.',
    },
    features: {
      analytics: true,
      prioritySupport: true,
      multipleCheckInMethods: true,
      bulkUpload: true,
      conditionalReleases: true,
      letterScheduler: true,
    },
  },
};

/**
 * Helper functions for tier checking
 */

export function getTierLimits(tier: TierName): TierLimits {
  return TIER_LIMITS[tier];
}

export function canCreateBundle(tier: TierName, currentBundleCount: number): boolean {
  const limits = getTierLimits(tier);
  if (limits.bundles.max === null) return true; // Unlimited
  return currentBundleCount < limits.bundles.max;
}

export function canAddTrustee(tier: TierName, currentTrusteeCount: number): boolean {
  const limits = getTierLimits(tier);
  if (limits.trustees.maxPerBundle === null) return true; // Unlimited
  return currentTrusteeCount < limits.trustees.maxPerBundle;
}

export function hasStorageSpace(tier: TierName, currentUsage: number, additionalBytes: number): boolean {
  const limits = getTierLimits(tier);
  return (currentUsage + additionalBytes) <= limits.storage.bytes;
}

export function canUseHeartbeatInterval(tier: TierName, intervalDays: number): boolean {
  const limits = getTierLimits(tier);
  return intervalDays >= limits.heartbeat.minIntervalDays;
}

export function hasFeature(tier: TierName, feature: keyof TierLimits['features']): boolean {
  const limits = getTierLimits(tier);
  return limits.features[feature];
}

export function canUploadVideo(tier: TierName, currentVideoCount: number): boolean {
  const limits = getTierLimits(tier);
  if (limits.videos.max === null) return true; // Unlimited
  return currentVideoCount < limits.videos.max;
}

export function canSetReleaseDate(tier: TierName, yearsFromNow: number): boolean {
  const limits = getTierLimits(tier);
  if (limits.releaseWindow.maxYears === null) return true; // Unlimited
  return yearsFromNow <= limits.releaseWindow.maxYears;
}

export function getMaxReleaseYears(tier: TierName): number | null {
  const limits = getTierLimits(tier);
  return limits.releaseWindow.maxYears;
}

export function getRetentionPolicies(tier: TierName) {
  const limits = getTierLimits(tier);
  return limits.retention;
}

export function isPaidTier(tier: TierName): boolean {
  return tier !== 'free';
}

/**
 * Upgrade prompts and messaging
 */

export const UPGRADE_MESSAGES = {
  bundle_limit: {
    title: 'Upgrade to Create More Bundles',
    message: 'Free tier allows 1 active release bundle. Upgrade to Plus for unlimited bundles to organize memories for different groups of loved ones.',
    cta: 'Upgrade to Plus',
  },
  trustee_limit: {
    title: 'Upgrade for More Trustees',
    message: 'Free tier allows up to 10 trustees per bundle. Upgrade to Plus for unlimited trustees.',
    cta: 'Upgrade to Plus',
  },
  storage_limit: {
    title: 'Upgrade for More Storage',
    message: 'You\'ve reached your 300 MB storage limit. Upgrade to Plus for 5 GB (or 10 GB with Lifetime).',
    cta: 'Upgrade to Plus',
  },
  heartbeat_schedule: {
    title: 'Upgrade for Custom Schedules',
    message: 'Free tier supports monthly check-ins only. Upgrade to Plus for weekly, bi-weekly, or custom schedules.',
    cta: 'Upgrade to Plus',
  },
  analytics: {
    title: 'Upgrade to See Analytics',
    message: 'See when trustees open your releases with Plus tier analytics.',
    cta: 'Upgrade to Plus',
  },
  video_limit: {
    title: 'Upgrade for Unlimited Videos',
    message: 'Free tier allows 1 video only. Upgrade to Plus for unlimited video uploads.',
    cta: 'Upgrade to Plus',
  },
  release_window_limit: {
    title: 'Upgrade for Longer Release Windows',
    message: 'Your tier limits release dates. Upgrade to extend your release window or choose Lifetime for unlimited timeframes.',
    cta: 'Upgrade to Plus',
  },
};
