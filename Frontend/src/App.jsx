import { BrowserRouter, Link, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Admin from './pages/Admin'
import Home from './pages/Home'
import Login from './pages/Login'
import Project from './pages/Project'
import RsvLab from './pages/RsvLab'

function NotFound() {
  return (
    <div className="wrap article">
      <h1 className="article__title">Page not found</h1>
      <p className="article__lede">
        This address doesn't match a page. <Link to="/">Go to the home page</Link>.
      </p>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="projects/:slug" element={<Project />} />
          <Route path="lab/rsv" element={<RsvLab />} />
          <Route path="admin" element={<Admin />} />
          <Route path="admin/login" element={<Login />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
