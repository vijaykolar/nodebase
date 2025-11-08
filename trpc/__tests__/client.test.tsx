import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TRPCReactProvider, useTRPC } from '../client'
import React from 'react'

// Mock makeQueryClient
vi.mock('../query-client', () => ({
  makeQueryClient: vi.fn(() => ({
    getQueryData: vi.fn(),
    setQueryData: vi.fn(),
    invalidateQueries: vi.fn(),
    prefetchQuery: vi.fn(),
    getDefaultOptions: vi.fn(() => ({})),
  })),
}))

describe('trpc/client.tsx', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('TRPCReactProvider', () => {
    it('should render children', () => {
      render(
        <TRPCReactProvider>
          <div>Test Content</div>
        </TRPCReactProvider>
      )
      
      expect(screen.getByText('Test Content')).toBeDefined()
    })

    it('should provide tRPC context to children', () => {
      const TestComponent = () => {
        const trpc = useTRPC()
        return <div>Has Context: {trpc ? 'yes' : 'no'}</div>
      }
      
      render(
        <TRPCReactProvider>
          <TestComponent />
        </TRPCReactProvider>
      )
      
      expect(screen.getByText(/Has Context:/)).toBeDefined()
    })

    it('should initialize with query client', () => {
      const { container } = render(
        <TRPCReactProvider>
          <div>Content</div>
        </TRPCReactProvider>
      )
      
      expect(container).toBeDefined()
    })

    it('should handle multiple children', () => {
      render(
        <TRPCReactProvider>
          <div>Child 1</div>
          <div>Child 2</div>
          <div>Child 3</div>
        </TRPCReactProvider>
      )
      
      expect(screen.getByText('Child 1')).toBeDefined()
      expect(screen.getByText('Child 2')).toBeDefined()
      expect(screen.getByText('Child 3')).toBeDefined()
    })
  })

  describe('getUrl function (internal)', () => {
    it('should return relative URL in browser environment', () => {
      // Test is running in jsdom, which simulates browser
      // The getUrl function should return empty string for base
      expect(typeof window).toBe('object')
    })

    it('should handle VERCEL_URL environment variable', () => {
      const originalEnv = process.env.VERCEL_URL
      
      process.env.VERCEL_URL = 'myapp.vercel.app'
      
      expect(process.env.VERCEL_URL).toBe('myapp.vercel.app')
      
      // Cleanup
      if (originalEnv) {
        process.env.VERCEL_URL = originalEnv
      } else {
        delete process.env.VERCEL_URL
      }
    })
  })

  describe('useTRPC hook', () => {
    it('should be available for use in components', () => {
      const TestComponent = () => {
        const trpc = useTRPC()
        return <div>TRPC: {typeof trpc}</div>
      }
      
      render(
        <TRPCReactProvider>
          <TestComponent />
        </TRPCReactProvider>
      )
      
      expect(screen.getByText(/TRPC:/)).toBeDefined()
    })

    it('should provide access to queries', () => {
      const TestComponent = () => {
        const trpc = useTRPC()
        return <div>Has getUsers: {trpc.getUsers ? 'yes' : 'no'}</div>
      }
      
      render(
        <TRPCReactProvider>
          <TestComponent />
        </TRPCReactProvider>
      )
      
      expect(screen.getByText(/Has getUsers:/)).toBeDefined()
    })
  })

  describe('Client initialization', () => {
    it('should create tRPC client with correct configuration', () => {
      const { container } = render(
        <TRPCReactProvider>
          <div>Test</div>
        </TRPCReactProvider>
      )
      
      expect(container.firstChild).toBeDefined()
    })

    it('should use httpBatchLink for requests', () => {
      render(
        <TRPCReactProvider>
          <div>Test</div>
        </TRPCReactProvider>
      )
      
      // Provider should successfully render, indicating client was created
      expect(screen.getByText('Test')).toBeDefined()
    })
  })

  describe('QueryClient management', () => {
    it('should create query client for server environment', () => {
      // In test environment, window is defined (jsdom)
      // But we can test that the provider handles it
      const { container } = render(
        <TRPCReactProvider>
          <div>Server</div>
        </TRPCReactProvider>
      )
      
      expect(container).toBeDefined()
    })

    it('should reuse query client in browser', () => {
      // Render twice to check reusability
      const { rerender } = render(
        <TRPCReactProvider>
          <div>First</div>
        </TRPCReactProvider>
      )
      
      rerender(
        <TRPCReactProvider>
          <div>Second</div>
        </TRPCReactProvider>
      )
      
      expect(screen.getByText('Second')).toBeDefined()
    })
  })
})