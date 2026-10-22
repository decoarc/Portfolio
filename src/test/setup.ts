import '@testing-library/jest-dom/vitest'

class IntersectionObserverStub implements IntersectionObserver {
  readonly root: Element | Document | null = null
  readonly rootMargin: string = '0px'
  readonly thresholds: ReadonlyArray<number> = [0]

  constructor(private readonly callback: IntersectionObserverCallback) {}

  observe(target: Element): void {
    this.callback(
      [
        {
          isIntersecting: true,
          target,
          intersectionRatio: 1,
          time: 0,
          boundingClientRect: {} as DOMRectReadOnly,
          intersectionRect: {} as DOMRectReadOnly,
          rootBounds: null,
        },
      ],
      this,
    )
  }

  unobserve(): void {}
  disconnect(): void {}
  takeRecords(): IntersectionObserverEntry[] {
    return []
  }
}

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: IntersectionObserverStub,
})

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  configurable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    addListener: () => undefined,
    removeListener: () => undefined,
    dispatchEvent: () => true,
  }),
})
