import { FeatureFlagName } from "./featureFlags"

/**
 * Checks if a feature flag is overridden by environment variables
 *
 * Environment variables should be named: NEXT_PUBLIC_FF_{FLAG_NAME}
 *
 * @param flagName - The feature flag to check
 * @returns The environment override value, or undefined if not set
 *
 * @example
 * ```ts
 * // With NEXT_PUBLIC_FF_ADVANCED_ANALYTICS=true in .env.local
 * getEnvOverride("ADVANCED_ANALYTICS") // returns true
 * ```
 */
export function getEnvOverride(
  flagName: FeatureFlagName
): boolean | undefined {
  const envKey = `NEXT_PUBLIC_FF_${flagName}`
  const envValue = process.env[envKey]

  if (envValue === undefined || envValue === "") {
    return undefined
  }

  return envValue.toLowerCase() === "true"
}

/**
 * Checks if development mode is enabled via environment
 *
 * @returns true if NEXT_PUBLIC_DEV_MODE is set to 'true'
 */
export function isDevMode(): boolean {
  return process.env.NEXT_PUBLIC_DEV_MODE === "true"
}

/**
 * Gets all environment-based feature flag overrides
 *
 * @returns Object containing all feature flag overrides from environment
 */
export function getAllEnvOverrides(): Partial<Record<FeatureFlagName, boolean>> {
  const overrides: Partial<Record<FeatureFlagName, boolean>> = {}

  Object.keys(process.env).forEach((key) => {
    if (key.startsWith("NEXT_PUBLIC_FF_")) {
      const flagName = key.replace("NEXT_PUBLIC_FF_", "") as FeatureFlagName
      const value = getEnvOverride(flagName)
      if (value !== undefined) {
        overrides[flagName] = value
      }
    }
  })

  return overrides
}
