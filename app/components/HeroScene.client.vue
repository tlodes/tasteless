<script setup lang="ts">
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

const props = defineProps<{ isPlaying: boolean }>()
const emit = defineEmits<{
  togglePlayback: []
  seekBy: [seconds: number]
}>()

const canvas = ref<HTMLCanvasElement | null>(null)
const isLoading = ref(true)
const hasError = ref(false)
const loadProgress = ref(0)
const isDragging = ref(false)
const isScrubbing = ref(false)
const isInteractiveHovering = ref(false)
let cleanup: (() => void) | undefined

onMounted(() => {
  if (!canvas.value) return
  const element = canvas.value
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(31, 1, 0.1, 100)
  camera.position.set(5.4, 3.45, 8.2)

  const renderer = new THREE.WebGLRenderer({ canvas: element, antialias: true, alpha: true, powerPreference: 'high-performance' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.15
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.setClearColor(0x000000, 0)

  const pmremGenerator = new THREE.PMREMGenerator(renderer)
  const roomEnvironment = new RoomEnvironment()
  const environmentTarget = pmremGenerator.fromScene(roomEnvironment, 0.05)
  scene.environment = environmentTarget.texture
  roomEnvironment.dispose()
  pmremGenerator.dispose()

  const controls = new OrbitControls(camera, element)
  controls.enableDamping = true
  controls.dampingFactor = 0.065
  controls.enablePan = false
  controls.enableZoom = false
  controls.rotateSpeed = 0.68
  controls.minPolarAngle = Math.PI * 0.2
  controls.maxPolarAngle = Math.PI * 0.48
  controls.target.set(0, -0.15, 0)
  controls.addEventListener('start', () => { isDragging.value = true })
  controls.addEventListener('end', () => { isDragging.value = false })

  const controllerRig = new THREE.Group()
  controllerRig.rotation.y = -0.16
  scene.add(controllerRig)

  const raycaster = new THREE.Raycaster()
  const pointer = new THREE.Vector2()
  const interactiveTargets: THREE.Object3D[] = []
  const jogWheels: THREE.Object3D[] = []
  const playButtons: THREE.Object3D[] = []
  const buttonBaseY = new Map<THREE.Object3D, number>()
  const buttonMaterials: THREE.MeshStandardMaterial[] = []
  const wiperGeometry = new THREE.BoxGeometry(0.055, 0.003, 0.006)
  const wiperMaterial = new THREE.MeshBasicMaterial({ color: '#ff3150' })
  const buttonHitGeometry = new THREE.SphereGeometry(0.03, 16, 10)
  const buttonHitMaterial = new THREE.MeshBasicMaterial({
    transparent: true,
    opacity: 0,
    depthWrite: false
  })

  let activeButton: THREE.Object3D | null = null
  let scrubWheel: THREE.Object3D | null = null
  let lastPointerX = 0

  const addWiper = (wheel: THREE.Object3D) => {
    const wiper = new THREE.Mesh(wiperGeometry, wiperMaterial)
    wiper.name = 'JogWheel_Wiper'
    wiper.position.set(0.028, 0.019, 0)
    wheel.add(wiper)
  }

  const registerInteractiveParts = (controller: THREE.Object3D) => {
    for (const side of ['Left', 'Right']) {
      const wheel = controller.getObjectByName(`JogWheel_${side}`)
      if (wheel) {
        jogWheels.push(wheel)
        interactiveTargets.push(wheel)
        addWiper(wheel)
      }

      const button = controller.getObjectByName(`PlayButton_${side}`)
      if (button) {
        playButtons.push(button)
        interactiveTargets.push(button)
        buttonBaseY.set(button, button.position.y)
        const hitArea = new THREE.Mesh(buttonHitGeometry, buttonHitMaterial)
        hitArea.name = 'PlayButton_HitArea'
        button.add(hitArea)
        button.traverse((child) => {
          if (!(child instanceof THREE.Mesh)) return
          const cloneMaterial = (material: THREE.Material) => {
            const clone = material.clone()
            if (clone instanceof THREE.MeshStandardMaterial) buttonMaterials.push(clone)
            return clone
          }
          child.material = Array.isArray(child.material)
            ? child.material.map(cloneMaterial)
            : cloneMaterial(child.material)
        })
      }
    }
  }

  const loader = new GLTFLoader()
  loader.load(
    '/models/dj-controller.glb',
    (gltf) => {
      const controller = gltf.scene
      const bounds = new THREE.Box3().setFromObject(controller)
      const size = bounds.getSize(new THREE.Vector3())
      const center = bounds.getCenter(new THREE.Vector3())
      const scale = 6.6 / Math.max(size.x, size.y, size.z)
      controller.position.sub(center)
      controller.scale.setScalar(scale)
      controller.traverse((child) => {
        if (!(child instanceof THREE.Mesh)) return
        child.castShadow = true
        child.receiveShadow = true
      })
      controllerRig.add(controller)
      registerInteractiveParts(controller)
      isLoading.value = false
    },
    (event) => {
      if (event.total) loadProgress.value = Math.round((event.loaded / event.total) * 100)
    },
    () => {
      isLoading.value = false
      hasError.value = true
    }
  )

  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(4.8, 96),
    new THREE.ShadowMaterial({ color: '#a7795a', opacity: 0.17 })
  )
  shadow.rotation.x = -Math.PI / 2
  shadow.position.y = -1.42
  shadow.receiveShadow = true
  scene.add(shadow)

  scene.add(new THREE.HemisphereLight('#fffaf0', '#aa4a45', 2.35))
  const keyLight = new THREE.DirectionalLight('#fff8e8', 4.8)
  keyLight.position.set(-5, 7, 7)
  keyLight.castShadow = true
  keyLight.shadow.mapSize.set(1024, 1024)
  keyLight.shadow.camera.near = 0.1
  keyLight.shadow.camera.far = 24
  scene.add(keyLight)

  const redLight = new THREE.PointLight('#ff244d', 22, 12, 1.65)
  redLight.position.set(4.5, 1.3, 3.2)
  scene.add(redLight)
  const fillLight = new THREE.PointLight('#ffd9bd', 12, 12, 1.85)
  fillLight.position.set(-4.2, 0.2, -2.5)
  scene.add(fillLight)

  const getInteractiveObject = (object: THREE.Object3D | null) => {
    let current = object
    while (current && current !== controllerRig) {
      if (/^(JogWheel|PlayButton)_(Left|Right)$/.test(current.name)) return current
      current = current.parent
    }
    return null
  }

  const hitTest = (event: PointerEvent) => {
    if (!interactiveTargets.length) return null
    const rect = element.getBoundingClientRect()
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
    raycaster.setFromCamera(pointer, camera)
    const hits = raycaster.intersectObjects(interactiveTargets, true)
      .map((hit) => getInteractiveObject(hit.object))
      .filter((target): target is THREE.Object3D => Boolean(target))
    return hits.find((target) => target.name.startsWith('PlayButton')) ?? hits[0] ?? null
  }

  const updateCursor = (target: THREE.Object3D | null) => {
    isInteractiveHovering.value = Boolean(target)
    element.style.cursor = target?.name.startsWith('JogWheel')
      ? 'ew-resize'
      : target
        ? 'pointer'
        : 'grab'
  }

  const onPointerDown = (event: PointerEvent) => {
    const target = hitTest(event)
    if (!target) return

    event.preventDefault()
    controls.enabled = false
    isDragging.value = false
    element.setPointerCapture(event.pointerId)

    if (target.name.startsWith('PlayButton')) {
      activeButton = target
    } else {
      scrubWheel = target
      isScrubbing.value = true
      lastPointerX = event.clientX
      updateCursor(target)
    }
  }

  const onPointerMove = (event: PointerEvent) => {
    if (scrubWheel) {
      const deltaX = event.clientX - lastPointerX
      lastPointerX = event.clientX
      scrubWheel.rotation.y -= deltaX * 0.024
      emit('seekBy', deltaX * 0.12)
      return
    }

    if (!activeButton) updateCursor(hitTest(event))
  }

  const finishPointerInteraction = (event: PointerEvent, triggerButton: boolean) => {
    if (triggerButton && activeButton) emit('togglePlayback')
    activeButton = null
    scrubWheel = null
    isScrubbing.value = false
    controls.enabled = true
    if (element.hasPointerCapture(event.pointerId)) element.releasePointerCapture(event.pointerId)
    updateCursor(hitTest(event))
  }

  const onPointerUp = (event: PointerEvent) => finishPointerInteraction(event, true)
  const onPointerCancel = (event: PointerEvent) => finishPointerInteraction(event, false)
  const onPointerLeave = () => {
    if (!activeButton && !scrubWheel) updateCursor(null)
  }

  element.addEventListener('pointerdown', onPointerDown)
  element.addEventListener('pointermove', onPointerMove)
  element.addEventListener('pointerup', onPointerUp)
  element.addEventListener('pointercancel', onPointerCancel)
  element.addEventListener('pointerleave', onPointerLeave)

  const resize = () => {
    const parent = element.parentElement
    if (!parent) return
    const { width, height } = parent.getBoundingClientRect()
    renderer.setSize(width, height, false)
    camera.aspect = width / height
    if (width < 640) {
      camera.position.set(5.7, 4.35, 10.7)
      controls.target.set(0, 0.35, 0)
    } else if (width < 1024) {
      camera.position.set(5.8, 3.8, 9.4)
      controls.target.set(0, 0, 0)
    } else {
      camera.position.set(5.4, 3.45, 8.2)
      controls.target.set(0, -0.15, 0)
    }
    camera.updateProjectionMatrix()
    controls.update()
  }

  const observer = new ResizeObserver(resize)
  observer.observe(element.parentElement ?? element)
  resize()

  let animationFrame = 0
  let elapsed = 0
  const clock = new THREE.Clock()
  const animate = () => {
    const delta = Math.min(clock.getDelta(), 0.05)
    elapsed += delta
    if (!isDragging.value && controllerRig.children.length) controllerRig.position.y = Math.sin(elapsed) * 0.035

    for (const wheel of jogWheels) {
      if (props.isPlaying && wheel !== scrubWheel) wheel.rotation.y -= delta * 2.15
    }

    for (const button of playButtons) {
      const baseY = buttonBaseY.get(button) ?? button.position.y
      const targetY = button === activeButton ? baseY - 0.006 : baseY
      button.position.y = THREE.MathUtils.lerp(button.position.y, targetY, button === activeButton ? 0.34 : 0.2)
    }

    const glow = props.isPlaying ? 1.1 + Math.sin(elapsed * 4.8) * 0.3 : 0.05
    for (const material of buttonMaterials) {
      material.emissive.set('#ff3150')
      material.emissiveIntensity = glow
    }

    controls.update()
    renderer.render(scene, camera)
    animationFrame = requestAnimationFrame(animate)
  }
  animate()

  cleanup = () => {
    cancelAnimationFrame(animationFrame)
    observer.disconnect()
    element.removeEventListener('pointerdown', onPointerDown)
    element.removeEventListener('pointermove', onPointerMove)
    element.removeEventListener('pointerup', onPointerUp)
    element.removeEventListener('pointercancel', onPointerCancel)
    element.removeEventListener('pointerleave', onPointerLeave)
    controls.dispose()
    shadow.geometry.dispose()
    ;(shadow.material as THREE.Material).dispose()
    environmentTarget.dispose()
    wiperGeometry.dispose()
    wiperMaterial.dispose()
    buttonHitGeometry.dispose()
    buttonHitMaterial.dispose()
    buttonMaterials.forEach((material) => material.dispose())
    renderer.dispose()
  }
})

onBeforeUnmount(() => cleanup?.())
</script>

<template>
  <div
    class="scene-wrap"
    :class="{
      'is-dragging': isDragging,
      'is-scrubbing': isScrubbing,
      'is-interactive': isInteractiveHovering
    }"
  >
    <canvas ref="canvas" class="scene-canvas" aria-label="Interaktives 3D-Modell eines DJ-Controllers. Mit Maus oder Finger drehbar." />
    <Transition name="loading-fade">
      <div v-if="isLoading" class="model-status" role="status">
        <span class="model-status__line"><i :style="{ width: `${loadProgress}%` }" /></span>
        <span>Controller lädt · {{ loadProgress }}%</span>
      </div>
    </Transition>
    <p v-if="hasError" class="model-error" role="alert">Das 3D-Modell konnte nicht geladen werden.</p>
  </div>
</template>
