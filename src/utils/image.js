// Read an image file as a PNG data URL, downscaled to maxWidth.
// Keeps the PDF/state size reasonable — signatures don't need to be huge.
export function readImageDownscaled(file, maxWidth = 400) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      reject(new Error('Not an image file'))
      return
    }
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width)
        const w = Math.max(1, Math.round(img.width * scale))
        const h = Math.max(1, Math.round(img.height * scale))
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, w, h)
        resolve({ dataUrl: canvas.toDataURL('image/png'), width: w, height: h })
      }
      img.onerror = () => reject(new Error('Failed to decode image'))
      img.src = reader.result
    }
    reader.readAsDataURL(file)
  })
}
