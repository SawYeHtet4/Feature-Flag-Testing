import { FeatureEnabled } from "@/components/FeatureEnabled"
import { FeatureToggle } from "@/components/FeatureToggle"

export default function ExamplesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Feature Flag Examples</h1>

      {/* Example 1: Simple FeatureEnabled */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">
          1. Simple FeatureEnabled Component
        </h2>
        <div className="border rounded-lg p-6 bg-gray-50">
          <FeatureEnabled featureFlag="ADVANCED_ANALYTICS">
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              ✓ Advanced Analytics is enabled! You can see this content.
            </div>
          </FeatureEnabled>

          <FeatureEnabled featureFlag="EXPERIMENTAL_FEATURE">
            <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mt-4">
              This is an experimental feature (probably disabled).
            </div>
          </FeatureEnabled>
        </div>
      </section>

      {/* Example 2: FeatureEnabled with Fallback */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">
          2. FeatureEnabled with Fallback
        </h2>
        <div className="border rounded-lg p-6 bg-gray-50">
          <FeatureEnabled
            featureFlag="EXPERIMENTAL_FEATURE"
            fallback={
              <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
                ⚠️ Experimental feature is disabled. Showing fallback content.
              </div>
            }
          >
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              ✓ Experimental feature is enabled!
            </div>
          </FeatureEnabled>
        </div>
      </section>

      {/* Example 3: Inverted Logic */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">
          3. Inverted Logic (Show When Disabled)
        </h2>
        <div className="border rounded-lg p-6 bg-gray-50">
          <FeatureEnabled featureFlag="EXPERIMENTAL_FEATURE" invert>
            <div className="bg-gray-100 border border-gray-400 text-gray-700 px-4 py-3 rounded">
              Showing legacy content because the new feature is not enabled yet.
            </div>
          </FeatureEnabled>
        </div>
      </section>

      {/* Example 4: FeatureToggle Component */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">
          4. FeatureToggle Component (Client-side)
        </h2>
        <div className="border rounded-lg p-6 bg-gray-50">
          <FeatureToggle
            featureFlag="ADVANCED_ANALYTICS"
            whenEnabled={
              <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
                <h3 className="font-bold mb-2">New Dashboard</h3>
                <p>
                  You're seeing the new advanced analytics dashboard with
                  real-time data and insights.
                </p>
              </div>
            }
            whenDisabled={
              <div className="bg-gray-100 border border-gray-400 text-gray-700 px-4 py-3 rounded">
                <h3 className="font-bold mb-2">Classic Dashboard</h3>
                <p>
                  You're seeing the classic dashboard. Advanced analytics is not
                  enabled for your account.
                </p>
              </div>
            }
          />
        </div>
      </section>

      {/* Example 5: Role-based Features */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">
          5. Role-based Feature Access
        </h2>
        <div className="border rounded-lg p-6 bg-gray-50">
          <FeatureEnabled featureFlag="MULTIPLE_ALLOWANCES">
            <div className="bg-purple-100 border border-purple-400 text-purple-700 px-4 py-3 rounded">
              <h3 className="font-bold mb-2">Premium Feature</h3>
              <p>
                This feature is available to admins, testers, and 25% of regular
                users.
              </p>
            </div>
          </FeatureEnabled>
        </div>
      </section>

      {/* Example 6: Multiple Features */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">6. Multiple Features</h2>
        <div className="border rounded-lg p-6 bg-gray-50 space-y-4">
          <FeatureEnabled featureFlag="TEST_NEW_PRODUCTS_QUERY">
            <div className="bg-indigo-100 border border-indigo-400 text-indigo-700 px-4 py-3 rounded">
              ✓ New Products Query is enabled
            </div>
          </FeatureEnabled>

          <FeatureEnabled featureFlag="ADVANCED_ANALYTICS">
            <div className="bg-teal-100 border border-teal-400 text-teal-700 px-4 py-3 rounded">
              ✓ Advanced Analytics is enabled
            </div>
          </FeatureEnabled>

          <FeatureEnabled featureFlag="DISABLED_FEATURE">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              This should not appear (disabled feature)
            </div>
          </FeatureEnabled>
        </div>
      </section>

      <section className="mt-12 p-6 bg-blue-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">About These Examples</h2>
        <p className="text-gray-700">
          These examples demonstrate the feature flag system in action. The
          actual visibility depends on your user role and the configured feature
          flags. Check the code to see how each pattern is implemented.
        </p>
      </section>
    </div>
  )
}
