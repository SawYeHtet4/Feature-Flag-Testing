import { FEATURE_FLAGS, FeatureFlagName } from "./featureFlags"
import { User } from "./getUser"
import { getFeatureFlagSummary } from "./featureFlagHelpers"

/**
 * Export format types
 */
export type ExportFormat = "json" | "yaml" | "env" | "typescript" | "markdown"

/**
 * Export options
 */
export interface ExportOptions {
  format: ExportFormat
  includeMetadata?: boolean
  includeTimestamp?: boolean
  includeUserContext?: boolean
  prettyPrint?: boolean
}

/**
 * Export feature flags configuration as JSON
 */
export function exportAsJSON(options?: {
  prettyPrint?: boolean
  includeMetadata?: boolean
}): string {
  const data = {
    ...(options?.includeMetadata && {
      metadata: {
        version: "1.0.0",
        exportedAt: new Date().toISOString(),
        totalFlags: Object.keys(FEATURE_FLAGS).length,
      },
    }),
    flags: FEATURE_FLAGS,
  }

  return options?.prettyPrint
    ? JSON.stringify(data, null, 2)
    : JSON.stringify(data)
}

/**
 * Export feature flags as YAML format
 */
export function exportAsYAML(): string {
  let yaml = "# Feature Flags Configuration\n"
  yaml += `# Generated at: ${new Date().toISOString()}\n\n`
  yaml += "feature_flags:\n"

  Object.entries(FEATURE_FLAGS).forEach(([key, value]) => {
    yaml += `  ${key}:\n`

    if (typeof value === "boolean") {
      yaml += `    enabled: ${value}\n`
      yaml += `    type: boolean\n`
    } else {
      yaml += `    type: rule-based\n`
      yaml += `    rules:\n`
      value.forEach((rule, index) => {
        yaml += `      - rule_${index + 1}:\n`
        if (rule.userRoles) {
          yaml += `          user_roles: [${rule.userRoles.join(", ")}]\n`
        }
        if (rule.percentageOfUsers !== undefined) {
          yaml += `          percentage: ${rule.percentageOfUsers * 100}%\n`
        }
      })
    }
    yaml += "\n"
  })

  return yaml
}

/**
 * Export feature flags as environment variables
 */
export function exportAsEnv(): string {
  let env = "# Feature Flags Environment Variables\n"
  env += `# Generated at: ${new Date().toISOString()}\n\n`

  Object.entries(FEATURE_FLAGS).forEach(([key, value]) => {
    if (typeof value === "boolean") {
      env += `NEXT_PUBLIC_FF_${key}=${value}\n`
    } else {
      env += `# ${key} is rule-based and cannot be represented as a simple env var\n`
      env += `# NEXT_PUBLIC_FF_${key}=\n`
    }
  })

  return env
}

/**
 * Export feature flags as TypeScript code
 */
export function exportAsTypeScript(): string {
  let ts = "// Feature Flags Configuration\n"
  ts += `// Generated at: ${new Date().toISOString()}\n\n`
  ts += 'import type { UserRole } from "./getUser"\n\n'

  ts += "export const FEATURE_FLAGS = {\n"

  Object.entries(FEATURE_FLAGS).forEach(([key, value], index, array) => {
    if (typeof value === "boolean") {
      ts += `  ${key}: ${value}`
    } else {
      ts += `  ${key}: [\n`
      value.forEach((rule, ruleIndex) => {
        ts += `    {\n`
        if (rule.userRoles) {
          ts += `      userRoles: [${rule.userRoles.map((r) => `"${r}"`).join(", ")}] as UserRole[],\n`
        }
        if (rule.percentageOfUsers !== undefined) {
          ts += `      percentageOfUsers: ${rule.percentageOfUsers},\n`
        }
        ts += `    }${ruleIndex < value.length - 1 ? "," : ""}\n`
      })
      ts += `  ]`
    }

    ts += `${index < array.length - 1 ? "," : ""}\n`
  })

  ts += "} as const\n"

  return ts
}

/**
 * Export feature flags as Markdown documentation
 */
export function exportAsMarkdown(): string {
  let md = "# Feature Flags Documentation\n\n"
  md += `*Generated at: ${new Date().toISOString()}*\n\n`
  md += `**Total Flags:** ${Object.keys(FEATURE_FLAGS).length}\n\n`

  md += "## Overview\n\n"
  md += "| Flag Name | Type | Default State |\n"
  md += "|-----------|------|---------------|\n"

  Object.entries(FEATURE_FLAGS).forEach(([key, value]) => {
    const type = typeof value === "boolean" ? "Boolean" : "Rule-based"
    const state = typeof value === "boolean" ? (value ? "✓ Enabled" : "✗ Disabled") : "Conditional"
    md += `| ${key} | ${type} | ${state} |\n`
  })

  md += "\n## Detailed Configuration\n\n"

  Object.entries(FEATURE_FLAGS).forEach(([key, value]) => {
    md += `### ${key}\n\n`

    if (typeof value === "boolean") {
      md += `- **Type:** Boolean\n`
      md += `- **Default:** ${value ? "Enabled" : "Disabled"}\n`
    } else {
      md += `- **Type:** Rule-based\n`
      md += `- **Rules:**\n\n`

      value.forEach((rule, index) => {
        md += `  ${index + 1}. `
        const parts: string[] = []

        if (rule.userRoles) {
          parts.push(`Roles: ${rule.userRoles.join(", ")}`)
        }
        if (rule.percentageOfUsers !== undefined) {
          parts.push(`${(rule.percentageOfUsers * 100).toFixed(0)}% of users`)
        }

        md += parts.join(" + ") + "\n"
      })
    }

    md += "\n"
  })

  return md
}

/**
 * Export user-specific feature flag state
 */
export function exportUserState(
  user: User,
  format: ExportFormat = "json"
): string {
  const summary = getFeatureFlagSummary(user)

  const data = {
    user: {
      id: user.id,
      role: user.role,
    },
    timestamp: new Date().toISOString(),
    flags: summary,
    enabled: Object.entries(summary)
      .filter(([_, enabled]) => enabled)
      .map(([flag]) => flag),
    disabled: Object.entries(summary)
      .filter(([_, enabled]) => !enabled)
      .map(([flag]) => flag),
  }

  switch (format) {
    case "json":
      return JSON.stringify(data, null, 2)

    case "yaml": {
      let yaml = `user:\n`
      yaml += `  id: ${data.user.id}\n`
      yaml += `  role: ${data.user.role}\n\n`
      yaml += `timestamp: ${data.timestamp}\n\n`
      yaml += `enabled_flags:\n`
      data.enabled.forEach((flag) => {
        yaml += `  - ${flag}\n`
      })
      yaml += `\ndisabled_flags:\n`
      data.disabled.forEach((flag) => {
        yaml += `  - ${flag}\n`
      })
      return yaml
    }

    case "markdown": {
      let md = `# Feature Flags for User: ${data.user.id}\n\n`
      md += `**Role:** ${data.user.role}\n`
      md += `**Timestamp:** ${data.timestamp}\n\n`
      md += `## Enabled Flags (${data.enabled.length})\n\n`
      data.enabled.forEach((flag) => {
        md += `- ✓ ${flag}\n`
      })
      md += `\n## Disabled Flags (${data.disabled.length})\n\n`
      data.disabled.forEach((flag) => {
        md += `- ✗ ${flag}\n`
      })
      return md
    }

    case "env": {
      let env = `# Feature Flags for User: ${data.user.id}\n\n`
      Object.entries(data.flags).forEach(([flag, enabled]) => {
        env += `NEXT_PUBLIC_FF_${flag}=${enabled}\n`
      })
      return env
    }

    default:
      return JSON.stringify(data, null, 2)
  }
}

/**
 * Export feature flags in specified format
 */
export function exportFeatureFlags(options: ExportOptions): string {
  switch (options.format) {
    case "json":
      return exportAsJSON({
        prettyPrint: options.prettyPrint,
        includeMetadata: options.includeMetadata,
      })
    case "yaml":
      return exportAsYAML()
    case "env":
      return exportAsEnv()
    case "typescript":
      return exportAsTypeScript()
    case "markdown":
      return exportAsMarkdown()
    default:
      throw new Error(`Unsupported format: ${options.format}`)
  }
}

/**
 * Import feature flags from JSON
 */
export function importFromJSON(json: string): Record<string, unknown> {
  try {
    const data = JSON.parse(json)
    return data.flags || data
  } catch (error) {
    throw new Error(`Failed to parse JSON: ${error}`)
  }
}

/**
 * Validate imported feature flags
 */
export function validateImport(data: unknown): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (typeof data !== "object" || data === null) {
    errors.push("Data must be an object")
    return { valid: false, errors }
  }

  Object.entries(data).forEach(([key, value]) => {
    if (typeof value !== "boolean" && !Array.isArray(value)) {
      errors.push(`Invalid value for ${key}: must be boolean or array`)
    }

    if (Array.isArray(value)) {
      value.forEach((rule, index) => {
        if (typeof rule !== "object" || rule === null) {
          errors.push(`Invalid rule at ${key}[${index}]: must be object`)
        }
      })
    }
  })

  return {
    valid: errors.length === 0,
    errors,
  }
}
