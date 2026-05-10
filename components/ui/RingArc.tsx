'use client'
import { useEffect, useRef } from 'react'

interface RingArcProps {
  score: number
  color: string
  bgColor: string
  size?: number
  strokeWidth?: number
  animate?: boolean
}

export default function RingArc({
  score,
  color,
  bgColor,
  size = 48,
  strokeWidth = 4,
  animate = true,
}: RingArcProps) {
  const circleRef = useRef<SVGCircleElement>(null)

  const r = (size - strokeWidth) / 2
  const cx = size / 2
  const cy = size / 2
  const circumference = 2 * Math.PI * r
  const filled = (score / 100) * circumference
  const gap = circumference - filled

  useEffect(() => {
    if (!animate || !circleRef.current) return
    const el = circleRef.current
    el.style.strokeDashoffset = String(circumference)
    el.style.transition = 'none'
    void el.getBoundingClientRect()
    el.style.transition = 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)'
    el.style.strokeDashoffset = String(gap)
  }, [animate, circumference, gap])

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      aria-label={`Score: ${score} out of 100`}
      role="img"
    >
      <circle
        cx={cx} cy={cy} r={r}
        fill="none"
        stroke={bgColor}
        strokeWidth={strokeWidth}
      />
      <circle
        ref={circleRef}
        cx={cx} cy={cy} r={r}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={`${circumference}`}
        strokeDashoffset={animate ? circumference : gap}
        transform={`rotate(-90 ${cx} ${cy})`}
      />
    </svg>
  )
}