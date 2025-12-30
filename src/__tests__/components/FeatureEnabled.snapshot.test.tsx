import { render } from "@testing-library/react"
import { FeatureEnabled } from "@/components/FeatureEnabled"
import * as getUser from "@/lib/getUser"
import { createMockUser } from "../utils/testHelpers"

jest.mock("@/lib/getUser", () => ({
  getUser: jest.fn(),
}))

describe("FeatureEnabled Snapshot Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("should match snapshot when feature is enabled", () => {
    const mockUser = createMockUser()
    jest.spyOn(getUser, "getUser").mockReturnValue(mockUser)

    const { container } = render(
      <FeatureEnabled featureFlag="ADVANCED_ANALYTICS">
        <div className="feature">Feature Content</div>
      </FeatureEnabled>
    )

    expect(container).toMatchSnapshot()
  })

  it("should match snapshot when feature is disabled", () => {
    const mockUser = createMockUser()
    jest.spyOn(getUser, "getUser").mockReturnValue(mockUser)

    const { container } = render(
      <FeatureEnabled featureFlag="DISABLED_FEATURE">
        <div className="feature">Feature Content</div>
      </FeatureEnabled>
    )

    expect(container).toMatchSnapshot()
  })

  it("should match snapshot when feature is disabled with fallback", () => {
    const mockUser = createMockUser()
    jest.spyOn(getUser, "getUser").mockReturnValue(mockUser)

    const { container } = render(
      <FeatureEnabled
        featureFlag="DISABLED_FEATURE"
        fallback={<div className="fallback">Fallback Content</div>}
      >
        <div className="feature">Feature Content</div>
      </FeatureEnabled>
    )

    expect(container).toMatchSnapshot()
  })

  it("should match snapshot with inverted logic", () => {
    const mockUser = createMockUser()
    jest.spyOn(getUser, "getUser").mockReturnValue(mockUser)

    const { container } = render(
      <FeatureEnabled featureFlag="DISABLED_FEATURE" invert>
        <div className="legacy">Legacy Content</div>
      </FeatureEnabled>
    )

    expect(container).toMatchSnapshot()
  })
})
