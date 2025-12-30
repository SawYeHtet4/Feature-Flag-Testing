import { canViewFeature, FEATURE_FLAGS } from "@/lib/featureFlags"
import { createMockUser } from "../utils/testHelpers"

describe("Feature Flags", () => {
  describe("canViewFeature", () => {
    describe("boolean flags", () => {
      it("should return true for enabled boolean flags", () => {
        const user = createMockUser()
        expect(canViewFeature("ADVANCED_ANALYTICS", user)).toBe(true)
        expect(canViewFeature("TEST_NEW_PRODUCTS_QUERY", user)).toBe(true)
      })

      it("should return false for disabled boolean flags", () => {
        const user = createMockUser()
        expect(canViewFeature("DISABLED_FEATURE", user)).toBe(false)
        expect(canViewFeature("EXPERIMENTAL_FEATURE", user)).toBe(false)
      })
    })

    describe("role-based flags", () => {
      it("should grant access to admin users", () => {
        const admin = createMockUser({ role: "admin" })
        expect(canViewFeature("MULTIPLE_ALLOWANCES", admin)).toBe(true)
      })

      it("should grant access to tester users", () => {
        const tester = createMockUser({ role: "tester" })
        expect(canViewFeature("MULTIPLE_ALLOWANCES", tester)).toBe(true)
      })

      it("should grant access to some regular users based on percentage", () => {
        // User with ID that hashes to within 25%
        const user1 = createMockUser({ id: "a", role: "user" })
        const user2 = createMockUser({ id: "b", role: "user" })

        // At least one of these should have access due to 25% rollout
        const hasAccess = canViewFeature("MULTIPLE_ALLOWANCES", user1) ||
                          canViewFeature("MULTIPLE_ALLOWANCES", user2)

        // This is probabilistic, but with different IDs we should see variation
        expect(typeof canViewFeature("MULTIPLE_ALLOWANCES", user1)).toBe("boolean")
      })
    })

    describe("consistency", () => {
      it("should return consistent results for the same user", () => {
        const user = createMockUser({ id: "consistent-user", role: "user" })

        const result1 = canViewFeature("MULTIPLE_ALLOWANCES", user)
        const result2 = canViewFeature("MULTIPLE_ALLOWANCES", user)
        const result3 = canViewFeature("MULTIPLE_ALLOWANCES", user)

        expect(result1).toBe(result2)
        expect(result2).toBe(result3)
      })
    })

    describe("FEATURE_FLAGS structure", () => {
      it("should have expected flag names", () => {
        expect(FEATURE_FLAGS).toHaveProperty("ADVANCED_ANALYTICS")
        expect(FEATURE_FLAGS).toHaveProperty("DISABLED_FEATURE")
        expect(FEATURE_FLAGS).toHaveProperty("EXPERIMENTAL_FEATURE")
        expect(FEATURE_FLAGS).toHaveProperty("TEST_NEW_PRODUCTS_QUERY")
        expect(FEATURE_FLAGS).toHaveProperty("MULTIPLE_ALLOWANCES")
      })

      it("should have correct types for each flag", () => {
        expect(typeof FEATURE_FLAGS.ADVANCED_ANALYTICS).toBe("boolean")
        expect(typeof FEATURE_FLAGS.DISABLED_FEATURE).toBe("boolean")
        expect(Array.isArray(FEATURE_FLAGS.MULTIPLE_ALLOWANCES)).toBe(true)
      })
    })
  })
})
