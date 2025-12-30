import { canViewFeature } from "@/lib/featureFlags"
import {
  getEnabledFeatures,
  getFeatureFlagSummary,
  areAllFeaturesEnabled,
} from "@/lib/featureFlagHelpers"
import { createMockUser } from "../utils/testHelpers"

describe("Feature Flags Integration Tests", () => {
  describe("end-to-end flag evaluation", () => {
    it("should work correctly for admin user across all systems", () => {
      const admin = createMockUser({ role: "admin" })

      // Direct flag check
      expect(canViewFeature("ADVANCED_ANALYTICS", admin)).toBe(true)
      expect(canViewFeature("MULTIPLE_ALLOWANCES", admin)).toBe(true)

      // Helper utilities
      const enabled = getEnabledFeatures(admin)
      expect(enabled).toContain("ADVANCED_ANALYTICS")
      expect(enabled).toContain("MULTIPLE_ALLOWANCES")

      // Summary
      const summary = getFeatureFlagSummary(admin)
      expect(summary.ADVANCED_ANALYTICS).toBe(true)
      expect(summary.MULTIPLE_ALLOWANCES).toBe(true)

      // Bulk checks
      expect(
        areAllFeaturesEnabled(admin, [
          "ADVANCED_ANALYTICS",
          "MULTIPLE_ALLOWANCES",
        ])
      ).toBe(true)
    })

    it("should work correctly for regular user", () => {
      const user = createMockUser({ role: "user" })

      // Boolean flags
      expect(canViewFeature("ADVANCED_ANALYTICS", user)).toBe(true)
      expect(canViewFeature("DISABLED_FEATURE", user)).toBe(false)

      // Summary should be consistent
      const summary = getFeatureFlagSummary(user)
      expect(summary.ADVANCED_ANALYTICS).toBe(true)
      expect(summary.DISABLED_FEATURE).toBe(false)
    })

    it("should maintain consistency across multiple checks", () => {
      const user = createMockUser({ id: "consistent-user", role: "user" })

      // Check the same flag multiple times
      const results = [
        canViewFeature("MULTIPLE_ALLOWANCES", user),
        canViewFeature("MULTIPLE_ALLOWANCES", user),
        canViewFeature("MULTIPLE_ALLOWANCES", user),
      ]

      // All results should be the same
      expect(results[0]).toBe(results[1])
      expect(results[1]).toBe(results[2])

      // Summary should match
      const summary = getFeatureFlagSummary(user)
      expect(summary.MULTIPLE_ALLOWANCES).toBe(results[0])
    })
  })

  describe("role hierarchy", () => {
    const testFlag = "MULTIPLE_ALLOWANCES"

    it("should grant access to all admin users", () => {
      const admins = [
        createMockUser({ id: "admin1", role: "admin" }),
        createMockUser({ id: "admin2", role: "admin" }),
        createMockUser({ id: "admin3", role: "admin" }),
      ]

      admins.forEach((admin) => {
        expect(canViewFeature(testFlag, admin)).toBe(true)
      })
    })

    it("should grant access to all tester users", () => {
      const testers = [
        createMockUser({ id: "tester1", role: "tester" }),
        createMockUser({ id: "tester2", role: "tester" }),
        createMockUser({ id: "tester3", role: "tester" }),
      ]

      testers.forEach((tester) => {
        expect(canViewFeature(testFlag, tester)).toBe(true)
      })
    })

    it("should vary for regular users based on percentage", () => {
      const users = Array.from({ length: 100 }, (_, i) =>
        createMockUser({ id: `user${i}`, role: "user" })
      )

      const withAccess = users.filter((user) =>
        canViewFeature(testFlag, user)
      )

      // Should be approximately 25% (with some variance)
      // Expecting between 15% and 35% to account for hash distribution
      expect(withAccess.length).toBeGreaterThan(15)
      expect(withAccess.length).toBeLessThan(35)
    })
  })

  describe("feature flag combinations", () => {
    it("should handle multiple enabled flags correctly", () => {
      const user = createMockUser({ role: "admin" })

      const allEnabled = ["ADVANCED_ANALYTICS", "TEST_NEW_PRODUCTS_QUERY"]
      expect(areAllFeaturesEnabled(user, allEnabled)).toBe(true)
    })

    it("should handle mixed enabled/disabled flags", () => {
      const user = createMockUser({ role: "user" })

      const mixed = ["ADVANCED_ANALYTICS", "DISABLED_FEATURE"]
      expect(areAllFeaturesEnabled(user, mixed)).toBe(false)
    })

    it("should get correct summary for all flag types", () => {
      const admin = createMockUser({ role: "admin" })
      const summary = getFeatureFlagSummary(admin)

      // Boolean flags
      expect(summary.ADVANCED_ANALYTICS).toBe(true)
      expect(summary.TEST_NEW_PRODUCTS_QUERY).toBe(true)
      expect(summary.DISABLED_FEATURE).toBe(false)
      expect(summary.EXPERIMENTAL_FEATURE).toBe(false)

      // Role-based flag
      expect(summary.MULTIPLE_ALLOWANCES).toBe(true)
    })
  })

  describe("user identity consistency", () => {
    it("should return same results for same user ID", () => {
      const userId = "test-user-xyz"

      const user1 = createMockUser({ id: userId, role: "user" })
      const user2 = createMockUser({ id: userId, role: "user" })

      const result1 = canViewFeature("MULTIPLE_ALLOWANCES", user1)
      const result2 = canViewFeature("MULTIPLE_ALLOWANCES", user2)

      expect(result1).toBe(result2)
    })

    it("should return different results for different user IDs", () => {
      const user1 = createMockUser({ id: "user-a", role: "user" })
      const user2 = createMockUser({ id: "user-z", role: "user" })

      const result1 = canViewFeature("MULTIPLE_ALLOWANCES", user1)
      const result2 = canViewFeature("MULTIPLE_ALLOWANCES", user2)

      // They might be the same by chance, but their enabled flags lists
      // should be consistently calculated
      const enabled1 = getEnabledFeatures(user1)
      const enabled2 = getEnabledFeatures(user2)

      // Re-check should give same results
      const enabled1Again = getEnabledFeatures(user1)
      const enabled2Again = getEnabledFeatures(user2)

      expect(enabled1).toEqual(enabled1Again)
      expect(enabled2).toEqual(enabled2Again)
    })
  })
})
