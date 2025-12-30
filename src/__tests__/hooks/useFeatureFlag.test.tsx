import { renderHook } from "@testing-library/react"
import { useFeatureFlag, useFeatureFlags } from "@/hooks/useFeatureFlag"
import * as getUser from "@/lib/getUser"
import { createMockUser } from "../utils/testHelpers"

// Mock the getUser module
jest.mock("@/lib/getUser", () => ({
  getUser: jest.fn(),
}))

describe("useFeatureFlag Hook", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("useFeatureFlag", () => {
    it("should return true for enabled boolean flags", () => {
      const mockUser = createMockUser()
      jest.spyOn(getUser, "getUser").mockReturnValue(mockUser)

      const { result } = renderHook(() =>
        useFeatureFlag("ADVANCED_ANALYTICS")
      )

      expect(result.current).toBe(true)
    })

    it("should return false for disabled boolean flags", () => {
      const mockUser = createMockUser()
      jest.spyOn(getUser, "getUser").mockReturnValue(mockUser)

      const { result } = renderHook(() =>
        useFeatureFlag("DISABLED_FEATURE")
      )

      expect(result.current).toBe(false)
    })

    it("should work with role-based flags for admin", () => {
      const admin = createMockUser({ role: "admin" })
      jest.spyOn(getUser, "getUser").mockReturnValue(admin)

      const { result } = renderHook(() =>
        useFeatureFlag("MULTIPLE_ALLOWANCES")
      )

      expect(result.current).toBe(true)
    })

    it("should memoize results based on flag and user", () => {
      const mockUser = createMockUser()
      jest.spyOn(getUser, "getUser").mockReturnValue(mockUser)

      const { result, rerender } = renderHook(() =>
        useFeatureFlag("ADVANCED_ANALYTICS")
      )

      const firstResult = result.current
      rerender()
      const secondResult = result.current

      expect(firstResult).toBe(secondResult)
      expect(firstResult).toBe(true)
    })
  })

  describe("useFeatureFlags", () => {
    it("should return object with multiple flag states", () => {
      const mockUser = createMockUser()
      jest.spyOn(getUser, "getUser").mockReturnValue(mockUser)

      const { result } = renderHook(() =>
        useFeatureFlags(["ADVANCED_ANALYTICS", "DISABLED_FEATURE"] as const)
      )

      expect(result.current).toEqual({
        ADVANCED_ANALYTICS: true,
        DISABLED_FEATURE: false,
      })
    })

    it("should handle single flag", () => {
      const mockUser = createMockUser()
      jest.spyOn(getUser, "getUser").mockReturnValue(mockUser)

      const { result } = renderHook(() =>
        useFeatureFlags(["ADVANCED_ANALYTICS"] as const)
      )

      expect(result.current).toEqual({
        ADVANCED_ANALYTICS: true,
      })
    })

    it("should work with role-based flags", () => {
      const admin = createMockUser({ role: "admin" })
      jest.spyOn(getUser, "getUser").mockReturnValue(admin)

      const { result } = renderHook(() =>
        useFeatureFlags([
          "ADVANCED_ANALYTICS",
          "MULTIPLE_ALLOWANCES",
        ] as const)
      )

      expect(result.current.ADVANCED_ANALYTICS).toBe(true)
      expect(result.current.MULTIPLE_ALLOWANCES).toBe(true)
    })

    it("should memoize results", () => {
      const mockUser = createMockUser()
      jest.spyOn(getUser, "getUser").mockReturnValue(mockUser)

      const flags = ["ADVANCED_ANALYTICS", "DISABLED_FEATURE"] as const

      const { result, rerender } = renderHook(() => useFeatureFlags(flags))

      const firstResult = result.current
      rerender()
      const secondResult = result.current

      expect(firstResult).toBe(secondResult)
    })
  })
})
