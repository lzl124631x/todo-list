function clamp(n, min, max) {
  return Math.max(Math.min(n, max), min)
}

// http://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
function guid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,
    (c) => {
    let r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8)
    return v.toString(16)
  })
}

export { clamp, guid }
export const ITEM_HEIGHT = 53