import { useEffect, useRef } from 'react'
import * as THREE from 'three'

// Particle field and wireframe shapes from the original portfolio hero.
export default function ThreeBackground() {
  const mountRef = useRef()

  useEffect(() => {
    const el = mountRef.current
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let renderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    } catch {
      return // no WebGL: the hero still reads fine without the background
    }
    renderer.setSize(el.clientWidth, el.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    el.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(60, el.clientWidth / el.clientHeight, 0.1, 1000)
    camera.position.z = 30

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
    scene.add(new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xc8f135, size: 0.12, transparent: true, opacity: 0.5 })))

    const shapes = []
    const shapeGeos = [new THREE.OctahedronGeometry(1.2), new THREE.TetrahedronGeometry(1.0), new THREE.IcosahedronGeometry(0.9)]
    for (let i = 0; i < 6; i++) {
      const mesh = new THREE.Mesh(
        shapeGeos[i % 3],
        new THREE.MeshBasicMaterial({ color: 0xc8f135, wireframe: true, transparent: true, opacity: 0.08 }),
      )
      mesh.position.set((Math.random() - 0.5) * 50, (Math.random() - 0.5) * 40, (Math.random() - 0.5) * 20 - 5)
      mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0)
      shapes.push({ mesh, rx: 0.003 + Math.random() * 0.004, ry: 0.002 + Math.random() * 0.003 })
      scene.add(mesh)
    }

    let mx = 0
    let my = 0
    const onMouse = (e) => {
      mx = (e.clientX / window.innerWidth - 0.5) * 2
      my = (e.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener('mousemove', onMouse)

    let frame
    const animate = () => {
      if (!reduce) frame = requestAnimationFrame(animate)
      const p = geo.attributes.position.array
      for (let i = 0; i < count; i++) {
        p[i * 3 + 1] += speeds[i]
        if (p[i * 3 + 1] > 40) p[i * 3 + 1] = -40
      }
      geo.attributes.position.needsUpdate = true
      shapes.forEach(({ mesh, rx, ry }) => {
        mesh.rotation.x += rx
        mesh.rotation.y += ry
      })
      camera.position.x += (mx * 2 - camera.position.x) * 0.02
      camera.position.y += (-my * 2 - camera.position.y) * 0.02
      renderer.render(scene, camera)
    }
    animate()

    const onResize = () => {
      camera.aspect = el.clientWidth / el.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(el.clientWidth, el.clientHeight)
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

  return <div ref={mountRef} className="hero__bg" aria-hidden="true" />
}
