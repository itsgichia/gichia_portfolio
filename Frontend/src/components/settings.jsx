import { createContext, useContext, useEffect, useState } from 'react'

const KEY = 'lab_settings'
const reduceMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

const DEFAULTS = {
  rain: !reduceMotion,
  sparkles: !reduceMotion,
  hideMyCursor: false,
  hideOthers: false,
}

function load() {
  try {
    return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) || '{}') }
  } catch {
    return DEFAULTS
  }
}

const SettingsContext = createContext([DEFAULTS, () => {}])

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(load)
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(settings))
    } catch {
      /* storage unavailable: settings last for this visit only */
    }
  }, [settings])
  const toggle = (k) => setSettings((s) => ({ ...s, [k]: !s[k] }))
  return <SettingsContext.Provider value={[settings, toggle]}>{children}</SettingsContext.Provider>
}

export const useSettings = () => useContext(SettingsContext)
