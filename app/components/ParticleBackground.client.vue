<script setup lang="ts">
import * as THREE from 'three'

const canvas = ref<HTMLCanvasElement | null>(null)
let cleanup: (() => void) | undefined

onMounted(async () => {
  // Nuxt's client component can mount before its parent leaves Suspense.
  await nextTick()
  const element = canvas.value
  const surface = element?.parentElement
  const page = element?.closest<HTMLElement>('.site-shell')
  if (!element || !surface || !page) return

  let renderer: THREE.WebGLRenderer
  try {
    renderer = new THREE.WebGLRenderer({ canvas: element, alpha: true, antialias: false })
  } catch {
    // The CSS artwork also works when WebGL is unavailable.
    return
  }

  const scene = new THREE.Scene()
  const camera = new THREE.OrthographicCamera(0, 1, 0, 1, -1, 1)
  const geometry = new THREE.BufferGeometry()
  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthTest: false,
    depthWrite: false,
    uniforms: { pointSize: { value: 2 }, pixelRatio: { value: 1 } },
    vertexShader: `
      attribute vec3 particleColor;
      attribute float variation;
      uniform float pointSize;
      uniform float pixelRatio;
      varying vec3 vColor;
      void main() {
        vColor = particleColor;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = pointSize * pixelRatio * variation;
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      void main() {
        float radius = length(gl_PointCoord - 0.5);
        float alpha = 1.0 - smoothstep(0.35, 0.5, radius);
        if (alpha < 0.01) discard;
        gl_FragColor = vec4(vColor, alpha);
      }
    `
  })
  const particles = new THREE.Points(geometry, material)
  particles.frustumCulled = false
  scene.add(particles)

  let positions = new Float32Array(0)
  let origins = new Float32Array(0)
  let velocities = new Float32Array(0)
  let width = 0
  let height = 0
  let frame = 0
  let previousTime = 0
  let visible = true
  let unsettled = false
  const pointer = { x: 0, y: 0, active: false }
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
  const sand = [0.84, 0.75, 0.61]
  const cream = [0.96, 0.93, 0.85]
  const pink = [1, 0, 0.29]
  const smoothstep = (a: number, b: number, value: number) => {
    const t = Math.max(0, Math.min(1, (value - a) / (b - a)))
    return t * t * (3 - 2 * t)
  }

  const render = () => renderer.render(scene, camera)
  const animate = (time: number) => {
    frame = 0
    if (!visible || document.hidden || reducedMotion.matches) return
    const step = previousTime ? Math.min((time - previousTime) / 16.667, 2) : 1
    previousTime = time
    const damping = Math.pow(0.84, step)
    const radius = Math.min(150, width * 0.23)
    let moving = false

    for (let i = 0; i < positions.length; i += 3) {
      let x = positions[i]!
      let y = positions[i + 1]!
      const homeX = origins[i]!
      const homeY = origins[i + 1]!
      let vx = velocities[i]!
      let vy = velocities[i + 1]!
      if (pointer.active) {
        const dx = x - pointer.x
        const dy = y - pointer.y
        const distanceSquared = dx * dx + dy * dy
        if (distanceSquared < radius * radius) {
          const distance = Math.sqrt(distanceSquared)
          const force = Math.pow(1 - distance / radius, 2) * 7 * step
          vx += (distance > 0.01 ? dx / distance : 1) * force
          vy += (distance > 0.01 ? dy / distance : 0) * force
        }
      }
      vx = (vx + (homeX - x) * 0.025 * step) * damping
      vy = (vy + (homeY - y) * 0.025 * step) * damping
      x += vx * step
      y += vy * step
      if (Math.abs(x - homeX) + Math.abs(y - homeY) + Math.abs(vx) + Math.abs(vy) < 0.08) {
        x = homeX
        y = homeY
        vx = 0
        vy = 0
      } else {
        moving = true
      }
      positions[i] = x
      positions[i + 1] = y
      velocities[i] = vx
      velocities[i + 1] = vy
    }
    geometry.getAttribute('position').needsUpdate = true
    render()
    unsettled = moving
    if (moving) frame = requestAnimationFrame(animate)
    else previousTime = 0
  }

  const wake = () => {
    if (!frame && visible && !document.hidden && !reducedMotion.matches) {
      previousTime = 0
      frame = requestAnimationFrame(animate)
    }
  }

  const resize = () => {
    const bounds = surface.getBoundingClientRect()
    if (!bounds.width || !bounds.height || (width === bounds.width && height === bounds.height)) return
    width = bounds.width
    height = bounds.height
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2)
    renderer.setPixelRatio(pixelRatio)
    renderer.setSize(width, height, false)
    camera.right = width
    camera.bottom = height
    camera.updateProjectionMatrix()

    // Bound the particle count independently of viewport size and pixel density.
    const spacing = Math.max(1.65, Math.sqrt(width * height / 240000))
    const columns = Math.ceil(width / spacing)
    const rows = Math.ceil(height / spacing)
    const count = columns * rows
    positions = new Float32Array(count * 3)
    velocities = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const variations = new Float32Array(count)
    let seed = 42
    const random = () => {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0
      return seed / 4294967296
    }

    for (let i = 0; i < count; i++) {
      const x = (i % columns + (random() - 0.5) * 0.45) * spacing
      const y = (Math.floor(i / columns) + (random() - 0.5) * 0.45) * spacing
      const u = x / width
      const ribWidth = Math.max(13, width / 65)
      const rib = ((x / ribWidth) % 1 - 0.5) * 0.07
      const v = y / height + rib
      const grain = (random() - 0.5) * 0.02
      const upper = Math.hypot((u - 0.19) / 0.205, (v - 0.065) / 0.39) - 1
      const lower = Math.hypot((u - 0.64) / 0.285, (v - 1.19) / 0.51) - 1
      const edge = Math.min(upper, lower) + (random() - 0.5) * 0.025
      const pinkMix = 1 - smoothstep(-0.025, 0.055, edge)
      const halo = 1 - smoothstep(0.07, 0.22, edge)
      const corner = 1 - smoothstep(-0.015, 0.04, v - (u - 0.65) * 1.5)
      const creamMix = Math.max(halo, corner)

      positions[i * 3] = x
      positions[i * 3 + 1] = y
      variations[i] = 0.95 + random() * 0.1
      for (let channel = 0; channel < 3; channel++) {
        const base = sand[channel]! + (cream[channel]! - sand[channel]!) * creamMix
        colors[i * 3 + channel] = Math.max(0, Math.min(1, base + (pink[channel]! - base) * pinkMix + grain))
      }
    }
    origins = positions.slice()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3).setUsage(THREE.DynamicDrawUsage))
    geometry.setAttribute('particleColor', new THREE.BufferAttribute(colors, 3))
    geometry.setAttribute('variation', new THREE.BufferAttribute(variations, 1))
    material.uniforms.pointSize!.value = spacing * 2.1
    material.uniforms.pixelRatio!.value = pixelRatio
    unsettled = false
    pointer.active = false
    render()
    element.classList.add('is-ready')
    element.parentElement?.classList.add('is-ready')
  }

  const onPointerMove = (event: PointerEvent) => {
    if (event.pointerType === 'touch' || reducedMotion.matches) return
    const bounds = surface.getBoundingClientRect()
    pointer.x = event.clientX - bounds.left
    pointer.y = event.clientY - bounds.top
    pointer.active = true
    wake()
  }
  const release = () => {
    pointer.active = false
    if (unsettled) wake()
  }
  const onMotionChange = () => {
    release()
    if (reducedMotion.matches) {
      cancelAnimationFrame(frame)
      frame = 0
      positions.set(origins)
      velocities.fill(0)
      geometry.getAttribute('position').needsUpdate = true
      unsettled = false
      render()
    }
  }
  const onVisibilityChange = () => {
    release()
    if (document.hidden) {
      cancelAnimationFrame(frame)
      frame = 0
    }
  }
  const observer = new ResizeObserver(resize)
  observer.observe(surface)
  const intersection = new IntersectionObserver(([entry]) => {
    visible = Boolean(entry?.isIntersecting)
    if (visible && unsettled) wake()
    else if (!visible) {
      pointer.active = false
      cancelAnimationFrame(frame)
      frame = 0
    }
  })
  intersection.observe(surface)
  page.addEventListener('pointermove', onPointerMove, { passive: true })
  page.addEventListener('pointerleave', release)
  page.addEventListener('pointercancel', release)
  window.addEventListener('blur', release)
  document.addEventListener('visibilitychange', onVisibilityChange)
  reducedMotion.addEventListener('change', onMotionChange)
  resize()

  cleanup = () => {
    cancelAnimationFrame(frame)
    observer.disconnect()
    intersection.disconnect()
    page.removeEventListener('pointermove', onPointerMove)
    page.removeEventListener('pointerleave', release)
    page.removeEventListener('pointercancel', release)
    window.removeEventListener('blur', release)
    document.removeEventListener('visibilitychange', onVisibilityChange)
    reducedMotion.removeEventListener('change', onMotionChange)
    geometry.dispose()
    material.dispose()
    renderer.dispose()
  }
})

onBeforeUnmount(() => cleanup?.())
</script>

<template>
  <div class="particle-background" aria-hidden="true">
    <canvas ref="canvas" />
  </div>
</template>

<style scoped>
.particle-background {
  position: fixed;
  z-index: -1;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  background:
    radial-gradient(ellipse 20.5% 39% at 19% 6.5%, #ff004a 96%, #f5edda 102%, transparent 122%),
    radial-gradient(ellipse 28.5% 51% at 64% 119%, #ff004a 96%, #f5edda 102%, transparent 122%),
    #d6bf9c;
}
canvas { display: block; width: 100%; height: 100%; opacity: 0; }
.particle-background.is-ready { background: #d6bf9c; }
canvas.is-ready { opacity: 1; }
</style>
