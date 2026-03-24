import { describe, it, expect } from 'vitest'
import { InvalidDateError, InvalidYearError, APIError } from '../src/types'

describe('Custom error classes', () => {
  it('InvalidDateError has correct name and message', () => {
    const err = new InvalidDateError('bad date')
    expect(err).toBeInstanceOf(Error)
    expect(err).toBeInstanceOf(InvalidDateError)
    expect(err.name).toBe('InvalidDateError')
    expect(err.message).toBe('bad date')
  })

  it('InvalidYearError has correct name and message', () => {
    const err = new InvalidYearError('bad year')
    expect(err).toBeInstanceOf(Error)
    expect(err).toBeInstanceOf(InvalidYearError)
    expect(err.name).toBe('InvalidYearError')
    expect(err.message).toBe('bad year')
  })

  it('APIError has correct name and message', () => {
    const err = new APIError('api down')
    expect(err).toBeInstanceOf(Error)
    expect(err).toBeInstanceOf(APIError)
    expect(err.name).toBe('APIError')
    expect(err.message).toBe('api down')
  })
})
