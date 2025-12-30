import { FeatureFlagName, FEATURE_FLAGS } from "@/lib/featureFlags"
import { User, UserRole } from "@/lib/getUser"

/**
 * Extract enabled feature flags for a user
 */
export type EnabledFlags<T extends User> = {
  [K in FeatureFlagName]: boolean
}

/**
 * Type guard for checking if a string is a valid feature flag name
 */
export function isFeatureFlagName(value: string): value is FeatureFlagName {
  return value in FEATURE_FLAGS
}

/**
 * Type for feature flag configuration values
 */
export type FeatureFlagValue = (typeof FEATURE_FLAGS)[FeatureFlagName]

/**
 * Extract only boolean feature flags
 */
export type BooleanFlagNames = {
  [K in FeatureFlagName]: (typeof FEATURE_FLAGS)[K] extends boolean ? K : never
}[FeatureFlagName]

/**
 * Extract only rule-based feature flags
 */
export type RuleBasedFlagNames = {
  [K in FeatureFlagName]: (typeof FEATURE_FLAGS)[K] extends Array<unknown>
    ? K
    : never
}[FeatureFlagName]

/**
 * Type for feature flag check result with metadata
 */
export type FeatureFlagResult<T extends FeatureFlagName = FeatureFlagName> = {
  flag: T
  enabled: boolean
  reason?: string
  user: User
  timestamp: Date
}

/**
 * Utility type for creating feature flag presets
 */
export type FeatureFlagPreset = Partial<Record<FeatureFlagName, boolean>>

/**
 * Type for feature flag overrides
 */
export type FeatureFlagOverrides = {
  [K in FeatureFlagName]?: boolean
}

/**
 * Helper type for requiring specific feature flags
 */
export type RequireFlags<T extends readonly FeatureFlagName[]> = {
  [K in T[number]]: true
}

/**
 * Type for feature flag state snapshot
 */
export type FeatureFlagSnapshot = {
  user: User
  flags: Record<FeatureFlagName, boolean>
  timestamp: Date
}

/**
 * Type for feature flag comparison
 */
export type FeatureFlagComparison = {
  flag: FeatureFlagName
  user1State: boolean
  user2State: boolean
  different: boolean
}

/**
 * Type for role-based feature access
 */
export type RoleFeatureMap = {
  [K in UserRole]: FeatureFlagName[]
}

/**
 * Utility type for extracting flags enabled for specific roles
 */
export type FlagsForRole<R extends UserRole> = FeatureFlagName

/**
 * Type for feature flag audit entry
 */
export type FeatureFlagAuditEntry = {
  id: string
  flag: FeatureFlagName
  user: User
  action: "check" | "enable" | "disable" | "toggle"
  oldValue?: boolean
  newValue: boolean
  timestamp: Date
  metadata?: Record<string, unknown>
}

/**
 * Type for feature flag batch operation
 */
export type FeatureFlagBatchOperation = {
  flags: FeatureFlagName[]
  operation: "enable" | "disable" | "check"
  user: User
  results: Map<FeatureFlagName, boolean>
}

/**
 * Utility type for safe feature flag access
 */
export type SafeFeatureFlags = {
  [K in FeatureFlagName]: () => boolean
}

/**
 * Type for feature flag dependency graph
 */
export type FeatureFlagDependency = {
  flag: FeatureFlagName
  dependsOn: FeatureFlagName[]
  requiredFor: FeatureFlagName[]
}

/**
 * Helper function to create a type-safe feature flag preset
 */
export function createFeatureFlagPreset<T extends FeatureFlagPreset>(
  preset: T
): T {
  return preset
}

/**
 * Helper function to create a type-safe feature flag override
 */
export function createFeatureFlagOverride<T extends FeatureFlagOverrides>(
  overrides: T
): T {
  return overrides
}

/**
 * Type predicate for checking user roles
 */
export function hasRole<R extends UserRole>(
  user: User,
  role: R
): user is User & { role: R } {
  return user.role === role
}

/**
 * Type for feature flag evaluation context
 */
export type FeatureFlagContext = {
  user: User
  timestamp: Date
  environment: string
  metadata?: Record<string, unknown>
}

/**
 * Type for feature flag evaluation result with context
 */
export type FeatureFlagEvaluationResult = {
  flag: FeatureFlagName
  enabled: boolean
  context: FeatureFlagContext
  evaluationTimeMs: number
}
