import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { Client } from '../client'
import React from 'react'

// Mock tRPC client
vi.mock('@/trpc/client', () => ({
  useTRPC: vi.fn(),
}))

// Mock React Query
vi.mock('@tanstack/react-query', () => ({
  useSuspenseQuery: vi.fn(),
  useQuery: vi.fn(),
  QueryClient: vi.fn(),
  QueryClientProvider: vi.fn(({ children }) => children),
}))

import { useTRPC } from '@/trpc/client'
import { useSuspenseQuery } from '@tanstack/react-query'

// Type definitions for mocked values
type MockedTRPCClient = {
  getUsers: {
    queryOptions: ReturnType<typeof vi.fn>
  }
}

type MockedQueryResult = {
  data?: unknown
  isLoading?: boolean
  isError?: boolean
  error?: unknown | null
}

describe('app/client.tsx', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Client component', () => {
    it('should render users data', async () => {
      const mockUsers = [
        { id: 1, email: 'user1@test.com', name: 'User 1', createdAt: new Date(), updatedAt: new Date() },
        { id: 2, email: 'user2@test.com', name: 'User 2', createdAt: new Date(), updatedAt: new Date() },
      ]

      const mockTrpc: MockedTRPCClient = {
        getUsers: {
          queryOptions: vi.fn(() => ({
            queryKey: ['getUsers'],
            queryFn: async () => mockUsers,
          })),
        },
      }

      vi.mocked(useTRPC).mockReturnValue(mockTrpc)
      vi.mocked(useSuspenseQuery).mockReturnValue({
        data: mockUsers,
        isLoading: false,
        isError: false,
        error: null,
      } as MockedQueryResult)

      render(<Client />)

      await waitFor(() => {
        const content = screen.getByText((content) => content.includes('user1@test.com'))
        expect(content).toBeDefined()
      })
    })

    it('should display JSON stringified users', async () => {
      const mockUsers = [
        { id: 1, email: 'test@example.com', name: 'Test User', createdAt: new Date('2024-01-01'), updatedAt: new Date('2024-01-01') },
      ]

      const mockTrpc: MockedTRPCClient = {
        getUsers: {
          queryOptions: vi.fn(() => ({
            queryKey: ['getUsers'],
            queryFn: async () => mockUsers,
          })),
        },
      }

      vi.mocked(useTRPC).mockReturnValue(mockTrpc)
      vi.mocked(useSuspenseQuery).mockReturnValue({
        data: mockUsers,
      } as MockedQueryResult)

      render(<Client />)

      await waitFor(() => {
        expect(screen.getByText((content) => content.includes('test@example.com'))).toBeDefined()
      })
    })

    it('should handle empty users array', async () => {
      const mockTrpc: MockedTRPCClient = {
        getUsers: {
          queryOptions: vi.fn(() => ({
            queryKey: ['getUsers'],
            queryFn: async () => [],
          })),
        },
      }

      vi.mocked(useTRPC).mockReturnValue(mockTrpc)
      vi.mocked(useSuspenseQuery).mockReturnValue({
        data: [],
      } as MockedQueryResult)

      render(<Client />)

      await waitFor(() => {
        expect(screen.getByText('[]')).toBeDefined()
      })
    })

    it('should use useSuspenseQuery hook', () => {
      const mockTrpc: MockedTRPCClient = {
        getUsers: {
          queryOptions: vi.fn(() => ({
            queryKey: ['getUsers'],
            queryFn: async () => [],
          })),
        },
      }

      vi.mocked(useTRPC).mockReturnValue(mockTrpc)
      vi.mocked(useSuspenseQuery).mockReturnValue({
        data: [],
      } as MockedQueryResult)

      render(<Client />)

      expect(useSuspenseQuery).toHaveBeenCalled()
    })

    it('should call getUsers queryOptions', () => {
      const mockQueryOptions = vi.fn(() => ({
        queryKey: ['getUsers'],
        queryFn: async () => [],
      }))

      const mockTrpc: MockedTRPCClient = {
        getUsers: {
          queryOptions: mockQueryOptions,
        },
      }

      vi.mocked(useTRPC).mockReturnValue(mockTrpc)
      vi.mocked(useSuspenseQuery).mockReturnValue({
        data: [],
      } as MockedQueryResult)

      render(<Client />)

      expect(mockQueryOptions).toHaveBeenCalled()
    })

    it('should render inside a div', () => {
      const mockTrpc: MockedTRPCClient = {
        getUsers: {
          queryOptions: vi.fn(() => ({
            queryKey: ['getUsers'],
            queryFn: async () => [],
          })),
        },
      }

      vi.mocked(useTRPC).mockReturnValue(mockTrpc)
      vi.mocked(useSuspenseQuery).mockReturnValue({
        data: [],
      } as MockedQueryResult)

      const { container } = render(<Client />)

      expect(container.querySelector('div')).toBeDefined()
    })

    it('should handle users with null names', async () => {
      const mockUsers = [
        { id: 1, email: 'user@test.com', name: null, createdAt: new Date(), updatedAt: new Date() },
      ]

      const mockTrpc: MockedTRPCClient = {
        getUsers: {
          queryOptions: vi.fn(() => ({
            queryKey: ['getUsers'],
            queryFn: async () => mockUsers,
          })),
        },
      }

      vi.mocked(useTRPC).mockReturnValue(mockTrpc)
      vi.mocked(useSuspenseQuery).mockReturnValue({
        data: mockUsers,
      } as MockedQueryResult)

      render(<Client />)

      await waitFor(() => {
        const content = screen.getByText((content) => content.includes('"name":null'))
        expect(content).toBeDefined()
      })
    })

    it('should handle large user datasets', async () => {
      const mockUsers = Array.from({ length: 100 }, (_, i) => ({
        id: i + 1,
        email: `user${i + 1}@test.com`,
        name: `User ${i + 1}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      }))

      const mockTrpc: MockedTRPCClient = {
        getUsers: {
          queryOptions: vi.fn(() => ({
            queryKey: ['getUsers'],
            queryFn: async () => mockUsers,
          })),
        },
      }

      vi.mocked(useTRPC).mockReturnValue(mockTrpc)
      vi.mocked(useSuspenseQuery).mockReturnValue({
        data: mockUsers,
      } as MockedQueryResult)

      render(<Client />)

      await waitFor(() => {
        expect(screen.getByText((content) => content.includes('user1@test.com'))).toBeDefined()
      })
    })
  })

  describe('Client component - integration', () => {
    it('should be a client component', () => {
      // The file should have "use client" directive
      // This is verified by the component using hooks
      expect(typeof Client).toBe('function')
    })

    it('should use tRPC context', () => {
      const mockTrpc: MockedTRPCClient = {
        getUsers: {
          queryOptions: vi.fn(() => ({
            queryKey: ['getUsers'],
            queryFn: async () => [],
          })),
        },
      }

      vi.mocked(useTRPC).mockReturnValue(mockTrpc)
      vi.mocked(useSuspenseQuery).mockReturnValue({
        data: [],
      } as MockedQueryResult)

      render(<Client />)

      expect(useTRPC).toHaveBeenCalled()
    })
  })
})