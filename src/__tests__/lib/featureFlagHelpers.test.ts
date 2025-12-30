import {
  getEnabledFeatures,
  getDisabledFeatures,
  getFeatureFlagSummary,
  areAllFeaturesEnabled,
  areAnyFeaturesEnabled,
} from "@/lib/featureFlagHelpers"
import { createMockUser } from "../utils/testHelpers"
import { FeatureFlagName } from "@/lib/featureFlags"

describe("Feature Flag Helpers", () => {
  describe("getEnabledFeatures", () => {
    it("should return all enabled features for admin user", () => {
      const admin = createMockUser({ role: "admin" })
      const enabled = getEnabledFeatures(admin)

      expect(enabled).toContain("ADVANCED_ANALYTICS")
      expect(enabled).toContain("TEST_NEW_PRODUCTS_QUERY")
      expect(enabled).toContain("MULTIPLE_ALLOWANCES")
      expect(Array.isArray(enabled)).toBe(true)
    })

    it("should not include disabled features", () => {
      const user = createMockUser()
      const enabled = getEnabledFeatures(user)

      expect(enabled).not.toContain("DISABLED_FEATURE")
      expect(enabled).not.toContain("EXPERIMENTAL_FEATURE")
    })

    it("should return consistent results", () => {
      const user = createMockUser()
      const result1 = getEnabledFeatures(user)
      const result2 = getEnabledFeatures(user)

      expect(result1).toEqual(result2)
    })
  })

  describe("getDisabledFeatures", () => {
    it("should return all disabled features", () => {
      const user = createMockUser()
      const disabled = getDisabledFeatures(user)

      expect(disabled).toContain("DISABLED_FEATURE")
      expect(disabled).toContain("EXPERIMENTAL_FEATURE")
    })

    it("should not include enabled features for admin", () => {
      const admin = createMockUser({ role: "admin" })
      const disabled = getDisabledFeatures(admin)

      expect(disabled).not.toContain("ADVANCED_ANALYTICS")
      expect(disabled).not.toContain("TEST_NEW_PRODUCTS_QUERY")
    })
  })

  describe("getFeatureFlagSummary", () => {
    it("should return object with all flags", () => {
      const user = createMockUser()
      const summary = getFeatureFlagSummary(user)

      expect(summary).toHaveProperty("ADVANCED_ANALYTICS")
      expect(summary).toHaveProperty("DISABLED_FEATURE")
      expect(summary).toHaveProperty("EXPERIMENTAL_FEATURE")
      expect(summary).toHaveProperty("TEST_NEW_PRODUCTS_QUERY")
      expect(summary).toHaveProperty("MULTIPLE_ALLOWANCES")
    })

    it("should have boolean values for all flags", () => {
      const user = createMockUser()
      const summary = getFeatureFlagSummary(user)

      Object.values(summary).forEach((value) => {
        expect(typeof value).toBe("boolean")
      })
    })

    it("should match individual flag checks", () => {
      const admin = createMockUser({ role: "admin" })
      const summary = getFeatureFlagSummary(admin)

      expect(summary.ADVANCED_ANALYTICS).toBe(true)
      expect(summary.DISABLED_FEATURE).toBe(false)
    })
  })

  describe("areAllFeaturesEnabled", () => {
    it("should return true when all specified flags are enabled", () => {
      const admin = createMockUser({ role: "admin" })
      const flags: FeatureFlagName[] = ["ADVANCED_ANALYTICS", "TEST_NEW_PRODUCTS_QUERY"]

      expect(areAllFeaturesEnabled(admin, flags)).toBe(true)
    })

    it("should return false when any flag is disabled", () => {
      const user = createMockUser()
      const flags: FeatureFlagName[] = [
        "ADVANCED_ANALYTICS",
        "DISABLED_FEATURE",
      ]

      expect(areAllFeaturesEnabled(user, flags)).toBe(false)
    })

    it("should return true for empty array", () => {
      const user = createMockUser()
      expect(areAllFeaturesEnabled(user, [])).toBe(true)
    })
  })

  describe("areAnyFeaturesEnabled", () => {
    it("should return true when at least one flag is enabled", () => {
      const user = createMockUser()
      const flags: FeatureFlagName[] = [
        "ADVANCED_ANALYTICS",
        "DISABLED_FEATURE",
      ]

      expect(areAnyFeaturesEnabled(user, flags)).toBe(true)
    })

    it("should return false when all flags are disabled", () => {
      const user = createMockUser()
      const flags: FeatureFlagName[] = [
        "DISABLED_FEATURE",
        "EXPERIMENTAL_FEATURE",
      ]

      expect(areAnyFeaturesEnabled(user, flags)).toBe(false)
    })

    it("should return false for empty array", () => {
      const user = createMockUser()
      expect(areAnyFeaturesEnabled(user, [])).toBe(false)
    })
  })
})
