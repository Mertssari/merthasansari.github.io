import * as THREE from 'three'
import { GLTFLoader } from 'https://unpkg.com/three@0.167.1/examples/jsm/loaders/GLTFLoader.js'

const mount = document.getElementById('hero-3d-root')

if (!mount) {
  console.warn('hero-3d-root not found')
} else {
  const scene = new THREE.Scene()
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(mount.clientWidth, mount.clientHeight)
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.shadowMap.enabled = true
  mount.appendChild(renderer.domElement)

  const camera = new THREE.PerspectiveCamera(
    35,
    mount.clientWidth / mount.clientHeight,
    0.1,
    100
  )
  camera.position.set(0, 1.2, 5)

  const ambient = new THREE.AmbientLight(0xffffff, 1.1)
  scene.add(ambient)

  const keyLight = new THREE.DirectionalLight(0xb8ffd1, 2.2)
  keyLight.position.set(4, 6, 5)
  keyLight.castShadow = true
  scene.add(keyLight)

  const rimLight = new THREE.DirectionalLight(0x6fd9a4, 1)
  rimLight.position.set(-4, 2, -2)
  scene.add(rimLight)

  const fillLight = new THREE.PointLight(0xc6ffda, 1.2, 20)
  fillLight.position.set(-2, 2, 3)
  scene.add(fillLight)

  const characterRoot = new THREE.Group()
  const baseY = -1.6
  const baseRightArmX = 1.2
  const baseRightArmZ = -0.15
  const baseLeftArmX = 1.5
  const baseLeftArmZ = -0.1
  characterRoot.position.set(0, baseY, 0)
  scene.add(characterRoot)

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
  }

  gltfLoader.load('public/model.glb', applyModel, undefined, (error) => {
    console.error('GLB load failed', error)
  })

  let scrollProgress = 0
  let pointerX = 0
  let pointerY = 0

  const updateScroll = () => {
    const maxScroll = Math.max(document.body.scrollHeight - window.innerHeight, 1)
    scrollProgress = window.scrollY / maxScroll
  }

  const updatePointer = (event) => {
    pointerX = (event.clientX / window.innerWidth) * 2 - 1
    pointerY = (event.clientY / window.innerHeight) * 2 - 1
  }

  const handleResize = () => {
    camera.aspect = mount.clientWidth / mount.clientHeight
    camera.updateProjectionMatrix()
    renderer.setSize(mount.clientWidth, mount.clientHeight)
  }

  updateScroll()
  window.addEventListener('scroll', updateScroll, { passive: true })
  window.addEventListener('mousemove', updatePointer)
  window.addEventListener('resize', handleResize)

  const clock = new THREE.Clock()

  const animate = () => {
    const t = clock.getElapsedTime()

    const idleStrength = 1 - Math.min(scrollProgress * 1.2, 1)
    const idleBob = Math.sin(t * 1.6) * 0.03 * idleStrength
    const idleSwayX = Math.sin(t * 0.9) * 0.03 * idleStrength
    const idleSwayZ = Math.sin(t * 1.1 + 0.5) * 0.04 * idleStrength
    const waveStrength = idleStrength * 0.8
    const wave = Math.sin(t * 2.2) * 0.25 * waveStrength
    const waveRaise = -1.6 * waveStrength
    const waveSide = 0.35 * waveStrength

    characterRoot.rotation.y = THREE.MathUtils.lerp(
      characterRoot.rotation.y,
      pointerX * 0.25,
      0.06
    )
    characterRoot.position.y = baseY + Math.sin(t * 0.8) * 0.06 + idleBob

    const reach = 1.1 * scrollProgress
    const lean = 0.3 * scrollProgress

    characterRoot.position.z = THREE.MathUtils.lerp(
      characterRoot.position.z,
      0.2 + reach,
      0.08
    )

    const bodyLeanX = lean + idleSwayX
    const bodyLeanZ = -0.05 * scrollProgress + idleSwayZ

    if (spineBone) {
      spineBone.rotation.x = THREE.MathUtils.lerp(spineBone.rotation.x, bodyLeanX * 0.6, 0.08)
      spineBone.rotation.z = THREE.MathUtils.lerp(spineBone.rotation.z, bodyLeanZ * 0.6, 0.08)
    }

    if (chestBone) {
      chestBone.rotation.x = THREE.MathUtils.lerp(chestBone.rotation.x, bodyLeanX * 0.8, 0.08)
      chestBone.rotation.z = THREE.MathUtils.lerp(chestBone.rotation.z, bodyLeanZ, 0.08)
    }

    if (!spineBone && !chestBone) {
      characterRoot.rotation.x = THREE.MathUtils.lerp(characterRoot.rotation.x, bodyLeanX, 0.08)
      characterRoot.rotation.z = THREE.MathUtils.lerp(characterRoot.rotation.z, bodyLeanZ, 0.08)
    }

    if (headBone) {
      const idleHeadX = Math.sin(t * 1.8) * 0.08 * idleStrength
      const idleHeadY = Math.sin(t * 1.3 + 1.2) * 0.06 * idleStrength
      headBone.rotation.x = THREE.MathUtils.lerp(
        headBone.rotation.x,
        pointerY * 0.35 + idleHeadX,
        0.08
      )
      headBone.rotation.y = THREE.MathUtils.lerp(
        headBone.rotation.y,
        pointerX * 0.25 + idleHeadY,
        0.08
      )
    }

    if (rightArm) {
      const idleArmX = Math.sin(t * 1.1 + 0.5) * 0.06 * idleStrength
      const idleArmZ = Math.sin(t * 1.4) * 0.08 * idleStrength
      rightArm.rotation.x = THREE.MathUtils.lerp(
        rightArm.rotation.x,
        baseRightArmX - 0.5 * scrollProgress + idleArmX + waveRaise - 0.3,
        0.1
      )
      rightArm.rotation.z = THREE.MathUtils.lerp(
        rightArm.rotation.z,
        baseRightArmZ + 0.1 * scrollProgress + idleArmZ - 0.15 * waveStrength,
        0.1
      )
    }

    if (rightForearm) {
      rightForearm.rotation.x = THREE.MathUtils.lerp(
        rightForearm.rotation.x,
        -1.35 - 0.1 * scrollProgress + wave * 0.2,
        0.1
      )
      rightForearm.rotation.y = THREE.MathUtils.lerp(
        rightForearm.rotation.y,
        wave * 0.5,
        0.1
      )
    }

    if (rightHand) {
      rightHand.rotation.x = THREE.MathUtils.lerp(
        rightHand.rotation.x,
        0.1 - 0.05 * scrollProgress,
        0.1
      )
      rightHand.rotation.y = THREE.MathUtils.lerp(
        rightHand.rotation.y,
        0.9 + wave * 0.5,
        0.1
      )
      rightHand.rotation.z = THREE.MathUtils.lerp(
        rightHand.rotation.z,
        -0.15,
        0.1
      )
    }

    if (leftArm) {
      const idleArmX = Math.sin(t * 1.15) * 0.05 * idleStrength
      const idleArmZ = Math.sin(t * 1.4 + 1.2) * 0.07 * idleStrength
      leftArm.rotation.x = THREE.MathUtils.lerp(
        leftArm.rotation.x,
        baseLeftArmX - 0.25 * scrollProgress + idleArmX,
        0.1
      )
      leftArm.rotation.z = THREE.MathUtils.lerp(
        leftArm.rotation.z,
        baseLeftArmZ - idleArmZ,
        0.1
      )
    }

    const targetZ = 5 - scrollProgress * 1.4
    const targetY = 1.25
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.06)
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, 0.06)
    camera.lookAt(0, 1.25, 0)

    renderer.render(scene, camera)
    requestAnimationFrame(animate)
  }

  animate()
}
