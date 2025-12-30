import { FeatureFlagName } from "./featureFlags"
import { User } from "./getUser"
import { FeatureFlagAuditEntry } from "@/types/featureFlagTypes"

/**
 * Audit logger for feature flag operations
 */
class FeatureFlagAuditLogger {
  private entries: FeatureFlagAuditEntry[] = []
  private readonly maxEntries: number = 10000
  private enabled: boolean = true

  /**
   * Enable or disable audit logging
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled
  }

  /**
   * Check if audit logging is enabled
   */
  isEnabled(): boolean {
    return this.enabled
  }

  /**
   * Log a feature flag check
   */
  logCheck(
    flag: FeatureFlagName,
    user: User,
    result: boolean,
    metadata?: Record<string, unknown>
  ): void {
    if (!this.enabled) return

    const entry: FeatureFlagAuditEntry = {
      id: this.generateId(),
      flag,
      user,
      action: "check",
      newValue: result,
      timestamp: new Date(),
      metadata,
    }

    this.addEntry(entry)
  }

  /**
   * Log a feature flag state change
   */
  logStateChange(
    flag: FeatureFlagName,
    user: User,
    oldValue: boolean,
    newValue: boolean,
    metadata?: Record<string, unknown>
  ): void {
    if (!this.enabled) return

    const entry: FeatureFlagAuditEntry = {
      id: this.generateId(),
      flag,
      user,
      action: oldValue === newValue ? "check" : "toggle",
      oldValue,
      newValue,
      timestamp: new Date(),
      metadata,
    }

    this.addEntry(entry)
  }

  /**
   * Log a feature flag enable operation
   */
  logEnable(
    flag: FeatureFlagName,
    user: User,
    metadata?: Record<string, unknown>
  ): void {
    if (!this.enabled) return

    const entry: FeatureFlagAuditEntry = {
      id: this.generateId(),
      flag,
      user,
      action: "enable",
      newValue: true,
      timestamp: new Date(),
      metadata,
    }

    this.addEntry(entry)
  }

  /**
   * Log a feature flag disable operation
   */
  logDisable(
    flag: FeatureFlagName,
    user: User,
    metadata?: Record<string, unknown>
  ): void {
    if (!this.enabled) return

    const entry: FeatureFlagAuditEntry = {
      id: this.generateId(),
      flag,
      user,
      action: "disable",
      newValue: false,
      timestamp: new Date(),
      metadata,
    }

    this.addEntry(entry)
  }

  /**
   * Get all audit entries
   */
  getEntries(): FeatureFlagAuditEntry[] {
    return [...this.entries]
  }

  /**
   * Get entries for a specific flag
   */
  getEntriesByFlag(flag: FeatureFlagName): FeatureFlagAuditEntry[] {
    return this.entries.filter((entry) => entry.flag === flag)
  }

  /**
   * Get entries for a specific user
   */
  getEntriesByUser(userId: string): FeatureFlagAuditEntry[] {
    return this.entries.filter((entry) => entry.user.id === userId)
  }

  /**
   * Get entries within a time range
   */
  getEntriesByTimeRange(start: Date, end: Date): FeatureFlagAuditEntry[] {
    return this.entries.filter(
      (entry) => entry.timestamp >= start && entry.timestamp <= end
    )
  }

  /**
   * Get entries by action type
   */
  getEntriesByAction(
    action: FeatureFlagAuditEntry["action"]
  ): FeatureFlagAuditEntry[] {
    return this.entries.filter((entry) => entry.action === action)
  }

  /**
   * Get recent entries
   */
  getRecentEntries(count: number = 100): FeatureFlagAuditEntry[] {
    return this.entries.slice(-count)
  }

  /**
   * Export audit log as JSON
   */
  exportAsJSON(): string {
    return JSON.stringify(this.entries, null, 2)
  }

  /**
   * Export audit log as CSV
   */
  exportAsCSV(): string {
    if (this.entries.length === 0) return ""

    const headers = ["ID", "Flag", "User ID", "Role", "Action", "Old Value", "New Value", "Timestamp"]
    const rows = this.entries.map((entry) => [
      entry.id,
      entry.flag,
      entry.user.id,
      entry.user.role,
      entry.action,
      entry.oldValue ?? "",
      entry.newValue,
      entry.timestamp.toISOString(),
    ])

    return [headers, ...rows].map((row) => row.join(",")).join("\n")
  }

  /**
   * Clear all audit entries
   */
  clear(): void {
    this.entries = []
  }

  /**
   * Get audit statistics
   */
  getStats(): {
    totalEntries: number
    entriesByAction: Record<string, number>
    entriesByFlag: Record<string, number>
    uniqueUsers: number
    dateRange: { start: Date | null; end: Date | null }
  } {
    const entriesByAction: Record<string, number> = {}
    const entriesByFlag: Record<string, number> = {}
    const uniqueUsers = new Set<string>()

    this.entries.forEach((entry) => {
      entriesByAction[entry.action] = (entriesByAction[entry.action] || 0) + 1
      entriesByFlag[entry.flag] = (entriesByFlag[entry.flag] || 0) + 1
      uniqueUsers.add(entry.user.id)
    })

    const dates = this.entries.map((e) => e.timestamp)
    const start = dates.length > 0 ? new Date(Math.min(...dates.map((d) => d.getTime()))) : null
    const end = dates.length > 0 ? new Date(Math.max(...dates.map((d) => d.getTime()))) : null

    return {
      totalEntries: this.entries.length,
      entriesByAction,
      entriesByFlag,
      uniqueUsers: uniqueUsers.size,
      dateRange: { start, end },
    }
  }

  /**
   * Search audit log
   */
  search(query: {
    flag?: FeatureFlagName
    userId?: string
    action?: FeatureFlagAuditEntry["action"]
    startDate?: Date
    endDate?: Date
  }): FeatureFlagAuditEntry[] {
    let results = this.entries

    if (query.flag) {
      results = results.filter((entry) => entry.flag === query.flag)
    }

    if (query.userId) {
      results = results.filter((entry) => entry.user.id === query.userId)
    }

    if (query.action) {
      results = results.filter((entry) => entry.action === query.action)
    }

    if (query.startDate) {
      results = results.filter((entry) => entry.timestamp >= query.startDate!)
    }

    if (query.endDate) {
      results = results.filter((entry) => entry.timestamp <= query.endDate!)
    }

    return results
  }

  /**
   * Add an entry to the log
   */
  private addEntry(entry: FeatureFlagAuditEntry): void {
    this.entries.push(entry)

    // Keep only last N entries
    if (this.entries.length > this.maxEntries) {
      this.entries = this.entries.slice(-this.maxEntries)
    }
  }

  /**
   * Generate a unique ID for an entry
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }
}

// Global audit logger instance
const auditLogger = new FeatureFlagAuditLogger()

export { auditLogger, FeatureFlagAuditLogger }
