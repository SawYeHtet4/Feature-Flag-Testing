import { render, screen } from "@testing-library/react"
import { FeatureToggle } from "@/components/FeatureToggle"
import * as useFeatureFlag from "@/hooks/useFeatureFlag"

jest.mock("@/hooks/useFeatureFlag", () => ({
  useFeatureFlag: jest.fn(),
}))

describe("FeatureToggle Component", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("when feature is enabled", () => {
    it("should render whenEnabled content", () => {
      jest.spyOn(useFeatureFlag, "useFeatureFlag").mockReturnValue(true)

      render(
        <FeatureToggle
          featureFlag="ADVANCED_ANALYTICS"
          whenEnabled={<div>New Feature</div>}
          whenDisabled={<div>Old Feature</div>}
        />
      )

      expect(screen.getByText("New Feature")).toBeInTheDocument()
      expect(screen.queryByText("Old Feature")).not.toBeInTheDocument()
    })

    it("should call useFeatureFlag with correct flag name", () => {
      const mockUseFeatureFlag = jest
        .spyOn(useFeatureFlag, "useFeatureFlag")
        .mockReturnValue(true)

      render(
        <FeatureToggle
          featureFlag="EXPERIMENTAL_FEATURE"
          whenEnabled={<div>Enabled</div>}
          whenDisabled={<div>Disabled</div>}
        />
      )

      expect(mockUseFeatureFlag).toHaveBeenCalledWith("EXPERIMENTAL_FEATURE")
    })

    it("should render complex JSX in whenEnabled", () => {
      jest.spyOn(useFeatureFlag, "useFeatureFlag").mockReturnValue(true)

      render(
        <FeatureToggle
          featureFlag="ADVANCED_ANALYTICS"
          whenEnabled={
            <div>
              <h1>Title</h1>
              <p>Description</p>
            </div>
          }
          whenDisabled={<div>Fallback</div>}
        />
      )

      expect(screen.getByText("Title")).toBeInTheDocument()
      expect(screen.getByText("Description")).toBeInTheDocument()
    })
  })

  describe("when feature is disabled", () => {
    it("should render whenDisabled content", () => {
      jest.spyOn(useFeatureFlag, "useFeatureFlag").mockReturnValue(false)

      render(
        <FeatureToggle
          featureFlag="DISABLED_FEATURE"
          whenEnabled={<div>New Feature</div>}
          whenDisabled={<div>Old Feature</div>}
        />
      )

      expect(screen.queryByText("New Feature")).not.toBeInTheDocument()
      expect(screen.getByText("Old Feature")).toBeInTheDocument()
    })

    it("should render complex JSX in whenDisabled", () => {
      jest.spyOn(useFeatureFlag, "useFeatureFlag").mockReturnValue(false)

      render(
        <FeatureToggle
          featureFlag="DISABLED_FEATURE"
          whenEnabled={<div>Enabled</div>}
          whenDisabled={
            <div>
              <h1>Legacy Title</h1>
              <p>Legacy Description</p>
            </div>
          }
        />
      )

      expect(screen.getByText("Legacy Title")).toBeInTheDocument()
      expect(screen.getByText("Legacy Description")).toBeInTheDocument()
    })
  })

  describe("reactivity", () => {
    it("should update when feature flag changes", () => {
      const mockUseFeatureFlag = jest
        .spyOn(useFeatureFlag, "useFeatureFlag")
        .mockReturnValue(false)

      const { rerender } = render(
        <FeatureToggle
          featureFlag="ADVANCED_ANALYTICS"
          whenEnabled={<div>Enabled</div>}
          whenDisabled={<div>Disabled</div>}
        />
      )

      expect(screen.getByText("Disabled")).toBeInTheDocument()

      // Simulate flag being enabled
      mockUseFeatureFlag.mockReturnValue(true)

      rerender(
        <FeatureToggle
          featureFlag="ADVANCED_ANALYTICS"
          whenEnabled={<div>Enabled</div>}
          whenDisabled={<div>Disabled</div>}
        />
      )

      expect(screen.getByText("Enabled")).toBeInTheDocument()
      expect(screen.queryByText("Disabled")).not.toBeInTheDocument()
    })
  })

  describe("with different data types", () => {
    it("should render text nodes", () => {
      jest.spyOn(useFeatureFlag, "useFeatureFlag").mockReturnValue(true)

      render(
        <FeatureToggle
          featureFlag="ADVANCED_ANALYTICS"
          whenEnabled="Enabled text"
          whenDisabled="Disabled text"
        />
      )

      expect(screen.getByText("Enabled text")).toBeInTheDocument()
    })

    it("should render null values", () => {
      jest.spyOn(useFeatureFlag, "useFeatureFlag").mockReturnValue(true)

      const { container } = render(
        <FeatureToggle
          featureFlag="ADVANCED_ANALYTICS"
          whenEnabled={null}
          whenDisabled={<div>Disabled</div>}
        />
      )

      expect(container.firstChild).toBeEmptyDOMElement()
    })
  })
})
