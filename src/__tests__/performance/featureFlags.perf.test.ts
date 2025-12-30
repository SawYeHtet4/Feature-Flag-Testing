import { canViewFeature } from "@/lib/featureFlags"
import { getFeatureFlagSummary, getEnabledFeatures } from "@/lib/featureFlagHelpers"
import { createMockUser } from "../utils/testHelpers"

describe("Feature Flags Performance Tests", () => {
  describe("canViewFeature performance", () => {
    it("should evaluate boolean flags quickly", () => {
      const user = createMockUser()
      const iterations = 10000

      const start = performance.now()
      for (let i = 0; i < iterations; i++) {
        canViewFeature("ADVANCED_ANALYTICS", user)
      }
      const end = performance.now()

      const duration = end - start
      const avgTime = duration / iterations

      // Should average less than 0.01ms per call
      expect(avgTime).toBeLessThan(0.01)
      console.log(`Boolean flag: ${avgTime.toFixed(4)}ms per call`)
    })

    it("should evaluate role-based flags quickly", () => {
      const user = createMockUser({ role: "admin" })
      const iterations = 10000

      const start = performance.now()
      for (let i = 0; i < iterations; i++) {
        canViewFeature("MULTIPLE_ALLOWANCES", user)
      }
      const end = performance.now()

      const duration = end - start
      const avgTime = duration / iterations

      // Should average less than 0.05ms per call
      expect(avgTime).toBeLessThan(0.05)
      console.log(`Role-based flag: ${avgTime.toFixed(4)}ms per call`)
    })

    it("should handle many users efficiently", () => {
      const users = Array.from({ length: 1000 }, (_, i) =>
        createMockUser({ id: `user${i}` })
      )

      const start = performance.now()
      users.forEach((user) => {
        canViewFeature("ADVANCED_ANALYTICS", user)
        canViewFeature("MULTIPLE_ALLOWANCES", user)
      })
      const end = performance.now()

      const duration = end - start

      // Should process 1000 users with 2 flags each in less than 100ms
      expect(duration).toBeLessThan(100)
      console.log(`1000 users, 2 flags: ${duration.toFixed(2)}ms total`)
    })
  })

  describe("hash function performance", () => {
    it("should compute hashes quickly", () => {
      const { murmurhash } = require("@/lib/murmurhash")
      const iterations = 100000

      const start = performance.now()
      for (let i = 0; i < iterations; i++) {
        murmurhash(`FEATURE_FLAG-user${i}`)
      }
      const end = performance.now()

      const duration = end - start
      const avgTime = duration / iterations

      // Should average less than 0.01ms per hash
      expect(avgTime).toBeLessThan(0.01)
      console.log(`Hash computation: ${avgTime.toFixed(5)}ms per call`)
    })
  })

  describe("helper utilities performance", () => {
    it("should get summary efficiently", () => {
      const user = createMockUser()
      const iterations = 1000

      const start = performance.now()
      for (let i = 0; i < iterations; i++) {
        getFeatureFlagSummary(user)
      }
      const end = performance.now()

      const duration = end - start
      const avgTime = duration / iterations

      // Should average less than 0.5ms per call
      expect(avgTime).toBeLessThan(0.5)
      console.log(`Summary generation: ${avgTime.toFixed(4)}ms per call`)
    })

    it("should get enabled features efficiently", () => {
      const user = createMockUser({ role: "admin" })
      const iterations = 1000

      const start = performance.now()
      for (let i = 0; i < iterations; i++) {
        getEnabledFeatures(user)
      }
      const end = performance.now()

      const duration = end - start
      const avgTime = duration / iterations

      // Should average less than 0.5ms per call
      expect(avgTime).toBeLessThan(0.5)
      console.log(`Get enabled features: ${avgTime.toFixed(4)}ms per call`)
    })
  })

  describe("memory efficiency", () => {
    it("should not leak memory with repeated calls", () => {
      const user = createMockUser()
      const iterations = 10000

      // Warm up
      for (let i = 0; i < 100; i++) {
        canViewFeature("ADVANCED_ANALYTICS", user)
      }

      // Force GC if available
      if (global.gc) {
        global.gc()
      }

      const memBefore = process.memoryUsage().heapUsed

      for (let i = 0; i < iterations; i++) {
        canViewFeature("ADVANCED_ANALYTICS", user)
        canViewFeature("MULTIPLE_ALLOWANCES", user)
      }

      if (global.gc) {
        global.gc()
      }

      const memAfter = process.memoryUsage().heapUsed
      const memDiff = memAfter - memBefore

      // Memory growth should be minimal (less than 1MB for 10k calls)
      const memDiffMB = memDiff / 1024 / 1024
      expect(memDiffMB).toBeLessThan(1)
      console.log(`Memory growth: ${memDiffMB.toFixed(2)}MB`)
    })
  })

  describe("worst case scenarios", () => {
    it("should handle long user IDs efficiently", () => {
      const longId = "a".repeat(1000)
      const user = createMockUser({ id: longId })
      const iterations = 1000

      const start = performance.now()
      for (let i = 0; i < iterations; i++) {
        canViewFeature("MULTIPLE_ALLOWANCES", user)
      }
      const end = performance.now()

      const duration = end - start
      const avgTime = duration / iterations

      // Should still be fast even with long IDs
      expect(avgTime).toBeLessThan(0.1)
      console.log(`Long ID (1000 chars): ${avgTime.toFixed(4)}ms per call`)
    })

    it("should handle many flag checks per user", () => {
      const user = createMockUser()
      const flags: Array<keyof typeof import("@/lib/featureFlags").FEATURE_FLAGS> = [
        "ADVANCED_ANALYTICS",
        "TEST_NEW_PRODUCTS_QUERY",
        "DISABLED_FEATURE",
        "EXPERIMENTAL_FEATURE",
        "MULTIPLE_ALLOWANCES",
      ]

      const start = performance.now()
      for (let i = 0; i < 1000; i++) {
        flags.forEach((flag) => {
          canViewFeature(flag, user)
        })
      }
      const end = performance.now()

      const duration = end - start

      // 5000 flag checks should complete in less than 50ms
      expect(duration).toBeLessThan(50)
      console.log(`5000 flag checks: ${duration.toFixed(2)}ms total`)
    })
  })

  describe("concurrent access simulation", () => {
    it("should handle concurrent requests efficiently", async () => {
      const users = Array.from({ length: 100 }, (_, i) =>
        createMockUser({ id: `concurrent-user${i}` })
      )

      const start = performance.now()

      // Simulate 100 concurrent users checking flags
      await Promise.all(
        users.map(async (user) => {
          // Simulate async operation
          await new Promise((resolve) => setImmediate(resolve))

          canViewFeature("ADVANCED_ANALYTICS", user)
          canViewFeature("MULTIPLE_ALLOWANCES", user)
          getFeatureFlagSummary(user)
        })
      )

      const end = performance.now()
      const duration = end - start

      // Should handle 100 concurrent users quickly
      expect(duration).toBeLessThan(200)
      console.log(`100 concurrent users: ${duration.toFixed(2)}ms total`)
    })
  })
})
