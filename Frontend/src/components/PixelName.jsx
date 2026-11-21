import { useEffect, useRef } from 'react'

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * The site title as a video game title screen: thick pixel letters with a heavy
 * dark outline and drop shadow, a teal fill crossed by fine scanlines, and a
 * sparse layer of TV static that twinkles. The glyph mask comes from rendering
 * the text in an arcade font and downsampling by coverage.
 */
export default function PixelName({ text = 'Gichia Muiruri', cell = 6 }) {
  const ref = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const FONT = '"Press Start 2P", "Silkscreen", monospace'
    const FILL = '#2fd3bd'
    const FILL_DARK = '#1a9c8c'
    const FILL_LIGHT = '#9ff5e6'
    const OUTLINE = '#0a1f2e'
    const SHADOW = '#050d16'
    let raf = 0
    let frame = 0
    let mask = null
    let cols = 0
    let rows = 0
    let snow = []

    const buildMask = () => {
      const off = document.createElement('canvas')
      const px = 64 // Press Start 2P is an 8x8 font: 64px gives 8 canvas pixels per font pixel
      const unit = 8
      const ctx = off.getContext('2d')
      const font = `${px}px ${FONT}`
      ctx.font = font
      const label = text.toUpperCase()
      const w = Math.ceil(ctx.measureText(label).width / unit) * unit + unit * 2
      const h = unit * 10
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
          if (inked >= (unit * unit) / 2) mask[r * cols + c] = 1
        }
      }
      let top = 0
      let bottom = rows - 1
      const rowHas = (r) => mask.subarray(r * cols, (r + 1) * cols).some(Boolean)
      while (top < bottom && !rowHas(top)) top += 1
      while (bottom > top && !rowHas(bottom)) bottom -= 1
      mask = mask.subarray(top * cols, (bottom + 1) * cols)
      rows = bottom - top + 1

      // Static: a handful of cells that flicker, chosen once so the pattern feels fixed to the screen.
      snow = []
      for (let i = 0; i < cols * rows; i++) if (mask[i] && Math.random() < 0.12) snow.push([i % cols, Math.floor(i / cols), Math.random() * 60])

      const dpr = Math.min(2, window.devicePixelRatio || 1)
      const W = (cols + 3) * cell
      const H = (rows + 3) * cell
      canvas.width = W * dpr
      canvas.height = H * dpr
      canvas.style.width = `${W}px`
      canvas.style.height = `${H}px`
      canvas.getContext('2d').setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const on = (r, c) => r >= 0 && c >= 0 && r < rows && c < cols && mask[r * cols + c] === 1
    const nearInk = (r, c) => {
      for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) if (on(r + dr, c + dc)) return true
      return false
    }

    const draw = () => {
      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const ox = cell
      const oy = cell
      const px = (c) => ox + c * cell
      const py = (r) => oy + r * cell

      // Drop shadow (outline shape shifted down-right), then the outline itself.
      for (const [colour, dx, dy] of [
        [SHADOW, 1, 1],
        [OUTLINE, 0, 0],
      ]) {
        ctx.fillStyle = colour
        for (let r = -1; r <= rows; r++) for (let c = -1; c <= cols; c++) if (nearInk(r, c)) ctx.fillRect(px(c + dx), py(r + dy), cell, cell)
      }

      // Fill with a lighter top edge and darker bottom edge, like bevelled arcade lettering.
      const band = (frame / 2) % (rows + 24) - 12 // slow vertical roll
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (!on(r, c)) continue
          let colour = FILL
          if (!on(r - 1, c)) colour = FILL_LIGHT
          else if (!on(r + 1, c)) colour = FILL_DARK
          ctx.fillStyle = colour
          ctx.fillRect(px(c), py(r), cell, cell)
          const d = Math.abs(r - band)
          if (d < 1.5) {
            ctx.fillStyle = `rgba(255,255,255,${0.25 * (1 - d / 1.5)})`
            ctx.fillRect(px(c), py(r), cell, cell)
          }
        }
      }

      // Static: the chosen cells blink between dark and bright on their own clocks.
      for (const [c, r, phase] of snow) {
        const t = (frame + phase) % 60
        if (t < 4) ctx.fillStyle = 'rgba(234,255,251,0.9)'
        else if (t < 8) ctx.fillStyle = 'rgba(10,31,46,0.55)'
        else continue
        ctx.fillRect(px(c), py(r), cell, cell)
      }

      // Scanlines across the whole fill: a thin dark line every 3 device pixels.
      ctx.fillStyle = 'rgba(5,13,22,0.28)'
      for (let y = oy; y < oy + rows * cell; y += 3) {
        for (let r = Math.floor((y - oy) / cell), c = 0; c < cols; c++) if (on(r, c)) ctx.fillRect(px(c), y, cell, 1)
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
    if (document.fonts?.load) document.fonts.load('64px "Press Start 2P"').then(start, start)
    else start()
    return () => cancelAnimationFrame(raf)
  }, [text, cell])

  return <canvas ref={ref} className="pixelname" role="img" aria-label={text} />
}
