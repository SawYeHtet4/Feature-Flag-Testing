import {
  getEnvOverride,
  isDevMode,
  getAllEnvOverrides,
} from "@/lib/envFeatureFlags"
import { mockEnv } from "../utils/testHelpers"

describe("Environment Feature Flags", () => {
  let restoreEnv: () => void

  afterEach(() => {
    if (restoreEnv) {
      restoreEnv()
    }
  })

  describe("getEnvOverride", () => {
    it("should return true when env var is 'true'", () => {
      restoreEnv = mockEnv({
        NEXT_PUBLIC_FF_ADVANCED_ANALYTICS: "true",
      })

      expect(getEnvOverride("ADVANCED_ANALYTICS")).toBe(true)
    })

    it("should return false when env var is 'false'", () => {
      restoreEnv = mockEnv({
        NEXT_PUBLIC_FF_ADVANCED_ANALYTICS: "false",
      })

      expect(getEnvOverride("ADVANCED_ANALYTICS")).toBe(false)
    })

    it("should be case insensitive", () => {
      restoreEnv = mockEnv({
        NEXT_PUBLIC_FF_ADVANCED_ANALYTICS: "TRUE",
      })

      expect(getEnvOverride("ADVANCED_ANALYTICS")).toBe(true)

      restoreEnv()
      restoreEnv = mockEnv({
        NEXT_PUBLIC_FF_ADVANCED_ANALYTICS: "False",
      })

      expect(getEnvOverride("ADVANCED_ANALYTICS")).toBe(false)
    })

    it("should return undefined when env var is not set", () => {
      restoreEnv = mockEnv({})

      expect(getEnvOverride("ADVANCED_ANALYTICS")).toBeUndefined()
    })

    it("should return undefined when env var is empty string", () => {
      restoreEnv = mockEnv({
        NEXT_PUBLIC_FF_ADVANCED_ANALYTICS: "",
      })

      expect(getEnvOverride("ADVANCED_ANALYTICS")).toBeUndefined()
    })

    it("should handle different flag names", () => {
      restoreEnv = mockEnv({
        NEXT_PUBLIC_FF_EXPERIMENTAL_FEATURE: "true",
        NEXT_PUBLIC_FF_DISABLED_FEATURE: "false",
      })

      expect(getEnvOverride("EXPERIMENTAL_FEATURE")).toBe(true)
      expect(getEnvOverride("DISABLED_FEATURE")).toBe(false)
    })
  })

  describe("isDevMode", () => {
    it("should return true when NEXT_PUBLIC_DEV_MODE is 'true'", () => {
      restoreEnv = mockEnv({
        NEXT_PUBLIC_DEV_MODE: "true",
      })

      expect(isDevMode()).toBe(true)
    })

    it("should return false when NEXT_PUBLIC_DEV_MODE is not 'true'", () => {
      restoreEnv = mockEnv({
        NEXT_PUBLIC_DEV_MODE: "false",
      })

      expect(isDevMode()).toBe(false)
    })

    it("should return false when NEXT_PUBLIC_DEV_MODE is not set", () => {
      restoreEnv = mockEnv({})

      expect(isDevMode()).toBe(false)
    })
  })

  describe("getAllEnvOverrides", () => {
    it("should return all feature flag overrides", () => {
      restoreEnv = mockEnv({
        NEXT_PUBLIC_FF_ADVANCED_ANALYTICS: "true",
        NEXT_PUBLIC_FF_EXPERIMENTAL_FEATURE: "false",
        NEXT_PUBLIC_FF_DISABLED_FEATURE: "true",
      })

      const overrides = getAllEnvOverrides()

      expect(overrides).toEqual({
        ADVANCED_ANALYTICS: true,
        EXPERIMENTAL_FEATURE: false,
        DISABLED_FEATURE: true,
      })
    })

    it("should ignore non-feature-flag env vars", () => {
      restoreEnv = mockEnv({
        NEXT_PUBLIC_FF_ADVANCED_ANALYTICS: "true",
        NEXT_PUBLIC_DEV_MODE: "true",
        SOME_OTHER_VAR: "value",
      })

      const overrides = getAllEnvOverrides()

      expect(overrides).toEqual({
        ADVANCED_ANALYTICS: true,
      })
      expect(overrides).not.toHaveProperty("DEV_MODE")
      expect(overrides).not.toHaveProperty("SOME_OTHER_VAR")
    })

    it("should return empty object when no overrides are set", () => {
      restoreEnv = mockEnv({})

      const overrides = getAllEnvOverrides()

      expect(overrides).toEqual({})
    })

    it("should ignore empty string values", () => {
      restoreEnv = mockEnv({
        NEXT_PUBLIC_FF_ADVANCED_ANALYTICS: "true",
        NEXT_PUBLIC_FF_DISABLED_FEATURE: "",
      })

      const overrides = getAllEnvOverrides()

      expect(overrides).toEqual({
        ADVANCED_ANALYTICS: true,
      })
      expect(overrides).not.toHaveProperty("DISABLED_FEATURE")
    })
  })
})
