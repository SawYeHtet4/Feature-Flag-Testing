import { render, screen } from "@testing-library/react"
import { FeatureEnabled } from "@/components/FeatureEnabled"
import * as getUser from "@/lib/getUser"
import { createMockUser } from "../utils/testHelpers"

jest.mock("@/lib/getUser", () => ({
  getUser: jest.fn(),
}))

describe("FeatureEnabled Component", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("when feature is enabled", () => {
    it("should render children", () => {
      const mockUser = createMockUser()
      jest.spyOn(getUser, "getUser").mockReturnValue(mockUser)

      render(
        <FeatureEnabled featureFlag="ADVANCED_ANALYTICS">
          <div>Feature Content</div>
        </FeatureEnabled>
      )

      expect(screen.getByText("Feature Content")).toBeInTheDocument()
    })

    it("should not render fallback", () => {
      const mockUser = createMockUser()
      jest.spyOn(getUser, "getUser").mockReturnValue(mockUser)

      render(
        <FeatureEnabled
          featureFlag="ADVANCED_ANALYTICS"
          fallback={<div>Fallback Content</div>}
        >
          <div>Feature Content</div>
        </FeatureEnabled>
      )

      expect(screen.getByText("Feature Content")).toBeInTheDocument()
      expect(screen.queryByText("Fallback Content")).not.toBeInTheDocument()
    })
  })

  describe("when feature is disabled", () => {
    it("should not render children", () => {
      const mockUser = createMockUser()
      jest.spyOn(getUser, "getUser").mockReturnValue(mockUser)

      render(
        <FeatureEnabled featureFlag="DISABLED_FEATURE">
          <div>Feature Content</div>
        </FeatureEnabled>
      )

      expect(screen.queryByText("Feature Content")).not.toBeInTheDocument()
    })

    it("should render fallback when provided", () => {
      const mockUser = createMockUser()
      jest.spyOn(getUser, "getUser").mockReturnValue(mockUser)

      render(
        <FeatureEnabled
          featureFlag="DISABLED_FEATURE"
          fallback={<div>Fallback Content</div>}
        >
          <div>Feature Content</div>
        </FeatureEnabled>
      )

      expect(screen.queryByText("Feature Content")).not.toBeInTheDocument()
      expect(screen.getByText("Fallback Content")).toBeInTheDocument()
    })

    it("should render null when no fallback provided", () => {
      const mockUser = createMockUser()
      jest.spyOn(getUser, "getUser").mockReturnValue(mockUser)

      const { container } = render(
        <FeatureEnabled featureFlag="DISABLED_FEATURE">
          <div>Feature Content</div>
        </FeatureEnabled>
      )

      expect(container.firstChild).toBeEmptyDOMElement()
    })
  })

  describe("invert prop", () => {
    it("should render children when feature is disabled and invert is true", () => {
      const mockUser = createMockUser()
      jest.spyOn(getUser, "getUser").mockReturnValue(mockUser)

      render(
        <FeatureEnabled featureFlag="DISABLED_FEATURE" invert>
          <div>Legacy Content</div>
        </FeatureEnabled>
      )

      expect(screen.getByText("Legacy Content")).toBeInTheDocument()
    })

    it("should not render children when feature is enabled and invert is true", () => {
      const mockUser = createMockUser()
      jest.spyOn(getUser, "getUser").mockReturnValue(mockUser)

      render(
        <FeatureEnabled featureFlag="ADVANCED_ANALYTICS" invert>
          <div>Legacy Content</div>
        </FeatureEnabled>
      )

      expect(screen.queryByText("Legacy Content")).not.toBeInTheDocument()
    })
  })

  describe("role-based features", () => {
    it("should render for admin users with role-based flags", () => {
      const admin = createMockUser({ role: "admin" })
      jest.spyOn(getUser, "getUser").mockReturnValue(admin)

      render(
        <FeatureEnabled featureFlag="MULTIPLE_ALLOWANCES">
          <div>Admin Feature</div>
        </FeatureEnabled>
      )

      expect(screen.getByText("Admin Feature")).toBeInTheDocument()
    })
  })
})
