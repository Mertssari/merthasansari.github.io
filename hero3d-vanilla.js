import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const mount = document.getElementById('hero-3d-root')

if (!mount) {
  console.warn('hero-3d-root not found')
} else {
  const scene = new THREE.Scene()
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(mount.clientWidth, mount.clientHeight)
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.15
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  mount.appendChild(renderer.domElement)

  // Soft studio environment for realistic, professional-looking reflections
  const pmremGenerator = new THREE.PMREMGenerator(renderer)
  scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture
  scene.fog = new THREE.Fog(0x090c14, 6, 15)

  const camera = new THREE.PerspectiveCamera(
    35,
    mount.clientWidth / mount.clientHeight,
    0.1,
    100
  )
  camera.position.set(0, 1.2, 5)

  const ambient = new THREE.AmbientLight(0xdfe8ff, 0.55)
  scene.add(ambient)

  const keyLight = new THREE.DirectionalLight(0xaecbff, 2.4)
  keyLight.position.set(4, 6, 5)
  keyLight.castShadow = true
  keyLight.shadow.mapSize.set(1024, 1024)
  keyLight.shadow.radius = 4
  scene.add(keyLight)

  const rimLight = new THREE.DirectionalLight(0x9b6cff, 1.4)
  rimLight.position.set(-4, 3, -3)
  scene.add(rimLight)

  const fillLight = new THREE.PointLight(0x4c8dff, 1.1, 20)
  fillLight.position.set(-2, 2, 3)
  scene.add(fillLight)

  // Soft contact shadow blob beneath the character
  const shadowCanvas = document.createElement('canvas')
  shadowCanvas.width = 256
  shadowCanvas.height = 256
  const ctx = shadowCanvas.getContext('2d')
  const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128)
  gradient.addColorStop(0, 'rgba(0,0,0,0.55)')
  gradient.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 256, 256)
  const shadowTexture = new THREE.CanvasTexture(shadowCanvas)
  const contactShadow = new THREE.Mesh(
    new THREE.PlaneGeometry(2.2, 2.2),
    new THREE.MeshBasicMaterial({ map: shadowTexture, transparent: true, depthWrite: false })
  )
  contactShadow.rotation.x = -Math.PI / 2
  contactShadow.position.y = 0.01

  const characterRoot = new THREE.Group()
  const baseY = -1.6
  // Confident, professional standing pose: both arms rest naturally at the
  // sides with a minor forward bend, no waving — like a portrait on a
  // corporate/product landing page.
  const baseRightArmX = 0.1
  const baseRightArmZ = -0.06
  const baseLeftArmX = 0.1
  const baseLeftArmZ = 0.06
  characterRoot.position.set(0, baseY, 0)
  scene.add(characterRoot)
  characterRoot.add(contactShadow)

  const gltfLoader = new GLTFLoader()

  let model = null
  let headBone = null
  let spineBone = null
  let chestBone = null
  let rightArm = null
  let rightForearm = null
  let rightHand = null
  let leftArm = null

  const findBoneByKeywords = (keywords) => {
    if (!model) return null
    let found = null
    model.traverse((child) => {
      if (!found && child.isBone) {
        const name = child.name.toLowerCase()
        if (keywords.some((keyword) => name.includes(keyword))) {
          found = child
        }
      }
    })
    return found
  }

  const applyModel = (gltf) => {
    model = gltf.scene
    model.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true
        child.receiveShadow = true
        if (child.material) {
          child.material.envMapIntensity = 1.1
        }
      }
    })

    const box = new THREE.Box3().setFromObject(model)
    const size = new THREE.Vector3()
    box.getSize(size)
    const targetHeight = 3.1
    const scale = targetHeight / Math.max(size.y, 0.0001)
    model.scale.setScalar(scale)

    const scaledBox = new THREE.Box3().setFromObject(model)
    const center = new THREE.Vector3()
    scaledBox.getCenter(center)
    model.position.set(-center.x, -scaledBox.min.y, -center.z)

    characterRoot.add(model)

    headBone = findBoneByKeywords(['head'])
    chestBone = findBoneByKeywords(['upperchest', 'chest', 'spine2'])
    spineBone = findBoneByKeywords(['spine', 'hips'])
    rightArm = findBoneByKeywords(['rightarm', 'upperarm_r', 'upperarm.r', 'r_upperarm', 'arm_r'])
    rightForearm = findBoneByKeywords([
      'rightforearm',
      'lowerarm_r',
      'forearm_r',
      'r_forearm'
    ])
    rightHand = findBoneByKeywords(['righthand', 'hand_r', 'r_hand'])
    leftArm = findBoneByKeywords(['leftarm', 'upperarm_l', 'upperarm.l', 'l_upperarm', 'arm_l'])

    gsap.fromTo(
      model.scale,
      { x: 0, y: 0, z: 0 },
      { x: scale, y: scale, z: scale, duration: 1.1, ease: 'back.out(1.6)', delay: 0.2 }
    )
  }

  gltfLoader.load('model.glb', applyModel, undefined, (error) => {
    console.error('GLB load failed', error)
  })

  let scrollProgress = 0
  let pointerX = 0
  let pointerY = 0

  // ScrollTrigger drives a smoothed, scrubbed progress value across the whole page,
  // which the render loop below maps onto rotation / scale / lift for the scrollytelling effect.
  ScrollTrigger.create({
    trigger: document.body,
    start: 'top top',
    end: 'bottom bottom',
    scrub: 0.6,
    onUpdate: (self) => {
      scrollProgress = self.progress
    }
  })

  const updatePointer = (event) => {
    pointerX = (event.clientX / window.innerWidth) * 2 - 1
    pointerY = (event.clientY / window.innerHeight) * 2 - 1
  }

  const handleResize = () => {
    camera.aspect = mount.clientWidth / mount.clientHeight
    camera.updateProjectionMatrix()
    renderer.setSize(mount.clientWidth, mount.clientHeight)
  }

  window.addEventListener('mousemove', updatePointer)
  window.addEventListener('resize', handleResize)

  const clock = new THREE.Clock()

  const animate = () => {
    const t = clock.getElapsedTime()

    const idleStrength = 1 - Math.min(scrollProgress * 1.2, 1)
    const idleBob = Math.sin(t * 1.6) * 0.03 * idleStrength
    const idleSwayX = Math.sin(t * 0.9) * 0.03 * idleStrength
    const idleSwayZ = Math.sin(t * 1.1 + 0.5) * 0.04 * idleStrength
    const breathe = Math.sin(t * 1.3) * 0.04 * idleStrength

    // Scroll-driven spin + lift: the figure slowly turns and rises as the page
    // scrolls, creating the illusion that it is carrying the viewport downward.
    const scrollSpin = scrollProgress * Math.PI * 1.6
    characterRoot.rotation.y = THREE.MathUtils.lerp(
      characterRoot.rotation.y,
      pointerX * 0.22 + scrollSpin,
      0.06
    )
    const scrollLift = scrollProgress * 0.9
    characterRoot.position.y = baseY + scrollLift + Math.sin(t * 0.8) * 0.06 + idleBob

    const scrollScale = 1 + scrollProgress * 0.22
    characterRoot.scale.setScalar(
      THREE.MathUtils.lerp(characterRoot.scale.x || 1, scrollScale, 0.08)
    )

    const reach = 1.1 * scrollProgress
    const lean = 0.3 * scrollProgress

    characterRoot.position.z = THREE.MathUtils.lerp(
      characterRoot.position.z,
      0.2 + reach,
      0.08
    )

    const bodyLeanX = lean + idleSwayX
    const bodyLeanZ = -0.05 * scrollProgress + idleSwayZ
    // Torso subtly turns toward the cursor, like the figure is engaged with
    // the visitor — hips lead least, chest leads most (natural body chain).
    const pointerTurn = pointerX * 0.14

    if (spineBone) {
      spineBone.rotation.x = THREE.MathUtils.lerp(spineBone.rotation.x, bodyLeanX * 0.6, 0.08)
      spineBone.rotation.y = THREE.MathUtils.lerp(spineBone.rotation.y, pointerTurn * 0.4, 0.06)
      spineBone.rotation.z = THREE.MathUtils.lerp(spineBone.rotation.z, bodyLeanZ * 0.6, 0.08)
    }

    if (chestBone) {
      chestBone.rotation.x = THREE.MathUtils.lerp(chestBone.rotation.x, bodyLeanX * 0.8, 0.08)
      chestBone.rotation.y = THREE.MathUtils.lerp(chestBone.rotation.y, pointerTurn * 0.7, 0.06)
      chestBone.rotation.z = THREE.MathUtils.lerp(chestBone.rotation.z, bodyLeanZ, 0.08)
    }

    if (!spineBone && !chestBone) {
      characterRoot.rotation.x = THREE.MathUtils.lerp(characterRoot.rotation.x, bodyLeanX, 0.08)
    }

    if (headBone) {
      const idleHeadX = Math.sin(t * 1.8) * 0.05 * idleStrength
      const idleHeadY = Math.sin(t * 1.3 + 1.2) * 0.04 * idleStrength
      headBone.rotation.x = THREE.MathUtils.lerp(
        headBone.rotation.x,
        pointerY * 0.3 + idleHeadX,
        0.08
      )
      headBone.rotation.y = THREE.MathUtils.lerp(
        headBone.rotation.y,
        pointerX * 0.32 + idleHeadY,
        0.08
      )
    }

    if (rightArm) {
      const idleArmX = Math.sin(t * 1.1 + 0.5) * 0.035 * idleStrength
      const idleArmZ = Math.sin(t * 1.4) * 0.03 * idleStrength
      rightArm.rotation.x = THREE.MathUtils.lerp(
        rightArm.rotation.x,
        baseRightArmX - 0.2 * scrollProgress + idleArmX + breathe * 0.4,
        0.08
      )
      rightArm.rotation.z = THREE.MathUtils.lerp(
        rightArm.rotation.z,
        baseRightArmZ + 0.06 * scrollProgress + idleArmZ,
        0.08
      )
    }

    if (rightForearm) {
      rightForearm.rotation.x = THREE.MathUtils.lerp(
        rightForearm.rotation.x,
        -0.12 - 0.05 * scrollProgress,
        0.08
      )
    }

    if (rightHand) {
      rightHand.rotation.z = THREE.MathUtils.lerp(rightHand.rotation.z, -0.05, 0.08)
    }

    if (leftArm) {
      const idleArmX = Math.sin(t * 1.15) * 0.035 * idleStrength
      const idleArmZ = Math.sin(t * 1.4 + 1.2) * 0.03 * idleStrength
      leftArm.rotation.x = THREE.MathUtils.lerp(
        leftArm.rotation.x,
        baseLeftArmX - 0.15 * scrollProgress + idleArmX + breathe * 0.4,
        0.08
      )
      leftArm.rotation.z = THREE.MathUtils.lerp(
        leftArm.rotation.z,
        baseLeftArmZ - idleArmZ,
        0.08
      )
    }

    contactShadow.material.opacity = THREE.MathUtils.clamp(1 - scrollProgress * 1.3, 0, 1)

    const targetZ = 5 - scrollProgress * 1.4
    const targetY = 1.25
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.06)
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, 0.06)
    // Gentle camera parallax toward the cursor adds depth and makes the
    // scene feel alive and responsive without moving the character itself.
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, pointerX * 0.35, 0.05)
    camera.lookAt(0, 1.25, 0)

    renderer.render(scene, camera)
    requestAnimationFrame(animate)
  }

  animate()
}
