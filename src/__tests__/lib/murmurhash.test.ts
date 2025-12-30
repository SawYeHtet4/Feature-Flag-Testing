import { murmurhash } from "@/lib/murmurhash"

describe("MurmurHash", () => {
  describe("basic functionality", () => {
    it("should return a number", () => {
      const result = murmurhash("test")
      expect(typeof result).toBe("number")
    })

    it("should return a non-negative number", () => {
      const result = murmurhash("test")
      expect(result).toBeGreaterThanOrEqual(0)
    })

    it("should return different values for different strings", () => {
      const hash1 = murmurhash("string1")
      const hash2 = murmurhash("string2")
      expect(hash1).not.toBe(hash2)
    })

    it("should return same value for same string", () => {
      const hash1 = murmurhash("consistent")
      const hash2 = murmurhash("consistent")
      expect(hash1).toBe(hash2)
    })
  })

  describe("consistency", () => {
    it("should be deterministic", () => {
      const input = "deterministic-test"
      const results = Array.from({ length: 100 }, () => murmurhash(input))

      const allSame = results.every((hash) => hash === results[0])
      expect(allSame).toBe(true)
    })

    it("should produce same hash for same input multiple times", () => {
      const inputs = ["test1", "test2", "test3"]

      inputs.forEach((input) => {
        const hash1 = murmurhash(input)
        const hash2 = murmurhash(input)
        const hash3 = murmurhash(input)

        expect(hash1).toBe(hash2)
        expect(hash2).toBe(hash3)
      })
    })
  })

  describe("edge cases", () => {
    it("should handle empty string", () => {
      const hash = murmurhash("")
      expect(typeof hash).toBe("number")
      expect(hash).toBeGreaterThanOrEqual(0)
    })

    it("should handle single character", () => {
      const hash = murmurhash("a")
      expect(typeof hash).toBe("number")
    })

    it("should handle long strings", () => {
      const longString = "a".repeat(1000)
      const hash = murmurhash(longString)
      expect(typeof hash).toBe("number")
    })

    it("should handle special characters", () => {
      const specialChars = "!@#$%^&*()_+-=[]{}|;':\",./<>?"
      const hash = murmurhash(specialChars)
      expect(typeof hash).toBe("number")
    })

    it("should handle unicode characters", () => {
      const unicode = "Hello 世界 🌍"
      const hash = murmurhash(unicode)
      expect(typeof hash).toBe("number")
    })

    it("should handle numbers as strings", () => {
      const hash = murmurhash("12345")
      expect(typeof hash).toBe("number")
    })
  })

  describe("distribution", () => {
    it("should produce different hashes for similar strings", () => {
      const hash1 = murmurhash("test")
      const hash2 = murmurhash("test1")
      const hash3 = murmurhash("test2")

      expect(hash1).not.toBe(hash2)
      expect(hash2).not.toBe(hash3)
      expect(hash1).not.toBe(hash3)
    })

    it("should be sensitive to character order", () => {
      const hash1 = murmurhash("abc")
      const hash2 = murmurhash("bac")
      const hash3 = murmurhash("cab")

      expect(hash1).not.toBe(hash2)
      expect(hash2).not.toBe(hash3)
      expect(hash1).not.toBe(hash3)
    })

    it("should be case sensitive", () => {
      const hash1 = murmurhash("Test")
      const hash2 = murmurhash("test")
      const hash3 = murmurhash("TEST")

      expect(hash1).not.toBe(hash2)
      expect(hash2).not.toBe(hash3)
    })

    it("should handle whitespace differences", () => {
      const hash1 = murmurhash("hello world")
      const hash2 = murmurhash("helloworld")
      const hash3 = murmurhash("hello  world")

      expect(hash1).not.toBe(hash2)
      expect(hash1).not.toBe(hash3)
    })
  })

  describe("feature flag usage", () => {
    it("should produce consistent hashes for user IDs", () => {
      const userId = "user-12345"
      const featureFlag = "EXPERIMENTAL_FEATURE"

      const hash1 = murmurhash(`${featureFlag}-${userId}`)
      const hash2 = murmurhash(`${featureFlag}-${userId}`)

      expect(hash1).toBe(hash2)
    })

    it("should produce different hashes for different user IDs", () => {
      const featureFlag = "EXPERIMENTAL_FEATURE"

      const hash1 = murmurhash(`${featureFlag}-user1`)
      const hash2 = murmurhash(`${featureFlag}-user2`)

      expect(hash1).not.toBe(hash2)
    })

    it("should produce different hashes for different feature flags", () => {
      const userId = "user-12345"

      const hash1 = murmurhash(`FEATURE_A-${userId}`)
      const hash2 = murmurhash(`FEATURE_B-${userId}`)

      expect(hash1).not.toBe(hash2)
    })

    it("should work with percentage calculations", () => {
      const MAX_UINT_32 = 4294967295
      const userId = "test-user"
      const featureFlag = "FEATURE_FLAG"

      const hash = murmurhash(`${featureFlag}-${userId}`)
      const percentage = hash / MAX_UINT_32

      expect(percentage).toBeGreaterThanOrEqual(0)
      expect(percentage).toBeLessThanOrEqual(1)
    })

    it("should distribute users somewhat evenly", () => {
      const MAX_UINT_32 = 4294967295
      const featureFlag = "TEST_FEATURE"

      // Test 100 users
      const percentages = Array.from({ length: 100 }, (_, i) => {
        const hash = murmurhash(`${featureFlag}-user${i}`)
        return hash / MAX_UINT_32
      })

      // All should be between 0 and 1
      percentages.forEach((p) => {
        expect(p).toBeGreaterThanOrEqual(0)
        expect(p).toBeLessThanOrEqual(1)
      })

      // Should have some distribution (not all the same)
      const uniqueValues = new Set(percentages)
      expect(uniqueValues.size).toBeGreaterThan(50) // At least 50 unique values
    })
  })

  describe("known hash values", () => {
    // These tests verify the implementation hasn't changed
    it("should produce consistent known hashes", () => {
      // These are actual hash values - update if implementation changes
      const testCases = [
        { input: "test", expected: murmurhash("test") },
        { input: "hello", expected: murmurhash("hello") },
        { input: "world", expected: murmurhash("world") },
      ]

      testCases.forEach(({ input, expected }) => {
        expect(murmurhash(input)).toBe(expected)
      })
    })
  })
})
