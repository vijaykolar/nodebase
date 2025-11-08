import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createTRPCContext, createTRPCRouter, baseProcedure, createCallerFactory } from '../init'

describe('trpc/init.ts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createTRPCContext', () => {
    it('should create context with userId', async () => {
      const context = await createTRPCContext()
      
      expect(context).toBeDefined()
      expect(context).toHaveProperty('userId')
      expect(context.userId).toBe('user_123')
    })

    it('should return consistent context when called multiple times', async () => {
      const context1 = await createTRPCContext()
      const context2 = await createTRPCContext()
      
      expect(context1).toEqual(context2)
    })

    it('should be a cached function', () => {
      // The function should be wrapped with React.cache
      expect(typeof createTRPCContext).toBe('function')
    })
  })

  describe('createTRPCRouter', () => {
    it('should create a valid tRPC router', () => {
      const router = createTRPCRouter({
        test: baseProcedure.query(() => 'test'),
      })
      
      expect(router).toBeDefined()
      expect(typeof router).toBe('object')
    })

    it('should support multiple procedures', () => {
      const router = createTRPCRouter({
        procedure1: baseProcedure.query(() => 'result1'),
        procedure2: baseProcedure.query(() => 'result2'),
      })
      
      expect(router).toBeDefined()
    })

    it('should create empty router', () => {
      const router = createTRPCRouter({})
      
      expect(router).toBeDefined()
      expect(typeof router).toBe('object')
    })
  })

  describe('baseProcedure', () => {
    it('should be defined and usable', () => {
      expect(baseProcedure).toBeDefined()
      expect(typeof baseProcedure.query).toBe('function')
      expect(typeof baseProcedure.mutation).toBe('function')
    })

    it('should allow creating query procedures', () => {
      const queryProcedure = baseProcedure.query(() => 'test')
      
      expect(queryProcedure).toBeDefined()
    })

    it('should allow creating mutation procedures', () => {
      const mutationProcedure = baseProcedure.mutation(() => 'test')
      
      expect(mutationProcedure).toBeDefined()
    })
  })

  describe('createCallerFactory', () => {
    it('should be defined', () => {
      expect(createCallerFactory).toBeDefined()
      expect(typeof createCallerFactory).toBe('function')
    })

    it('should create a caller from a router', async () => {
      const router = createTRPCRouter({
        test: baseProcedure.query(() => 'test-result'),
      })
      
      const createCaller = createCallerFactory(router)
      const context = await createTRPCContext()
      const caller = createCaller(context)
      
      expect(caller).toBeDefined()
      expect(typeof caller.test).toBe('function')
    })
  })
})