"use client"

import { FeatureFlagName } from "@/lib/featureFlags"
import { useFeatureFlag } from "@/hooks/useFeatureFlag"
import { ReactNode } from "react"

interface FeatureToggleProps {
  featureFlag: FeatureFlagName
  whenEnabled: ReactNode
  whenDisabled: ReactNode
}

/**
 * Component that renders different content based on feature flag status
 * This is a client-side component that uses hooks for dynamic rendering
 *
 * @param featureFlag - The feature flag to check
 * @param whenEnabled - Content to render when feature is enabled
 * @param whenDisabled - Content to render when feature is disabled
 *
 * @example
 * ```tsx
 * <FeatureToggle
 *   featureFlag="ADVANCED_ANALYTICS"
 *   whenEnabled={<NewAnalyticsDashboard />}
 *   whenDisabled={<BasicDashboard />}
 * />
 * ```
 */
export function FeatureToggle({
  featureFlag,
  whenEnabled,
  whenDisabled,
}: FeatureToggleProps) {
  const isEnabled = useFeatureFlag(featureFlag)

  return <>{isEnabled ? whenEnabled : whenDisabled}</>
}
