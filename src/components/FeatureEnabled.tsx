import { canViewFeature, FeatureFlagName } from "@/lib/featureFlags"
import { getUser } from "@/lib/getUser"
import { ReactNode } from "react"

interface FeatureEnabledProps {
  featureFlag: FeatureFlagName
  children: ReactNode
  fallback?: ReactNode
  invert?: boolean
}

/**
 * Conditionally renders children based on feature flag status
 *
 * @param featureFlag - The feature flag to check
 * @param children - Content to render when feature is enabled
 * @param fallback - Optional content to render when feature is disabled
 * @param invert - If true, renders children when feature is disabled
 *
 * @example
 * ```tsx
 * <FeatureEnabled featureFlag="ADVANCED_ANALYTICS">
 *   <AdvancedDashboard />
 * </FeatureEnabled>
 * ```
 *
 * @example With fallback
 * ```tsx
 * <FeatureEnabled
 *   featureFlag="EXPERIMENTAL_FEATURE"
 *   fallback={<ComingSoonBanner />}
 * >
 *   <NewFeature />
 * </FeatureEnabled>
 * ```
 */
export function FeatureEnabled({
  featureFlag,
  children,
  fallback = null,
  invert = false,
}: FeatureEnabledProps) {
  const user = getUser()
  const isEnabled = canViewFeature(featureFlag, user)
  const shouldRender = invert ? !isEnabled : isEnabled

  return shouldRender ? <>{children}</> : <>{fallback}</>
}
