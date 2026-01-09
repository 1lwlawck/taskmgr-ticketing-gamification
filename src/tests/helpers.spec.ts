import { describe, it, expect } from 'vitest'
import { generateId, generateCode, formatDate, formatDateTime, randomFromList } from '@/utils/helpers'

describe('helpers', () => {
  describe('generateId', () => {
    it('should generate id with default prefix', () => {
      const id = generateId()
      expect(id).toMatch(/^id-[a-z0-9]+-[a-z0-9]+$/)
    })

    it('should generate id with custom prefix', () => {
      const id = generateId('ticket')
      expect(id).toMatch(/^ticket-[a-z0-9]+-[a-z0-9]+$/)
    })

    it('should generate unique ids', () => {
      const ids = new Set(Array.from({ length: 100 }, () => generateId()))
      expect(ids.size).toBe(100)
    })
  })

  describe('generateCode', () => {
    it('should generate code with default length of 6', () => {
      const code = generateCode()
      expect(code).toHaveLength(6)
    })

    it('should generate code with custom length', () => {
      const code = generateCode(8)
      expect(code).toHaveLength(8)
    })

    it('should only contain allowed characters', () => {
      const code = generateCode(100)
      expect(code).toMatch(/^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]+$/)
    })
  })

  describe('formatDate', () => {
    it('should format date string', () => {
      const result = formatDate('2024-01-15')
      expect(result).toContain('2024')
      expect(result).toContain('15')
    })

    it('should format Date object', () => {
      const date = new Date('2024-06-20')
      const result = formatDate(date)
      expect(result).toContain('2024')
    })

    it('should use current date when no value provided', () => {
      const result = formatDate()
      const now = new Date()
      expect(result).toContain(now.getFullYear().toString())
    })
  })

  describe('formatDateTime', () => {
    it('should return dash for undefined', () => {
      expect(formatDateTime()).toBe('-')
    })

    it('should return dash for invalid date', () => {
      expect(formatDateTime('invalid')).toBe('-')
    })

    it('should format valid date', () => {
      const result = formatDateTime('2024-03-15T10:30:00')
      expect(result).toContain('2024')
    })
  })

  describe('randomFromList', () => {
    it('should return undefined for empty array', () => {
      expect(randomFromList([])).toBeUndefined()
    })

    it('should return item from array', () => {
      const items = ['a', 'b', 'c']
      const result = randomFromList(items)
      expect(items).toContain(result)
    })
  })
})
