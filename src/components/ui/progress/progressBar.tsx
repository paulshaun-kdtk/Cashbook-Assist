'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import LoadingBar, { LoadingBarRef } from 'react-top-loading-bar'

export default function ProgressBar() {
  const pathname = usePathname()
  const ref = useRef<LoadingBarRef>(null)

  useEffect(() => {
    ref.current?.continuousStart()

    const timer = setTimeout(() => {
      ref.current?.complete()
    }, 500)

    return () => {
      clearTimeout(timer)
    }
  }, [pathname])

  return (
    <LoadingBar
      color="#0D6BD6"
      ref={ref}
      height={3}
      style={{ bottom: 0, top: 'auto', zIndex: 9999 }}
    />
  )
}
