import { useEffect, useRef } from 'react'

const STAR_COUNT = 80
const EMOJI_FLOATERS = ['🚀', '⭐', '🤖', '💡', '🔧', '🎮', '🧩', '✦']

export default function Stars() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let animId

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const stars = Array.from({ length: STAR_COUNT }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 1.8 + 0.4,
      alpha: Math.random(),
      speed: Math.random() * 0.008 + 0.003,
      phase: Math.random() * Math.PI * 2,
    }))

    let t = 0
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      stars.forEach((s) => {
        const a = 0.3 + 0.7 * Math.abs(Math.sin(t * s.speed + s.phase))
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(167,139,250,${a})`
        ctx.fill()
      })
      t++
      animId = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <>
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      {EMOJI_FLOATERS.slice(0, 5).map((em, i) => (
        <span
          key={i}
          className="floater"
          style={{
            left: `${8 + i * 22}%`,
            animationDelay: `${i * 1.3}s`,
            animationDuration: `${5 + i * 0.8}s`,
            fontSize: `${1.2 + (i % 3) * 0.4}rem`,
          }}
        >
          {em}
        </span>
      ))}
    </>
  )
}
