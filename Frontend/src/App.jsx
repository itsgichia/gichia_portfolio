import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { getProfile, getProjects, isAdmin } from './api'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Projects from './components/Projects'
import Experience from './components/Experience'
import Skills from './components/Skills'
import Contact from './components/Contact'
import Login from './pages/Login'
import Admin from './pages/Admin'
import './index.css'

function Portfolio() {
  const [profile, setProfile] = useState(null)
  const [projects, setProjects] = useState([])
  const [backendDown, setBackendDown] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([getProfile(), getProjects()])
      .then(([p, pr]) => { setProfile(p); setProjects(pr) })
      .catch(err => {
        console.warn(err.message)
        setBackendDown(true)
        // Use fallback data so the page still renders
        setProfile({
          name: 'Gichia Muiruri',
          role: 'Health Data Scientist & Full-Stack Developer',
          bio: 'Data professional and formulation scientist leveraging technology for healthcare innovation.',
          location: 'Sydney, NSW, Australia',
          email: 'gichiamuiruri@gmail.com',
          github: 'https://github.com/itsgichia',
          linkedin: 'https://linkedin.com/in/gichia-muiruri',
        })
        setProjects([])
      })
  }, [])

  return (
    <>
      {backendDown && (
        <div style={{ position: 'fixed', bottom: 16, right: 16, zIndex: 999, background: '#1a2035', border: '1px solid #ffd166', borderRadius: 8, padding: '10px 16px', fontFamily: "'DM Mono', monospace", fontSize: '0.72rem', color: '#ffd166' }}>
          ⚠ Backend offline — run uvicorn in /backend
        </div>
      )}
      <Navbar profile={profile} onNav={() => navigate('/admin')} />
      <Hero profile={profile} />
      <Projects projects={projects} />
      <Experience />
      <Skills />
      <Contact profile={profile} />
    </>
  )
}

function ProtectedRoute({ children }) {
  return isAdmin() ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Portfolio />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  )
}
