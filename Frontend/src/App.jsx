import { BrowserRouter, Link, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import { Win } from './components/Retro'
import Admin from './pages/Admin'
import Home from './pages/Home'
import Login from './pages/Login'
import Project from './pages/Project'
import Projects from './pages/Projects'
import RsvLab from './pages/RsvLab'
import SeqLab from './pages/SeqLab'

function NotFound() {
  return (
    <div className="page">
      <Win title="404.txt" icon="?">
        <h1 className="article__title">Room not found</h1>
        <p className="article__lede">
          There's no room at this address. <Link to="/">Back to the lobby</Link>.
        </p>
      </Win>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="projects" element={<Projects />} />
          <Route path="projects/:slug" element={<Project />} />
          <Route path="lab/rsv" element={<RsvLab />} />
          <Route path="lab/seq" element={<SeqLab />} />
          <Route path="admin" element={<Admin />} />
          <Route path="admin/login" element={<Login />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
