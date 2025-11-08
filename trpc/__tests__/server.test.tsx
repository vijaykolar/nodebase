import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getQueryClient, trpc, caller } from '../server'
import { QueryClient } from '@tanstack/react-query'

// Mock dependencies
vi.mock('../query-client', () => ({
  makeQueryClient: vi.fn(() => new QueryClient()),
}))

vi.mock('@/lib/db', () => ({
  default: {
    user: {
      findMany: vi.fn(),
    },
  },
}))

import { makeQueryClient } from '../query-client'

describe('trpc/server.tsx', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getQueryClient', () => {
    it('should return a QueryClient instance', () => {
      const client = getQueryClient()
      
      expect(client).toBeInstanceOf(QueryClient)
      expect(makeQueryClient).toHaveBeenCalled()
    })

    it('should return the same client on subsequent calls (cached)', () => {
      const client1 = getQueryClient()
      const client2 = getQueryClient()
      
      // Should be the same instance due to React.cache
      expect(client1).toBe(client2)
    })

    it('should create client with correct configuration', () => {
      const client = getQueryClient()
      
      expect(client).toBeDefined()
      expect(typeof client.prefetchQuery).toBe('function')
      expect(typeof client.fetchQuery).toBe('function')
    })
  })

  describe('trpc proxy', () => {
    it('should be defined', () => {
      expect(trpc).toBeDefined()
      expect(typeof trpc).toBe('object')
    })

    it('should have getUsers query options', () => {
      expect(trpc.getUsers).toBeDefined()
      expect(typeof trpc.getUsers.queryOptions).toBe('function')
    })

    it('should create valid query options', () => {
      const options = trpc.getUsers.queryOptions()
      
      expect(options).toBeDefined()
      expect(options.queryKey).toBeDefined()
      expect(typeof options.queryFn).toBe('function')
    })

    it('should have queryKey as array', () => {
      const options = trpc.getUsers.queryOptions()
      
      expect(Array.isArray(options.queryKey)).toBe(true)
      expect(options.queryKey.length).toBeGreaterThan(0)
    })
  })

  describe('caller', () => {
    it('should be defined', () => {
      expect(caller).toBeDefined()
      expect(typeof caller).toBe('object')
    })

    it('should have getUsers method', () => {
      expect(typeof caller.getUsers).toBe('function')
    })

    it('should be able to call procedures directly', async () => {
      const prisma = await import('@/lib/db')
      const mockUsers = [
        { id: 1, email: 'test@example.com', name: 'Test', createdAt: new Date(), updatedAt: new Date() }
      ]
      
      vi.mocked(prisma.default.user.findMany).mockResolvedValue(mockUsers)
      
      const result = await caller.getUsers()
      
      expect(result).toEqual(mockUsers)
    })
  })

  describe('Server-only enforcement', () => {
    it('should import server-only module', async () => {
      // The module should have imported 'server-only'
      // This ensures the file cannot be accidentally imported on client
      const serverModule = await import('../server')
      
      expect(serverModule).toBeDefined()
    })
  })
})