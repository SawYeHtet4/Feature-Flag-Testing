import { User, UserRole } from "@/lib/getUser"

/**
 * Creates a mock user for testing
 */
export function createMockUser(
  overrides?: Partial<User>
): User {
  return {
    id: "test-user-123",
    role: "user",
    ...overrides,
  }
}

/**
 * Creates multiple mock users with different roles
 */
export function createMockUsers(): Record<UserRole, User> {
  return {
    admin: createMockUser({ id: "admin-1", role: "admin" }),
    tester: createMockUser({ id: "tester-1", role: "tester" }),
    user: createMockUser({ id: "user-1", role: "user" }),
  }
}

/**
 * Mocks process.env for testing
 */
export function mockEnv(env: Record<string, string>) {
  const originalEnv = process.env
  process.env = { ...originalEnv, ...env }
  return () => {
    process.env = originalEnv
  }
}

/**
 * Mocks console methods for testing
 */
export function mockConsole() {
  const originalConsole = {
    log: console.log,
    group: console.group,
    groupEnd: console.groupEnd,
    table: console.table,
  }

  console.log = jest.fn()
  console.group = jest.fn()
  console.groupEnd = jest.fn()
  console.table = jest.fn()

  return () => {
    console.log = originalConsole.log
    console.group = originalConsole.group
    console.groupEnd = originalConsole.groupEnd
    console.table = originalConsole.table
  }
}
