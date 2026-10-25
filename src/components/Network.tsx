import { useEffect, useRef } from 'react'
import { useHydrated, useMotionOK } from '../lib/motion'

// A web of commits in the four branch colours behind the hero. It drifts, moves
// out of the way of the pointer, and as the reader scrolls past the hero every
// node slides onto the main line, so the background becomes the page's graph.
// Decorative only: the canvas is hidden from assistive technology.

const BRANCH_VARS = ['--g1', '--g2', '--g3', '--g4']
const DRIFT_FOR = 9000 // ms of drifting after the last pointer move or load, then it settles
const SETTLE = 1600 // ms over which the drift slows to a stop
const PUSH_RADIUS = 150
const LINK = 150

interface Node {
  hx: number // home position, 0 to 1 across the canvas
  hy: number
  dx: number // displacement from the pointer, in px
  dy: number
  vx: number
  vy: number
  phase: number
  speed: number
  colour: number
  r: number
}

const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v))
const smooth = (t: number) => t * t * (3 - 2 * t)

export function Network() {
  const ref = useRef<HTMLCanvasElement>(null)
  const hydrated = useHydrated()
  const motionOK = useMotionOK()

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas?.getContext('2d')
    const hero = canvas?.parentElement
    const page = hero?.closest<HTMLElement>('.page')
    if (!canvas || !ctx || !hero || !page) return

    const css = getComputedStyle(document.documentElement)
    const colours = BRANCH_VARS.map((v) => css.getPropertyValue(v).trim())

    let w = 0
    let h = 0
    let mainX = 0
    let nodes: Node[] = []
    let clock = 0 // drift time; only advances while awake, so settling freezes nodes where they are
    let last = 0
    let awakeUntil = 0
    let raf = 0
    let visible = true
    let pointer: { x: number; y: number } | null = null

    // Seeded, so the layout is the same on every visit
    let seed = 20261025
    const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647

    function layout() {
      const rect = canvas!.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = rect.width
      h = rect.height
      canvas!.width = Math.round(w * dpr)
      canvas!.height = Math.round(h * dpr)
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
      // The main line is the page's ::before, 2px wide
      const lineLeft = parseFloat(getComputedStyle(page!, '::before').left) || 0
      mainX = page!.getBoundingClientRect().left + lineLeft + 1 - rect.left

      const count = Math.round(clamp((w * h) / 24000, 20, 58))
      if (nodes.length === count) return
      seed = 20261025
      nodes = Array.from({ length: count }, (_, i) => ({
        hx: 0.04 + rand() * 0.94,
        hy: 0.04 + rand() * 0.9,
        dx: 0,
        dy: 0,
        vx: 0,
        vy: 0,
        phase: rand() * Math.PI * 2,
        speed: 0.5 + rand() * 0.7,
        colour: i % colours.length,
        r: rand() < 0.2 ? 3.5 : 2.2,
      }))
    }

    /** 0 while the hero is in place, 1 once it has scrolled most of the way out. */
    function gather() {
      const rect = hero!.getBoundingClientRect()
      return smooth(clamp(-rect.top / (rect.height * 0.7)))
    }

    function draw(energy: number, dt: number) {
      const g = gather()
      ctx!.clearRect(0, 0, w, h)
      // Fade out as the nodes reach main, so they hand over to the real line
      const alpha = 1 - smooth(clamp((g - 0.75) / 0.25))
      if (alpha <= 0) return false

      let moving = false
      const pts = nodes.map((n) => {
        // Pointer: push away, then spring back home
        if (pointer && energy > 0) {
          const px = n.hx * w + n.dx - pointer.x
          const py = n.hy * h + n.dy - pointer.y
          const d = Math.hypot(px, py)
          if (d < PUSH_RADIUS && d > 0.01) {
            const f = (1 - d / PUSH_RADIUS) ** 2 * 1.4
            n.vx += (px / d) * f
            n.vy += (py / d) * f
          }
        }
        const k = dt / 16.7
        n.vx = (n.vx - n.dx * 0.012 * k) * 0.9 ** k
        n.vy = (n.vy - n.dy * 0.012 * k) * 0.9 ** k
        n.dx += n.vx * k
        n.dy += n.vy * k
        if (Math.abs(n.vx) + Math.abs(n.vy) > 0.02) moving = true

        const t = clock * 0.00035 * n.speed + n.phase
        const x = n.hx * w + Math.sin(t) * 22 + n.dx
        const y = n.hy * h + Math.cos(t * 0.8) * 16 + n.dy
        return { x: x + (mainX - x) * g, y, n }
      })

      ctx!.lineWidth = 1
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const a = pts[i]
          const b = pts[j]
          const d = Math.hypot(a.x - b.x, a.y - b.y)
          if (d > LINK) continue
          ctx!.globalAlpha = (1 - d / LINK) * 0.26 * alpha
          ctx!.strokeStyle = colours[a.n.colour]
          ctx!.beginPath()
          ctx!.moveTo(a.x, a.y)
          ctx!.lineTo(b.x, b.y)
          ctx!.stroke()
        }
      }
      for (const p of pts) {
        ctx!.globalAlpha = 0.7 * alpha
        ctx!.fillStyle = colours[p.n.colour]
        ctx!.beginPath()
        ctx!.arc(p.x, p.y, p.n.r, 0, Math.PI * 2)
        ctx!.fill()
      }
      ctx!.globalAlpha = 1
      return moving
    }

    function frame(now: number) {
      raf = 0
      const dt = last ? Math.min(now - last, 50) : 16.7
      last = now
      const energy = motionOK ? clamp((awakeUntil - now) / SETTLE) : 0
      clock += dt * energy
      const moving = draw(energy, dt)
      if (visible && (energy > 0 || moving)) raf = requestAnimationFrame(frame)
      else last = 0
    }

    const request = () => {
      if (!raf && visible) raf = requestAnimationFrame(frame)
    }
    const wake = () => {
      awakeUntil = performance.now() + DRIFT_FOR
      request()
    }

    layout()
    if (!motionOK) {
      // Reduced motion: one still frame, redrawn only when the layout changes
      draw(0, 0)
      const onResize = () => {
        layout()
        draw(0, 0)
      }
      window.addEventListener('resize', onResize)
      return () => window.removeEventListener('resize', onResize)
    }

    const onPointer = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return
      const rect = canvas.getBoundingClientRect()
      pointer = { x: e.clientX - rect.left, y: e.clientY - rect.top }
      wake()
    }
    const onLeave = () => (pointer = null)
    const onResize = () => {
      layout()
      request()
    }
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible) request()
    })
    io.observe(hero)
    window.addEventListener('pointermove', onPointer, { passive: true })
    document.documentElement.addEventListener('pointerleave', onLeave)
    window.addEventListener('scroll', request, { passive: true })
    window.addEventListener('resize', onResize)
    wake()

    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      window.removeEventListener('pointermove', onPointer)
      document.documentElement.removeEventListener('pointerleave', onLeave)
      window.removeEventListener('scroll', request)
      window.removeEventListener('resize', onResize)
    }
  }, [hydrated, motionOK])

  // Drawn only in the browser; prerendered and no-JS pages have no canvas
  if (!hydrated) return null
  return <canvas ref={ref} className="network" aria-hidden="true" />
}
