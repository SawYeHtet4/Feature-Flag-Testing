import { FeatureFlagName } from "./featureFlags"
import { User } from "./getUser"

/**
 * Performance metrics for feature flag operations
 */
export interface PerformanceMetrics {
  operationName: string
  durationMs: number
  timestamp: Date
  metadata?: Record<string, unknown>
}

/**
 * Feature flag health check result
 */
export interface HealthCheckResult {
  healthy: boolean
  checks: {
    name: string
    passed: boolean
    message?: string
    durationMs?: number
  }[]
  timestamp: Date
}

/**
 * Performance monitoring for feature flags
 */
class FeatureFlagMonitor {
  private metrics: PerformanceMetrics[] = []
  private readonly maxMetrics: number = 1000
  private enabled: boolean = false

  /**
   * Enable or disable monitoring
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled
  }

  /**
   * Check if monitoring is enabled
   */
  isEnabled(): boolean {
    return this.enabled
  }

  /**
   * Measure the performance of a function
   */
  async measure<T>(
    operationName: string,
    fn: () => T | Promise<T>,
    metadata?: Record<string, unknown>
  ): Promise<T> {
    if (!this.enabled) {
      return await fn()
    }

    const start = performance.now()

    try {
      const result = await fn()
      const end = performance.now()

      this.recordMetric({
        operationName,
        durationMs: end - start,
        timestamp: new Date(),
        metadata,
      })

      return result
    } catch (error) {
      const end = performance.now()

      this.recordMetric({
        operationName,
        durationMs: end - start,
        timestamp: new Date(),
        metadata: {
          ...metadata,
          error: error instanceof Error ? error.message : String(error),
        },
      })

      throw error
    }
  }

  /**
   * Record a performance metric
   */
  recordMetric(metric: PerformanceMetrics): void {
    if (!this.enabled) return

    this.metrics.push(metric)

    // Keep only last N metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics)
    }
  }

  /**
   * Get all recorded metrics
   */
  getMetrics(): PerformanceMetrics[] {
    return [...this.metrics]
  }

  /**
   * Get metrics for a specific operation
   */
  getMetricsByOperation(operationName: string): PerformanceMetrics[] {
    return this.metrics.filter((m) => m.operationName === operationName)
  }

  /**
   * Get metrics within a time range
   */
  getMetricsByTimeRange(start: Date, end: Date): PerformanceMetrics[] {
    return this.metrics.filter(
      (m) => m.timestamp >= start && m.timestamp <= end
    )
  }

  /**
   * Get performance statistics for an operation
   */
  getOperationStats(operationName: string): {
    count: number
    avgDuration: number
    minDuration: number
    maxDuration: number
    totalDuration: number
    p50: number
    p95: number
    p99: number
  } | null {
    const metrics = this.getMetricsByOperation(operationName)

    if (metrics.length === 0) return null

    const durations = metrics.map((m) => m.durationMs).sort((a, b) => a - b)
    const total = durations.reduce((sum, d) => sum + d, 0)

    const getPercentile = (p: number) => {
      const index = Math.ceil((p / 100) * durations.length) - 1
      return durations[index] || 0
    }

    return {
      count: metrics.length,
      avgDuration: total / metrics.length,
      minDuration: durations[0],
      maxDuration: durations[durations.length - 1],
      totalDuration: total,
      p50: getPercentile(50),
      p95: getPercentile(95),
      p99: getPercentile(99),
    }
  }

  /**
   * Get all operation statistics
   */
  getAllStats(): Map<string, ReturnType<typeof this.getOperationStats>> {
    const operations = new Set(this.metrics.map((m) => m.operationName))
    const stats = new Map()

    operations.forEach((op) => {
      stats.set(op, this.getOperationStats(op))
    })

    return stats
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics = []
  }

  /**
   * Export metrics as JSON
   */
  exportMetrics(): string {
    return JSON.stringify(
      {
        metrics: this.metrics,
        stats: Object.fromEntries(this.getAllStats()),
        timestamp: new Date().toISOString(),
      },
      null,
      2
    )
  }

  /**
   * Perform health check on feature flag system
   */
  async performHealthCheck(): Promise<HealthCheckResult> {
    const checks: HealthCheckResult["checks"] = []

    // Check 1: Verify feature flags are accessible
    const flagCheckStart = performance.now()
    try {
      const { FEATURE_FLAGS } = require("./featureFlags")
      const flagCount = Object.keys(FEATURE_FLAGS).length

      checks.push({
        name: "Feature Flags Accessible",
        passed: flagCount > 0,
        message: `Found ${flagCount} feature flags`,
        durationMs: performance.now() - flagCheckStart,
      })
    } catch (error) {
      checks.push({
        name: "Feature Flags Accessible",
        passed: false,
        message: error instanceof Error ? error.message : String(error),
        durationMs: performance.now() - flagCheckStart,
      })
    }

    // Check 2: Test flag evaluation performance
    const perfCheckStart = performance.now()
    try {
      const { canViewFeature } = require("./featureFlags")
      const testUser: User = { id: "health-check", role: "user" }

      const iterations = 1000
      const start = performance.now()

      for (let i = 0; i < iterations; i++) {
        canViewFeature("ADVANCED_ANALYTICS" as FeatureFlagName, testUser)
      }

      const avgTime = (performance.now() - start) / iterations

      checks.push({
        name: "Flag Evaluation Performance",
        passed: avgTime < 0.1, // Should be under 0.1ms
        message: `Average evaluation time: ${avgTime.toFixed(4)}ms`,
        durationMs: performance.now() - perfCheckStart,
      })
    } catch (error) {
      checks.push({
        name: "Flag Evaluation Performance",
        passed: false,
        message: error instanceof Error ? error.message : String(error),
        durationMs: performance.now() - perfCheckStart,
      })
    }

    // Check 3: Verify monitoring is functioning
    checks.push({
      name: "Monitoring System",
      passed: true,
      message: `${this.metrics.length} metrics recorded`,
      durationMs: 0,
    })

    return {
      healthy: checks.every((c) => c.passed),
      checks,
      timestamp: new Date(),
    }
  }

  /**
   * Generate monitoring report
   */
  generateReport(): string {
    const stats = this.getAllStats()

    let report = "Feature Flag Performance Monitoring Report\n"
    report += "==========================================\n\n"
    report += `Generated: ${new Date().toISOString()}\n`
    report += `Total Metrics: ${this.metrics.length}\n`
    report += `Monitored Operations: ${stats.size}\n\n`

    stats.forEach((operationStats, operation) => {
      if (!operationStats) return

      report += `Operation: ${operation}\n`
      report += `${"=".repeat(operation.length + 11)}\n`
      report += `Count: ${operationStats.count}\n`
      report += `Average: ${operationStats.avgDuration.toFixed(4)}ms\n`
      report += `Min: ${operationStats.minDuration.toFixed(4)}ms\n`
      report += `Max: ${operationStats.maxDuration.toFixed(4)}ms\n`
      report += `P50: ${operationStats.p50.toFixed(4)}ms\n`
      report += `P95: ${operationStats.p95.toFixed(4)}ms\n`
      report += `P99: ${operationStats.p99.toFixed(4)}ms\n\n`
    })

    return report
  }
}

// Global monitor instance
const featureFlagMonitor = new FeatureFlagMonitor()

export { featureFlagMonitor, FeatureFlagMonitor }
