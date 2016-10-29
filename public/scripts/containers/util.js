function clamp(n, min, max) {
  return Math.max(Math.min(n, max), min);
}

export { clamp }
export const ITEM_HEIGHT = 53