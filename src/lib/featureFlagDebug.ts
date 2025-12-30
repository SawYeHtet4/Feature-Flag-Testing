import { FEATURE_FLAGS, FeatureFlagName } from "./featureFlags"
import { User } from "./getUser"
import { getFeatureFlagSummary } from "./featureFlagHelpers"

/**
 * Logs all feature flags and their status for a user to the console
 * Only logs in development mode
 *
 * @param user - The user to check flags for
 */
export function debugFeatureFlags(user: User): void {
  if (process.env.NODE_ENV !== "development") {
    return
  }

  const summary = getFeatureFlagSummary(user)

  console.group("🚩 Feature Flags Debug")
  console.log("User:", user)
  console.table(summary)
  console.groupEnd()
}

/**
 * Creates a debug panel with feature flag information
 * Useful for development and testing
 *
 * @param user - The user to display flags for
 * @returns HTML string with feature flag debug information
 */
export function createDebugPanel(user: User): string {
  const summary = getFeatureFlagSummary(user)

  const rows = Object.entries(summary)
    .map(
      ([flag, enabled]) => `
    <tr>
      <td style="padding: 8px; border: 1px solid #ddd;">${flag}</td>
      <td style="padding: 8px; border: 1px solid #ddd; color: ${enabled ? "green" : "red"};">
        ${enabled ? "✓ Enabled" : "✗ Disabled"}
      </td>
    </tr>
  `
    )
    .join("")

  return `
    <div style="
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: white;
      border: 2px solid #333;
      border-radius: 8px;
      padding: 16px;
      max-width: 400px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      font-family: monospace;
      z-index: 9999;
    ">
      <h3 style="margin-top: 0;">Feature Flags Debug</h3>
      <p>User: ${user.id} (${user.role})</p>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr>
            <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Flag</th>
            <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Status</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>
  `
}

/**
 * Gets detailed information about why a feature flag has a particular value
 *
 * @param flagName - The feature flag to analyze
 * @param user - The user to check for
 * @returns Debug information string
 */
export function getFeatureFlagReason(
  flagName: FeatureFlagName,
  user: User
): string {
  const flag = FEATURE_FLAGS[flagName]

  if (typeof flag === "boolean") {
    return `Static value: ${flag}`
  }

  const reasons: string[] = []

  flag.forEach((rule, index) => {
    const parts: string[] = []

    if (rule.userRoles) {
      const hasRole = rule.userRoles.includes(user.role)
      parts.push(
        `Role check: ${user.role} ${hasRole ? "✓ in" : "✗ not in"} [${rule.userRoles.join(", ")}]`
      )
    }

    if (rule.percentageOfUsers) {
      parts.push(`Percentage: ${rule.percentageOfUsers * 100}% of users`)
    }

    reasons.push(`Rule ${index + 1}: ${parts.join(", ")}`)
  })

  return reasons.join("\n")
}
