import { FeatureFlagName } from "./featureFlags"
import { User } from "./getUser"

/**
 * Analytics event types for feature flags
 */
export type FeatureFlagEvent = {
  type: "flag_check" | "flag_enabled" | "flag_disabled"
  flagName: FeatureFlagName
  userId: string
  userRole: string
  enabled: boolean
  timestamp: Date
  metadata?: Record<string, unknown>
}

/**
 * Analytics tracker interface
 */
export interface AnalyticsTracker {
  track(event: FeatureFlagEvent): void
  flush?(): Promise<void>
}

/**
 * In-memory analytics store
 */
class InMemoryAnalytics implements AnalyticsTracker {
  private events: FeatureFlagEvent[] = []
  private readonly maxEvents: number = 1000

  track(event: FeatureFlagEvent): void {
    this.events.push(event)

    // Keep only last N events
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents)
    }
  }

  getEvents(): FeatureFlagEvent[] {
    return [...this.events]
  }

  getEventsByFlag(flagName: FeatureFlagName): FeatureFlagEvent[] {
    return this.events.filter((event) => event.flagName === flagName)
  }

  getEventsByUser(userId: string): FeatureFlagEvent[] {
    return this.events.filter((event) => event.userId === userId)
  }

  clear(): void {
    this.events = []
  }

  async flush(): Promise<void> {
    // In-memory implementation doesn't need flushing
    return Promise.resolve()
  }
}

/**
 * Console logger for debugging
 */
class ConsoleAnalytics implements AnalyticsTracker {
  track(event: FeatureFlagEvent): void {
    if (process.env.NODE_ENV === "development") {
      console.log("[Feature Flag Analytics]", {
        flag: event.flagName,
        user: `${event.userId} (${event.userRole})`,
        enabled: event.enabled,
        timestamp: event.timestamp.toISOString(),
      })
    }
  }
}

/**
 * Custom analytics adapter
 * Implement this interface to send to your analytics service
 */
export class CustomAnalytics implements AnalyticsTracker {
  constructor(
    private readonly sendFunction: (event: FeatureFlagEvent) => void | Promise<void>
  ) {}

  track(event: FeatureFlagEvent): void {
    this.sendFunction(event)
  }
}

/**
 * Global analytics tracker
 */
let analyticsTracker: AnalyticsTracker = new InMemoryAnalytics()

/**
 * Configure the analytics tracker
 */
export function configureAnalytics(tracker: AnalyticsTracker): void {
  analyticsTracker = tracker
}

/**
 * Get the current analytics tracker
 */
export function getAnalyticsTracker(): AnalyticsTracker {
  return analyticsTracker
}

/**
 * Track a feature flag check
 */
export function trackFeatureFlagCheck(
  flagName: FeatureFlagName,
  user: User,
  enabled: boolean,
  metadata?: Record<string, unknown>
): void {
  const event: FeatureFlagEvent = {
    type: enabled ? "flag_enabled" : "flag_disabled",
    flagName,
    userId: user.id,
    userRole: user.role,
    enabled,
    timestamp: new Date(),
    metadata,
  }

  analyticsTracker.track(event)
}

/**
 * Get feature flag usage statistics
 */
export function getFeatureFlagStats(
  flagName: FeatureFlagName
): {
  totalChecks: number
  enabledCount: number
  disabledCount: number
  uniqueUsers: Set<string>
  enablementRate: number
} | null {
  if (!(analyticsTracker instanceof InMemoryAnalytics)) {
    return null
  }

  const events = analyticsTracker.getEventsByFlag(flagName)

  if (events.length === 0) {
    return null
  }

  const enabledCount = events.filter((e) => e.enabled).length
  const disabledCount = events.filter((e) => !e.enabled).length
  const uniqueUsers = new Set(events.map((e) => e.userId))

  return {
    totalChecks: events.length,
    enabledCount,
    disabledCount,
    uniqueUsers,
    enablementRate: enabledCount / events.length,
  }
}

/**
 * Get user-specific feature flag usage
 */
export function getUserFeatureFlagStats(userId: string): {
  totalChecks: number
  flagsEnabled: Set<FeatureFlagName>
  flagsDisabled: Set<FeatureFlagName>
  lastCheck: Date | null
} | null {
  if (!(analyticsTracker instanceof InMemoryAnalytics)) {
    return null
  }

  const events = analyticsTracker.getEventsByUser(userId)

  if (events.length === 0) {
    return null
  }

  const flagsEnabled = new Set(
    events.filter((e) => e.enabled).map((e) => e.flagName)
  )
  const flagsDisabled = new Set(
    events.filter((e) => !e.enabled).map((e) => e.flagName)
  )
  const lastCheck =
    events.length > 0 ? events[events.length - 1].timestamp : null

  return {
    totalChecks: events.length,
    flagsEnabled,
    flagsDisabled,
    lastCheck,
  }
}

// Export pre-configured trackers
export const inMemoryAnalytics = new InMemoryAnalytics()
export const consoleAnalytics = new ConsoleAnalytics()
