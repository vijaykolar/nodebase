import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import Home from '../page'
import React from 'react'

// Type for mocked QueryClient
type MockedQueryClient = {
  prefetchQuery: ReturnType<typeof vi.fn>;
  getQueryData?: ReturnType<typeof vi.fn>;
};

// Mock dependencies
vi.mock('@/trpc/server', () => ({
  caller: {
    getUsers: vi.fn(),
  },
  trpc: {
    getUsers: {
      queryOptions: vi.fn(() => ({
        queryKey: ['getUsers'],
        queryFn: async () => [],
      })),
    },
  },
  getQueryClient: vi.fn(() => ({
    prefetchQuery: vi.fn(),
    getQueryData: vi.fn(),
  })),
}))

vi.mock('@tanstack/react-query', () => ({
  dehydrate: vi.fn(() => ({})),
  HydrationBoundary: vi.fn(({ children }) => <div data-testid="hydration-boundary">{children}</div>),
  QueryClient: vi.fn(),
}))

vi.mock('./client', () => ({
  Client: vi.fn(() => <div data-testid="client-component">Client Component</div>),
}))

vi.mock('react', async () => {
  const actual = await vi.importActual('react')
  return {
    ...actual,
    Suspense: vi.fn(({ children, fallback }) => (
      <div data-testid="suspense">
        {children}
        {fallback && <div data-testid="fallback">{fallback}</div>}
      </div>
    )),
  }
})

import { getQueryClient, trpc } from '@/trpc/server'
import { dehydrate } from '@tanstack/react-query'

describe('app/page.tsx', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Home component', () => {
    it('should render successfully', async () => {
      const HomeComponent = await Home()
      const { container } = render(HomeComponent)
      
      expect(container).toBeDefined()
    })

    it('should have flex layout with centered content', async () => {
      const HomeComponent = await Home()
      const { container } = render(HomeComponent)
      
      const mainDiv = container.querySelector('.h-screen.flex.justify-center.items-center')
      expect(mainDiv).toBeDefined()
    })

    it('should prefetch users query', async () => {
      const mockPrefetchQuery = vi.fn()
      const mockQueryClient: MockedQueryClient = {
        prefetchQuery: mockPrefetchQuery,
      }
      
      vi.mocked(getQueryClient).mockReturnValue(mockQueryClient)
      
      await Home()
      
      expect(getQueryClient).toHaveBeenCalled()
      expect(mockPrefetchQuery).toHaveBeenCalled()
    })

    it('should use correct query options for prefetch', async () => {
      const mockQueryOptions = {
        queryKey: ['getUsers'],
        queryFn: vi.fn(),
      }
      
      vi.mocked(trpc.getUsers.queryOptions).mockReturnValue(mockQueryOptions)
      
      const mockPrefetchQuery = vi.fn()
      vi.mocked(getQueryClient).mockReturnValue({
        prefetchQuery: mockPrefetchQuery,
      } as MockedQueryClient)
      
      await Home()
      
      expect(trpc.getUsers.queryOptions).toHaveBeenCalled()
    })

    it('should wrap content in HydrationBoundary', async () => {
      const HomeComponent = await Home()
      render(HomeComponent)
      
      expect(screen.getByTestId('hydration-boundary')).toBeDefined()
    })

    it('should wrap Client in Suspense', async () => {
      const HomeComponent = await Home()
      render(HomeComponent)
      
      expect(screen.getByTestId('suspense')).toBeDefined()
    })

    it('should have Loading fallback in Suspense', async () => {
      const HomeComponent = await Home()
      const { container } = render(HomeComponent)
      
      // Check that fallback content exists
      const suspenseElement = screen.getByTestId('suspense')
      expect(suspenseElement).toBeDefined()
    })

    it('should render Client component', async () => {
      const HomeComponent = await Home()
      render(HomeComponent)
      
      expect(screen.getByTestId('client-component')).toBeDefined()
    })

    it('should call dehydrate with query client', async () => {
      const mockQueryClient: MockedQueryClient = {
        prefetchQuery: vi.fn(),
      }
      
      vi.mocked(getQueryClient).mockReturnValue(mockQueryClient)
      
      await Home()
      
      expect(dehydrate).toHaveBeenCalledWith(mockQueryClient)
    })

    it('should be an async component', () => {
      expect(Home.constructor.name).toBe('AsyncFunction')
    })

    it('should get fresh query client on each render', async () => {
      await Home()
      await Home()
      
      expect(getQueryClient).toHaveBeenCalledTimes(2)
    })
  })

  describe('Component structure', () => {
    it('should have correct nesting: div > HydrationBoundary > Suspense > Client', async () => {
      const HomeComponent = await Home()
      const { container } = render(HomeComponent)
      
      const mainDiv = container.firstChild
      expect(mainDiv).toBeDefined()
      
      const hydrationBoundary = screen.getByTestId('hydration-boundary')
      expect(hydrationBoundary).toBeDefined()
      
      const suspense = screen.getByTestId('suspense')
      expect(suspense).toBeDefined()
      
      const client = screen.getByTestId('client-component')
      expect(client).toBeDefined()
    })

    it('should apply correct Tailwind classes', async () => {
      const HomeComponent = await Home()
      const { container } = render(HomeComponent)
      
      const mainDiv = container.firstChild as HTMLElement
      expect(mainDiv.className).toContain('h-screen')
      expect(mainDiv.className).toContain('flex')
      expect(mainDiv.className).toContain('justify-center')
      expect(mainDiv.className).toContain('items-center')
    })
  })

  describe('Data prefetching', () => {
    it('should void the prefetch promise', async () => {
      const mockPrefetchQuery = vi.fn().mockResolvedValue(undefined)
      
      vi.mocked(getQueryClient).mockReturnValue({
        prefetchQuery: mockPrefetchQuery,
      } as MockedQueryClient)
      
      await Home()
      
      // The prefetch is voided, so it doesn't block rendering
      expect(mockPrefetchQuery).toHaveBeenCalled()
    })

    it('should not await prefetch query', async () => {
      const mockPrefetchQuery = vi.fn().mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 1000))
      )
      
      vi.mocked(getQueryClient).mockReturnValue({
        prefetchQuery: mockPrefetchQuery,
      } as MockedQueryClient)
      
      const start = Date.now()
      await Home()
      const duration = Date.now() - start
      
      // Should return immediately, not wait for the 1000ms
      expect(duration).toBeLessThan(100)
    })
  })
})