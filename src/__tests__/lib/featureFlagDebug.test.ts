import {
  debugFeatureFlags,
  createDebugPanel,
  getFeatureFlagReason,
} from "@/lib/featureFlagDebug"
import { createMockUser, mockConsole } from "../utils/testHelpers"

describe("Feature Flag Debug Utilities", () => {
  describe("debugFeatureFlags", () => {
    let restoreConsole: () => void
    const originalNodeEnv = process.env.NODE_ENV

    beforeEach(() => {
      restoreConsole = mockConsole()
    })

    afterEach(() => {
      restoreConsole()
      process.env.NODE_ENV = originalNodeEnv
    })

    it("should log to console in development mode", () => {
      process.env.NODE_ENV = "development"
      const user = createMockUser()

      debugFeatureFlags(user)

      expect(console.group).toHaveBeenCalledWith("🚩 Feature Flags Debug")
      expect(console.log).toHaveBeenCalledWith("User:", user)
      expect(console.table).toHaveBeenCalled()
      expect(console.groupEnd).toHaveBeenCalled()
    })

    it("should not log in production mode", () => {
      process.env.NODE_ENV = "production"
      const user = createMockUser()

      debugFeatureFlags(user)

      expect(console.group).not.toHaveBeenCalled()
      expect(console.log).not.toHaveBeenCalled()
      expect(console.table).not.toHaveBeenCalled()
    })

    it("should not log in test mode", () => {
      process.env.NODE_ENV = "test"
      const user = createMockUser()

      debugFeatureFlags(user)

      expect(console.group).not.toHaveBeenCalled()
    })
  })

  describe("createDebugPanel", () => {
    it("should return HTML string", () => {
      const user = createMockUser()
      const panel = createDebugPanel(user)

      expect(typeof panel).toBe("string")
      expect(panel).toContain("Feature Flags Debug")
    })

    it("should include user information", () => {
      const user = createMockUser({ id: "test-123", role: "admin" })
      const panel = createDebugPanel(user)

      expect(panel).toContain("test-123")
      expect(panel).toContain("admin")
    })

    it("should include all feature flags", () => {
      const user = createMockUser()
      const panel = createDebugPanel(user)

      expect(panel).toContain("ADVANCED_ANALYTICS")
      expect(panel).toContain("DISABLED_FEATURE")
      expect(panel).toContain("EXPERIMENTAL_FEATURE")
      expect(panel).toContain("TEST_NEW_PRODUCTS_QUERY")
      expect(panel).toContain("MULTIPLE_ALLOWANCES")
    })

    it("should show enabled/disabled status", () => {
      const user = createMockUser()
      const panel = createDebugPanel(user)

      expect(panel).toContain("✓ Enabled")
      expect(panel).toContain("✗ Disabled")
    })

    it("should use color coding", () => {
      const user = createMockUser()
      const panel = createDebugPanel(user)

      expect(panel).toContain("green")
      expect(panel).toContain("red")
    })
  })

  describe("getFeatureFlagReason", () => {
    it("should explain boolean flags", () => {
      const user = createMockUser()

      const reasonTrue = getFeatureFlagReason("ADVANCED_ANALYTICS", user)
      expect(reasonTrue).toContain("Static value: true")

      const reasonFalse = getFeatureFlagReason("DISABLED_FEATURE", user)
      expect(reasonFalse).toContain("Static value: false")
    })

    it("should explain role-based rules", () => {
      const user = createMockUser({ role: "user" })
      const reason = getFeatureFlagReason("MULTIPLE_ALLOWANCES", user)

      expect(reason).toContain("Rule")
      expect(reason).toContain("user")
    })

    it("should show role check results for admin", () => {
      const admin = createMockUser({ role: "admin" })
      const reason = getFeatureFlagReason("MULTIPLE_ALLOWANCES", admin)

      expect(reason).toContain("admin")
      expect(reason).toContain("✓")
    })

    it("should show percentage information", () => {
      const user = createMockUser()
      const reason = getFeatureFlagReason("MULTIPLE_ALLOWANCES", user)

      expect(reason).toContain("25%")
      expect(reason).toContain("Percentage")
    })

    it("should list multiple rules", () => {
      const user = createMockUser()
      const reason = getFeatureFlagReason("MULTIPLE_ALLOWANCES", user)

      expect(reason).toContain("Rule 1")
      expect(reason).toContain("Rule 2")
    })
  })
})
