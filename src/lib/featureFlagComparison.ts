import { canViewFeature, FeatureFlagName, FEATURE_FLAGS } from "./featureFlags"
import { User } from "./getUser"
import { FeatureFlagComparison, FeatureFlagSnapshot } from "@/types/featureFlagTypes"
import { getFeatureFlagSummary } from "./featureFlagHelpers"

/**
 * Compare feature flag states between two users
 */
export function compareUsers(user1: User, user2: User): FeatureFlagComparison[] {
  const allFlags = Object.keys(FEATURE_FLAGS) as FeatureFlagName[]

  return allFlags.map((flag) => {
    const user1State = canViewFeature(flag, user1)
    const user2State = canViewFeature(flag, user2)

    return {
      flag,
      user1State,
      user2State,
      different: user1State !== user2State,
    }
  })
}

/**
 * Get only the differences between two users
 */
export function getUserDifferences(
  user1: User,
  user2: User
): FeatureFlagComparison[] {
  return compareUsers(user1, user2).filter((comparison) => comparison.different)
}

/**
 * Get flags that are enabled for user1 but not user2
 */
export function getExclusiveFlags(user1: User, user2: User): FeatureFlagName[] {
  return compareUsers(user1, user2)
    .filter((c) => c.user1State && !c.user2State)
    .map((c) => c.flag)
}

/**
 * Get flags that are enabled for both users
 */
export function getSharedFlags(user1: User, user2: User): FeatureFlagName[] {
  return compareUsers(user1, user2)
    .filter((c) => c.user1State && c.user2State)
    .map((c) => c.flag)
}

/**
 * Calculate similarity percentage between two users
 */
export function calculateSimilarity(user1: User, user2: User): number {
  const comparisons = compareUsers(user1, user2)
  const sameCount = comparisons.filter((c) => !c.different).length

  return (sameCount / comparisons.length) * 100
}

/**
 * Create a snapshot of user's feature flag state
 */
export function createSnapshot(user: User): FeatureFlagSnapshot {
  return {
    user,
    flags: getFeatureFlagSummary(user),
    timestamp: new Date(),
  }
}

/**
 * Compare two snapshots
 */
export function compareSnapshots(
  snapshot1: FeatureFlagSnapshot,
  snapshot2: FeatureFlagSnapshot
): {
  added: FeatureFlagName[]
  removed: FeatureFlagName[]
  changed: FeatureFlagName[]
  unchanged: FeatureFlagName[]
  timeDelta: number
} {
  const allFlags = Object.keys(FEATURE_FLAGS) as FeatureFlagName[]

  const added: FeatureFlagName[] = []
  const removed: FeatureFlagName[] = []
  const changed: FeatureFlagName[] = []
  const unchanged: FeatureFlagName[] = []

  allFlags.forEach((flag) => {
    const state1 = snapshot1.flags[flag]
    const state2 = snapshot2.flags[flag]

    if (state1 === undefined && state2 !== undefined) {
      added.push(flag)
    } else if (state1 !== undefined && state2 === undefined) {
      removed.push(flag)
    } else if (state1 !== state2) {
      changed.push(flag)
    } else {
      unchanged.push(flag)
    }
  })

  const timeDelta = snapshot2.timestamp.getTime() - snapshot1.timestamp.getTime()

  return {
    added,
    removed,
    changed,
    unchanged,
    timeDelta,
  }
}

/**
 * Generate a comparison report
 */
export function generateComparisonReport(user1: User, user2: User): string {
  const comparisons = compareUsers(user1, user2)
  const differences = comparisons.filter((c) => c.different)
  const similarities = comparisons.filter((c) => !c.different)
  const similarity = calculateSimilarity(user1, user2)

  let report = "Feature Flag Comparison Report\n"
  report += "================================\n\n"
  report += `User 1: ${user1.id} (${user1.role})\n`
  report += `User 2: ${user2.id} (${user2.role})\n\n`
  report += `Similarity: ${similarity.toFixed(1)}%\n`
  report += `Total Flags: ${comparisons.length}\n`
  report += `Same: ${similarities.length}\n`
  report += `Different: ${differences.length}\n\n`

  if (differences.length > 0) {
    report += "Differences:\n"
    report += "------------\n"
    differences.forEach((diff) => {
      report += `${diff.flag}:\n`
      report += `  User 1: ${diff.user1State ? "✓" : "✗"}\n`
      report += `  User 2: ${diff.user2State ? "✓" : "✗"}\n\n`
    })
  }

  const exclusive1 = getExclusiveFlags(user1, user2)
  if (exclusive1.length > 0) {
    report += `Exclusive to User 1 (${exclusive1.length}):\n`
    exclusive1.forEach((flag) => {
      report += `  - ${flag}\n`
    })
    report += "\n"
  }

  const exclusive2 = getExclusiveFlags(user2, user1)
  if (exclusive2.length > 0) {
    report += `Exclusive to User 2 (${exclusive2.length}):\n`
    exclusive2.forEach((flag) => {
      report += `  - ${flag}\n`
    })
    report += "\n"
  }

  const shared = getSharedFlags(user1, user2)
  if (shared.length > 0) {
    report += `Shared Flags (${shared.length}):\n`
    shared.forEach((flag) => {
      report += `  - ${flag}\n`
    })
  }

  return report
}

/**
 * Compare a user against multiple users
 */
export function compareUserAgainstMany(
  targetUser: User,
  users: User[]
): Map<string, FeatureFlagComparison[]> {
  const results = new Map<string, FeatureFlagComparison[]>()

  users.forEach((user) => {
    results.set(user.id, compareUsers(targetUser, user))
  })

  return results
}

/**
 * Find users with similar feature flag access
 */
export function findSimilarUsers(
  targetUser: User,
  users: User[],
  minSimilarity: number = 80
): Array<{ user: User; similarity: number }> {
  return users
    .map((user) => ({
      user,
      similarity: calculateSimilarity(targetUser, user),
    }))
    .filter((result) => result.similarity >= minSimilarity)
    .sort((a, b) => b.similarity - a.similarity)
}

/**
 * Export comparison as JSON
 */
export function exportComparisonJSON(user1: User, user2: User): string {
  const comparison = {
    users: {
      user1: { id: user1.id, role: user1.role },
      user2: { id: user2.id, role: user2.role },
    },
    similarity: calculateSimilarity(user1, user2),
    comparisons: compareUsers(user1, user2),
    differences: getUserDifferences(user1, user2),
    exclusive: {
      user1: getExclusiveFlags(user1, user2),
      user2: getExclusiveFlags(user2, user1),
    },
    shared: getSharedFlags(user1, user2),
    timestamp: new Date().toISOString(),
  }

  return JSON.stringify(comparison, null, 2)
}
