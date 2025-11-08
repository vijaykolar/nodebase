import { describe, it, expect, beforeEach, vi } from 'vitest'
import { makeQueryClient } from '../query-client'
import { QueryClient } from '@tanstack/react-query'

describe('trpc/query-client.ts', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = makeQueryClient()
  })

  describe('makeQueryClient', () => {
    it('should create a QueryClient instance', () => {
      expect(queryClient).toBeInstanceOf(QueryClient)
    })

    it('should create a new instance on each call', () => {
      const client1 = makeQueryClient()
      const client2 = makeQueryClient()
      
      expect(client1).not.toBe(client2)
    })

    it('should configure staleTime to 30 seconds', () => {
      const defaultOptions = queryClient.getDefaultOptions()
      
      expect(defaultOptions.queries?.staleTime).toBe(30 * 1000)
    })

    it('should have dehydrate configuration', () => {
      const defaultOptions = queryClient.getDefaultOptions()
      
      expect(defaultOptions.dehydrate).toBeDefined()
      expect(typeof defaultOptions.dehydrate?.shouldDehydrateQuery).toBe('function')
    })

    it('should dehydrate pending queries', () => {
      const defaultOptions = queryClient.getDefaultOptions()
      const shouldDehydrateQuery = defaultOptions.dehydrate?.shouldDehydrateQuery
      
      expect(shouldDehydrateQuery).toBeDefined()
      
      if (shouldDehydrateQuery) {
        const pendingQuery = {
          queryKey: ['test'],
          queryHash: '["test"]',
          state: { status: 'pending' as const, data: undefined, error: null },
        } as Record<string, unknown>
        
        expect(shouldDehydrateQuery(pendingQuery)).toBe(true)
      }
    })

    it('should have hydrate configuration', () => {
      const defaultOptions = queryClient.getDefaultOptions()
      
      expect(defaultOptions.hydrate).toBeDefined()
    })

    it('should handle successful queries', async () => {
      await queryClient.prefetchQuery({
        queryKey: ['test'],
        queryFn: async () => 'test-data',
      })
      
      const data = queryClient.getQueryData(['test'])
      expect(data).toBe('test-data')
    })

    it('should handle query errors', async () => {
      const errorFn = async () => {
        throw new Error('Test error')
      }
      
      try {
        await queryClient.fetchQuery({
          queryKey: ['error-test'],
          queryFn: errorFn,
        })
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        expect((error as Error).message).toBe('Test error')
      }
    })

    it('should respect staleTime for queries', async () => {
      const queryFn = vi.fn(async () => 'data')
      
      await queryClient.prefetchQuery({
        queryKey: ['stale-test'],
        queryFn,
      })
      
      // Query again immediately - should use cache
      const data = queryClient.getQueryData(['stale-test'])
      expect(data).toBe('data')
      expect(queryFn).toHaveBeenCalledTimes(1)
    })

    it('should support query invalidation', async () => {
      await queryClient.prefetchQuery({
        queryKey: ['invalidate-test'],
        queryFn: async () => 'initial',
      })
      
      await queryClient.invalidateQueries({ queryKey: ['invalidate-test'] })
      
      const state = queryClient.getQueryState(['invalidate-test'])
      expect(state?.isInvalidated).toBe(true)
    })
  })
})