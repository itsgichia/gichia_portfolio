import { useEffect, useRef } from 'react'

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * The site title as a pixel logo in the dimden.dev style: flat teal letters
 * crossed by strong horizontal stripes, a near-black outline, and a ring of
 * dithered static around the outline that shimmers. The glyph mask comes from
 * rendering the text in a pixel font and downsampling by coverage.
 */
export default function PixelName({ text = 'Gichia Muiruri', cell = 4 }) {
  const ref = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const FONT = '700 {px}px "Pixelify Sans", "Silkscreen", monospace'
    const FILL = '#49c7b4'
    const STRIPE = '#1f7f74'
    const OUTLINE = '#06131c'
    const HALO = '#15453f'
    let raf = 0
    let frame = 0
    let mask = null
    let cols = 0
    let rows = 0

    const buildMask = () => {
      const off = document.createElement('canvas')
      const px = 128
      const unit = 8 // 128px text sampled in 8px cells: letters about 13 cells tall, strokes 2 to 3 cells wide
      const ctx = off.getContext('2d')
      const font = FONT.replace('{px}', px)
      ctx.font = font
      const label = text.toUpperCase()
      const w = Math.ceil(ctx.measureText(label).width / unit) * unit + unit * 2
      const h = unit * 20
      off.width = w
      off.height = h
      ctx.font = font
      ctx.fillStyle = '#fff'
      ctx.textBaseline = 'top'
      ctx.fillText(label, unit, unit)
      cols = w / unit
      rows = h / unit
      const data = ctx.getImageData(0, 0, w, h).data
      mask = new Uint8Array(cols * rows)
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          let inked = 0
          for (let y = r * unit; y < (r + 1) * unit; y++) {
            for (let x = c * unit; x < (c + 1) * unit; x++) if (data[(y * w + x) * 4 + 3] > 128) inked += 1
          }
          if (inked >= unit * unit * 0.5) mask[r * cols + c] = 1
        }
      }
      let top = 0
      let bottom = rows - 1
      const rowHas = (r) => mask.subarray(r * cols, (r + 1) * cols).some(Boolean)
      while (top < bottom && !rowHas(top)) top += 1
      while (bottom > top && !rowHas(bottom)) bottom -= 1
      mask = mask.subarray(top * cols, (bottom + 1) * cols)
      rows = bottom - top + 1

      const dpr = Math.min(2, window.devicePixelRatio || 1)
      const W = (cols + 6) * cell
      const H = (rows + 6) * cell
      canvas.width = W * dpr
      canvas.height = H * dpr
      canvas.style.width = `${W}px`
      canvas.style.height = `${H}px`
      canvas.getContext('2d').setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const on = (r, c) => r >= 0 && c >= 0 && r < rows && c < cols && mask[r * cols + c] === 1
    const within = (r, c, d) => {
      for (let dr = -d; dr <= d; dr++) for (let dc = -d; dc <= d; dc++) if (Math.abs(dr) + Math.abs(dc) <= d + 1 && on(r + dr, c + dc)) return true
      return false
    }
    const hash = (a, b, t) => {
      const s = Math.sin(a * 374761 + b * 668265 + t * 97) * 43758.5453
      return s - Math.floor(s)
    }

    const draw = () => {
      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const ox = cell * 3
      const oy = cell * 3
      const px = (c) => ox + c * cell
      const py = (r) => oy + r * cell
      const tick = Math.floor(frame / 6)

      for (let r = -3; r <= rows + 2; r++) {
        for (let c = -3; c <= cols + 2; c++) {
          if (on(r, c)) continue
          if (within(r, c, 1)) {
            // Solid outline, one cell thick, with a half-cell drop shadow below-right.
            ctx.fillStyle = OUTLINE
            ctx.fillRect(px(c), py(r), cell, cell)
            ctx.fillRect(px(c) + cell * 0.5, py(r) + cell * 0.5, cell, cell)
          } else if (within(r, c, 3)) {
            // Dithered static halo: dark teal specks that come and go around the letters.
            const v = hash(r + 7, c + 11, tick)
            if (v < (within(r, c, 2) ? 0.3 : 0.07)) {
              ctx.fillStyle = v < 0.05 ? OUTLINE : HALO
              ctx.fillRect(px(c), py(r), cell, cell)
            }
          }
        }
      }

      // Flat fill.
      ctx.fillStyle = FILL
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) if (on(r, c)) ctx.fillRect(px(c), py(r), cell, cell)

      // Strong horizontal stripes across the fill, drifting slowly like a CRT.
      ctx.fillStyle = STRIPE
      ctx.globalAlpha = 0.75
      const pitch = 4
      const bandH = 2
      const drift = Math.floor(frame / 8) % pitch
      for (let y = oy - drift; y < oy + rows * cell; y += pitch) {
        if (y < oy) continue
        const r = Math.floor((y - oy) / cell)
        for (let c = 0; c < cols; c++) if (on(r, c)) ctx.fillRect(px(c), y, cell, Math.min(bandH, py(r + 1) - y))
      }
      ctx.globalAlpha = 1

      // A few bright snow cells inside the letters, sparse and brief.
      for (let i = 0; i < 6; i++) {
        const idx = Math.floor(hash(i + 1, 3, Math.floor(frame / 4)) * cols * rows)
        if (mask[idx]) {
          ctx.fillStyle = 'rgba(230,255,250,0.55)'
          ctx.fillRect(px(idx % cols), py(Math.floor(idx / cols)), cell, cell)
        }
      }
    }

    const loop = () => {
      frame += 1
      if (frame % 2 === 0) draw()
      raf = requestAnimationFrame(loop)
    }
    const start = () => {
      buildMask()
      draw()
      if (!reducedMotion()) raf = requestAnimationFrame(loop)
    }
    if (document.fonts?.load) document.fonts.load('700 128px "Pixelify Sans"').then(start, start)
    else start()
    return () => cancelAnimationFrame(raf)
  }, [text, cell])

  return <canvas ref={ref} className="pixelname" role="img" aria-label={text} />
}
