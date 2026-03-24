import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchHolidaysFromAPI } from '../src/api'

describe('fetchHolidaysFromAPI', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('returns holidays from the API', async () => {
    const mockData = [
      { date: '2024-01-01', name: 'Confraternização mundial', type: 'national' },
      { date: '2024-04-21', name: 'Tiradentes', type: 'national' },
    ]

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    } as Response)

    const result = await fetchHolidaysFromAPI(2024)

    expect(result).toEqual(mockData)
    expect(fetch).toHaveBeenCalledWith('https://brasilapi.com.br/api/feriados/v1/2024')
  })

  it('defaults type to national when missing', async () => {
    const mockData = [{ date: '2024-01-01', name: 'Test' }]

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    } as Response)

    const result = await fetchHolidaysFromAPI(2024)
    expect(result[0].type).toBe('national')
  })

  it('throws APIError on non-ok response', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
      statusText: 'Not Found',
    } as Response)

    await expect(fetchHolidaysFromAPI(1800)).rejects.toThrow('Failed to fetch holidays')
  })

  it('throws APIError on network failure', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('ECONNREFUSED'))

    await expect(fetchHolidaysFromAPI(2024)).rejects.toThrow('Network error')
  })
})
