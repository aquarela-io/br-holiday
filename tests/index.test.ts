import { describe, it, expect } from 'vitest'
import { getHolidays, isHoliday } from '../src/index'

describe('getHolidays', () => {
  it('returns holidays for a year with static data (2025)', async () => {
    const holidays = await getHolidays(2025)
    expect(holidays).toBeInstanceOf(Array)
    expect(holidays.length).toBeGreaterThan(0)
    expect(holidays[0]).toHaveProperty('date')
    expect(holidays[0]).toHaveProperty('name')
    expect(holidays[0]).toHaveProperty('type')
  })

  it('returns holidays for 2026 from static data', async () => {
    const holidays = await getHolidays(2026)
    expect(holidays.length).toBe(13)
  })

  it('returns a defensive copy, not the original array', async () => {
    const a = await getHolidays(2025)
    const b = await getHolidays(2025)
    expect(a).not.toBe(b)
    expect(a).toEqual(b)
  })

  it('throws InvalidYearError for year below 1900', async () => {
    await expect(getHolidays(1899)).rejects.toThrow('Year must be between 1900 and 2100')
  })

  it('throws InvalidYearError for year above 2100', async () => {
    await expect(getHolidays(2101)).rejects.toThrow('Year must be between 1900 and 2100')
  })

  it('throws InvalidYearError for non-integer year', async () => {
    await expect(getHolidays(2025.5)).rejects.toThrow('Year must be between 1900 and 2100')
  })

  it('throws InvalidYearError for NaN', async () => {
    await expect(getHolidays(NaN)).rejects.toThrow('Year must be between 1900 and 2100')
  })
})

describe('isHoliday', () => {
  // Fixed holidays
  it('returns true for Confraternização Universal (Jan 1)', async () => {
    expect(await isHoliday('2025-01-01')).toBe(true)
  })

  it('returns true for Tiradentes (Apr 21)', async () => {
    expect(await isHoliday('2025-04-21')).toBe(true)
  })

  it('returns true for Dia do Trabalho (May 1)', async () => {
    expect(await isHoliday('2025-05-01')).toBe(true)
  })

  it('returns true for Independência (Sep 7)', async () => {
    expect(await isHoliday('2025-09-07')).toBe(true)
  })

  it('returns true for Nossa Senhora Aparecida (Oct 12)', async () => {
    expect(await isHoliday('2025-10-12')).toBe(true)
  })

  it('returns true for Finados (Nov 2)', async () => {
    expect(await isHoliday('2025-11-02')).toBe(true)
  })

  it('returns true for Proclamação da República (Nov 15)', async () => {
    expect(await isHoliday('2025-11-15')).toBe(true)
  })

  it('returns true for Natal (Dec 25)', async () => {
    expect(await isHoliday('2025-12-25')).toBe(true)
  })

  // Movable holidays (2025)
  it('returns true for Carnaval 2025 (Mar 4)', async () => {
    expect(await isHoliday('2025-03-04')).toBe(true)
  })

  it('returns true for Sexta-feira Santa 2025 (Apr 18)', async () => {
    expect(await isHoliday('2025-04-18')).toBe(true)
  })

  it('returns true for Corpus Christi 2025 (Jun 19)', async () => {
    expect(await isHoliday('2025-06-19')).toBe(true)
  })

  // Movable holidays (2026) — different dates
  it('returns true for Carnaval 2026 (Feb 17)', async () => {
    expect(await isHoliday('2026-02-17')).toBe(true)
  })

  it('returns true for Corpus Christi 2026 (Jun 4)', async () => {
    expect(await isHoliday('2026-06-04')).toBe(true)
  })

  // Non-holidays
  it('returns false for a regular weekday (Jan 2)', async () => {
    expect(await isHoliday('2025-01-02')).toBe(false)
  })

  it('returns false for Dec 31', async () => {
    expect(await isHoliday('2025-12-31')).toBe(false)
  })

  it('returns false for a random date (Jun 15)', async () => {
    expect(await isHoliday('2025-06-15')).toBe(false)
  })

  // Date object input
  it('accepts a Date object', async () => {
    const date = new Date(2025, 0, 1) // Jan 1, 2025
    expect(await isHoliday(date)).toBe(true)
  })

  it('accepts an ISO string', async () => {
    expect(await isHoliday('2025-12-25T00:00:00')).toBe(true)
  })

  // Invalid input
  it('throws InvalidDateError for garbage string', async () => {
    await expect(isHoliday('not-a-date')).rejects.toThrow('Invalid date format')
  })

  it('throws InvalidDateError for empty string', async () => {
    await expect(isHoliday('')).rejects.toThrow('Invalid date format')
  })
})
