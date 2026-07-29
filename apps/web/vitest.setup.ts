import "@testing-library/jest-dom/vitest";

// jsdom implements neither observer API; several Radix/cmdk primitives and
// our own scroll-spy (design-lab/_sections/lab-nav.tsx) construct one on mount.
class ObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

if (typeof globalThis.ResizeObserver === "undefined") {
  globalThis.ResizeObserver = ObserverStub as unknown as typeof ResizeObserver;
}

if (typeof globalThis.IntersectionObserver === "undefined") {
  globalThis.IntersectionObserver = ObserverStub as unknown as typeof IntersectionObserver;
}

// jsdom doesn't implement layout, so scrollIntoView is absent; cmdk calls it
// when moving the active item into view.
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {};
}

