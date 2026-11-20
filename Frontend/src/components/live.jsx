import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useSettings } from './settings'

// Same origin as the API: VITE_API_URL when the frontend is hosted separately.
const SOCKET_URL = (import.meta.env.VITE_API_URL || window.location.origin).replace(/^http/, 'ws') + '/api/live'
const STALE_MS = 15000

const LiveContext = createContext(null)

/** Cursor x is sent relative to the page centre so it lines up across window widths. */
const pageX = (clientX) => clientX + window.scrollX - document.documentElement.clientWidth / 2

export function LiveProvider({ children }) {
  const [status, setStatus] = useState('connecting') // connecting | open | closed
  const [online, setOnline] = useState(0)
  const [messages, setMessages] = useState([])
  const [cursors, setCursors] = useState({})
  const [notice, setNotice] = useState(null)
  const wsRef = useRef(null)
  const { pathname } = useLocation()
  const pathRef = useRef(pathname)
  const [settings] = useSettings()

  useEffect(() => {
    pathRef.current = pathname
  }, [pathname])

  // Connect, and reconnect with backoff when the server drops (e.g. on deploy).
  useEffect(() => {
    let closed = false
    let retry = 1000
    let timer
    const connect = () => {
      setStatus('connecting')
      let ws
      try {
        ws = new WebSocket(SOCKET_URL)
      } catch {
        setStatus('closed')
        return
      }
      wsRef.current = ws
      ws.onopen = () => {
        retry = 1000
        setStatus('open')
      }
      ws.onmessage = (e) => {
        let m
        try {
          m = JSON.parse(e.data)
        } catch {
          return
        }
        if (m.t === 'hello') setMessages(m.history)
        else if (m.t === 'online') setOnline(m.n)
        else if (m.t === 'chat') setMessages((list) => [...list.slice(-49), m])
        else if (m.t === 'error') setNotice(m.text)
        else if (m.t === 'cursor') setCursors((c) => ({ ...c, [m.id]: { ...m, seen: Date.now() } }))
        else if (m.t === 'leave')
          setCursors((c) => {
            const { [m.id]: _gone, ...rest } = c
            return rest
          })
      }
      ws.onclose = () => {
        if (closed) return
        setStatus('closed')
        setCursors({})
        timer = setTimeout(connect, retry)
        retry = Math.min(retry * 2, 30000)
      }
    }
    connect()
    return () => {
      closed = true
      clearTimeout(timer)
      const ws = wsRef.current
      // Closing mid-handshake can leave the upstream half open behind a proxy; close once it opens instead.
      if (ws?.readyState === WebSocket.CONNECTING) ws.onopen = () => ws.close()
      else ws?.close()
    }
  }, [])

  const send = useCallback((payload) => {
    const ws = wsRef.current
    if (ws?.readyState === WebSocket.OPEN) ws.send(JSON.stringify(payload))
  }, [])

  // Share this visitor's cursor, unless they opted out or are on a touch screen.
  useEffect(() => {
    if (status !== 'open') return
    if (settings.hideMyCursor || !window.matchMedia('(pointer: fine)').matches) {
      send({ t: 'hide' })
      return
    }
    let last = 0
    const onMove = (e) => {
      const now = performance.now()
      if (now - last < 50) return
      last = now
      send({ t: 'cursor', x: pageX(e.clientX), y: e.pageY, path: pathRef.current })
    }
    window.addEventListener('pointermove', onMove)
    return () => window.removeEventListener('pointermove', onMove)
  }, [status, settings.hideMyCursor, send])

  // Drop cursors of visitors who stopped moving.
  useEffect(() => {
    const t = setInterval(() => {
      const cutoff = Date.now() - STALE_MS
      setCursors((c) => {
        const fresh = Object.fromEntries(Object.entries(c).filter(([, v]) => v.seen > cutoff))
        return Object.keys(fresh).length === Object.keys(c).length ? c : fresh
      })
    }, 3000)
    return () => clearInterval(t)
  }, [])

  const sendChat = useCallback((name, text) => {
    setNotice(null)
    send({ t: 'chat', name, text })
  }, [send])

  return (
    <LiveContext.Provider value={{ status, online, messages, cursors, notice, sendChat }}>
      {children}
    </LiveContext.Provider>
  )
}

export const useLive = () => useContext(LiveContext)

export function Cursors() {
  const { cursors } = useLive()
  const [settings] = useSettings()
  const { pathname } = useLocation()
  if (settings.hideOthers) return null
  const half = document.documentElement.clientWidth / 2
  return (
    <div className="cursors" aria-hidden="true">
      {Object.values(cursors)
        .filter((c) => c.path === pathname)
        .map((c) => (
          <svg
            key={c.id}
            className="cursor"
            width="15"
            height="18"
            viewBox="0 0 10 12"
            style={{ transform: `translate(${half + c.x}px, ${c.y}px)`, color: c.color }}
          >
            <path d="M0.5 0.5v9l2.5-2.2 1.8 4 1.8-.8-1.8-3.8h3.4z" fill="currentColor" stroke="#0b0a24" strokeWidth="0.8" strokeLinejoin="round" />
          </svg>
        ))}
    </div>
  )
}
