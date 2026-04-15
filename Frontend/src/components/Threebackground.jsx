import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function ThreeBackground() {
  const mountRef = useRef()

  useEffect(() => {
    const el = mountRef.current
    const W = el.clientWidth, H = el.clientHeight

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(W, H)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    el.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 1000)
    camera.position.z = 30

    // Particle field
    const count = 1200
    const geo = new THREE.BufferGeometry()
    const pos = new Float32Array(count * 3)
    const speeds = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 80
      pos[i * 3 + 1] = (Math.random() - 0.5) * 80
      pos[i * 3 + 2] = (Math.random() - 0.5) * 40
      speeds[i] = 0.003 + Math.random() * 0.006
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    const mat = new THREE.PointsMaterial({ color: 0xc8f135, size: 0.12, transparent: true, opacity: 0.5 })
    const particles = new THREE.Points(geo, mat)
    scene.add(particles)

    // Floating geometric meshes
    const shapes = []
    const shapeGeos = [
      new THREE.OctahedronGeometry(1.2),
      new THREE.TetrahedronGeometry(1.0),
      new THREE.IcosahedronGeometry(0.9),
    ]
    const wireMat = new THREE.MeshBasicMaterial({ color: 0xc8f135, wireframe: true, transparent: true, opacity: 0.08 })
    for (let i = 0; i < 6; i++) {
      const mesh = new THREE.Mesh(shapeGeos[i % 3], wireMat.clone())
      mesh.position.set((Math.random() - 0.5) * 50, (Math.random() - 0.5) * 40, (Math.random() - 0.5) * 20 - 5)
      mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0)
      shapes.push({ mesh, rx: 0.003 + Math.random() * 0.004, ry: 0.002 + Math.random() * 0.003 })
      scene.add(mesh)
    }

    // Mouse parallax
    let mx = 0, my = 0
    const onMouse = (e) => { mx = (e.clientX / window.innerWidth - 0.5) * 2; my = (e.clientY / window.innerHeight - 0.5) * 2 }
    window.addEventListener('mousemove', onMouse)

    let frame, t = 0
    const animate = () => {
      frame = requestAnimationFrame(animate)
      t += 0.005
      // Drift particles upward slowly
      const positions = geo.attributes.position.array
      for (let i = 0; i < count; i++) {
        positions[i * 3 + 1] += speeds[i]
        if (positions[i * 3 + 1] > 40) positions[i * 3 + 1] = -40
      }
      geo.attributes.position.needsUpdate = true
      // Rotate shapes
      shapes.forEach(({ mesh, rx, ry }) => { mesh.rotation.x += rx; mesh.rotation.y += ry })
      // Parallax
      camera.position.x += (mx * 2 - camera.position.x) * 0.02
      camera.position.y += (-my * 2 - camera.position.y) * 0.02
      renderer.render(scene, camera)
    }
    animate()

    const onResize = () => {
      const W2 = el.clientWidth, H2 = el.clientHeight
      camera.aspect = W2 / H2; camera.updateProjectionMatrix()
      renderer.setSize(W2, H2)
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('mousemove', onMouse)
      window.removeEventListener('resize', onResize)
      renderer.dispose()
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement)
    }
  }, [])

  return <div ref={mountRef} style={{ position: 'absolute', inset: 0, zIndex: 0 }} />
}
