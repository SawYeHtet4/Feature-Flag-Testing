/**
 * Feature Flag System - Main Export
 *
 * This module provides a comprehensive feature flag system for Next.js applications
 * with support for role-based access, percentage-based rollouts, and environment overrides.
 */

// Core feature flag functionality
export {
  FEATURE_FLAGS,
  canViewFeature,
  type FeatureFlagName,
} from "./lib/featureFlags"

// React hooks
export { useFeatureFlag, useFeatureFlags } from "./hooks/useFeatureFlag"

// Components
export { FeatureEnabled } from "./components/FeatureEnabled"
export { FeatureToggle } from "./components/FeatureToggle"

// Helper utilities
export {
  getEnabledFeatures,
  getDisabledFeatures,
  getFeatureFlagSummary,
  areAllFeaturesEnabled,
  areAnyFeaturesEnabled,
} from "./lib/featureFlagHelpers"

// Environment overrides
export {
  getEnvOverride,
  isDevMode,
  getAllEnvOverrides,
} from "./lib/envFeatureFlags"

// Debug utilities (development only)
export {
  debugFeatureFlags,
  createDebugPanel,
  getFeatureFlagReason,
} from "./lib/featureFlagDebug"

// User types
export { type User, type UserRole, getUser } from "./lib/getUser"
