/**
 * User preferences storage
 */

const PREFERENCES_KEY = 'forebearer_preferences';

export interface UserPreferences {
  hapticsEnabled: boolean;
}

const defaultPreferences: UserPreferences = {
  hapticsEnabled: true,
};

export function getPreferences(): UserPreferences {
  try {
    const stored = localStorage.getItem(PREFERENCES_KEY);
    if (!stored) return defaultPreferences;

    return { ...defaultPreferences, ...JSON.parse(stored) };
  } catch {
    return defaultPreferences;
  }
}

export function setPreference<K extends keyof UserPreferences>(
  key: K,
  value: UserPreferences[K]
): void {
  const preferences = getPreferences();
  preferences[key] = value;
  localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
}

export function isHapticsEnabled(): boolean {
  return getPreferences().hapticsEnabled;
}
