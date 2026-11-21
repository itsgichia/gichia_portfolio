import { useEffect, useRef } from 'react'

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * The site title as chunky pixel letters filled with animated TV static, in the
 * style of old video game title screens. The glyph mask comes from rendering the
 * text in the pixel font at a small size; each "on" cell is then drawn as a block
 * whose brightness flickers, with scanlines and an occasional rolling band.
 */
export default function PixelName({ text = 'Gichia Muiruri', cell = 4, fill = '#2dd4bf', outline = '#0b2a3a' }) {
  const ref = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    let frame = 0
    let raf = 0
    let mask = null
    let cols = 0
    let rows = 0

    const buildMask = () => {
      // Render the text once at glyph resolution and sample which cells are inked.
      // Render big, then downsample by coverage so the result is blocky whatever the font grid is.
      const off = document.createElement('canvas')
      const px = 88
      const unit = 8 // canvas pixels per output cell: 88px text becomes 11 cells tall
      const ctx = off.getContext('2d')
      const font = `700 ${px}px "Silkscreen", monospace`
      ctx.font = font
      const label = text.toUpperCase()
      const w = Math.ceil(ctx.measureText(label).width / unit) * unit + unit
      const h = Math.ceil((px * 1.1) / unit) * unit
      off.width = w
      off.height = h
      ctx.font = font
      ctx.fillStyle = '#fff'
      ctx.textBaseline = 'top'
      ctx.fillText(label, unit / 2, px * 0.05)
      cols = w / unit
      rows = h / unit
      const data = ctx.getImageData(0, 0, w, h).data
      mask = new Uint8Array(cols * rows)
      const half = (unit * unit) / 2
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          let inked = 0
          for (let y = r * unit; y < (r + 1) * unit; y++) {
            for (let x = c * unit; x < (c + 1) * unit; x++) {
              if (data[(y * w + x) * 4 + 3] > 128) inked += 1
            }
          }
          if (inked >= half) mask[r * cols + c] = 1
        }
      }
      // Trim empty rows top and bottom.
      let top = 0
      let bottom = rows - 1
      const rowHas = (r) => mask.subarray(r * cols, (r + 1) * cols).some((v) => v)
      while (top < bottom && !rowHas(top)) top += 1
      while (bottom > top && !rowHas(bottom)) bottom -= 1
      mask = mask.subarray(top * cols, (bottom + 1) * cols)
      rows = bottom - top + 1
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      canvas.width = (cols + 2) * cell * dpr
      canvas.height = (rows + 2) * cell * dpr
      canvas.style.width = `${(cols + 2) * cell}px`
      canvas.style.height = `${(rows + 2) * cell}px`
      canvas.getContext('2d').setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const on = (r, c) => r >= 0 && c >= 0 && r < rows && c < cols && mask[r * cols + c] === 1

    const draw = () => {
      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const band = (frame * 0.9) % (rows + 12) // rolling bright band, like a CRT refresh
      // Outline: every neighbour of an inked cell, drawn first in the dark colour.
      ctx.fillStyle = outline
      for (let r = -1; r <= rows; r++) {
        for (let c = -1; c <= cols; c++) {
          if (on(r, c)) continue
          if (on(r - 1, c) || on(r + 1, c) || on(r, c - 1) || on(r, c + 1) || on(r + 1, c + 1)) {
            ctx.fillRect((c + 1) * cell, (r + 1) * cell, cell, cell)
          }
        }
      }
      // Fill: static noise per cell, dimmer on alternate rows (scanlines).
      for (let r = 0; r < rows; r++) {
        const scan = r % 2 === 0 ? 1 : 0.72
        const glow = Math.max(0, 1 - Math.abs(r - band) / 3) * 0.35
        for (let c = 0; c < cols; c++) {
          if (!on(r, c)) continue
          const noise = 0.65 + Math.random() * 0.45
          const v = Math.min(1.25, noise * scan + glow)
          ctx.fillStyle = fill
          ctx.globalAlpha = Math.min(1, v)
          ctx.fillRect((c + 1) * cell, (r + 1) * cell, cell, cell)
          if (v > 1.1) {
            ctx.fillStyle = '#eafffb'
            ctx.globalAlpha = (v - 1.1) * 3
            ctx.fillRect((c + 1) * cell, (r + 1) * cell, cell, cell)
          }
        }
      }
      ctx.globalAlpha = 1
    }

    const loop = () => {
      frame += 1
      if (frame % 3 === 0) draw() // ~20 fps is enough for static and keeps it cheap
      raf = requestAnimationFrame(loop)
    }

    const start = () => {
      buildMask()
      draw()
      if (!reducedMotion()) raf = requestAnimationFrame(loop)
    }
    if (document.fonts?.load) {
      document.fonts.load('700 88px "Silkscreen"').then(start, start)
    } else {
      start()
    }
    return () => cancelAnimationFrame(raf)
  }, [text, cell, fill, outline])

  return <canvas ref={ref} className="pixelname" role="img" aria-label={text} />
}
