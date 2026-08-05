import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// @testing-library/react normally self-registers this via `afterEach` on
// the global object, but this project runs Vitest with `globals: false`,
// so that auto-detection never fires — without this, DOM from one test
// leaks into the next within the same file (only visible once a file has
// more than one `it()`).
afterEach(cleanup);

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

