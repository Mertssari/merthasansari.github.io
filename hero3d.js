import * as THREE from 'https://unpkg.com/three@0.167.1/build/three.module.js'

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
  camera.position.set(0, 1.4, 5)

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

  const group = new THREE.Group()
  group.position.set(0, -2.2, 0)
  scene.add(group)

  const skinMat = new THREE.MeshStandardMaterial({
    color: 0xf1c7a3,
    roughness: 0.4
  })
  const shirtMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.5
  })
  const pantsMat = new THREE.MeshStandardMaterial({
    color: 0x0f0f0f,
    roughness: 0.7
  })
  const hairMat = new THREE.MeshStandardMaterial({
    color: 0x1b1b1b,
    roughness: 0.7
  })
  const eyeMat = new THREE.MeshStandardMaterial({
    color: 0x49a6ff,
    emissive: 0x49a6ff,
    emissiveIntensity: 0.5
  })

  const body = new THREE.Group()
  group.add(body)

  const torso = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.5, 1.35, 10, 20),
    shirtMat
  )
  torso.position.set(0, 1.5, 0)
  body.add(torso)

  const waist = new THREE.Mesh(
    new THREE.CylinderGeometry(0.4, 0.45, 0.6, 20),
    new THREE.MeshStandardMaterial({ color: 0xe8e8e8, roughness: 0.6 })
  )
  waist.position.set(0, 0.6, 0)
  body.add(waist)

  const headGroup = new THREE.Group()
  headGroup.position.set(0, 2.6, 0)
  body.add(headGroup)

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.46, 32, 32), skinMat)
  headGroup.add(head)

  const hair = new THREE.Mesh(new THREE.SphereGeometry(0.48, 32, 32), hairMat)
  hair.position.set(0, 0.18, 0)
  headGroup.add(hair)

  const eyeLeft = new THREE.Mesh(new THREE.SphereGeometry(0.04, 16, 16), eyeMat)
  eyeLeft.position.set(-0.12, 0.03, 0.4)
  headGroup.add(eyeLeft)

  const eyeRight = new THREE.Mesh(new THREE.SphereGeometry(0.04, 16, 16), eyeMat)
  eyeRight.position.set(0.12, 0.03, 0.4)
  headGroup.add(eyeRight)

  const beard = new THREE.Mesh(
    new THREE.BoxGeometry(0.28, 0.12, 0.06),
    new THREE.MeshStandardMaterial({ color: 0x151515 })
  )
  beard.position.set(0, -0.17, 0.33)
  headGroup.add(beard)

  const rightArm = new THREE.Group()
  rightArm.position.set(0.8, 1.65, 0)
  body.add(rightArm)

  const rightUpper = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.13, 0.9, 8, 16),
    skinMat
  )
  rightUpper.rotation.set(0.1, 0, -0.2)
  rightArm.add(rightUpper)

  const rightLower = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.11, 0.7, 8, 16),
    skinMat
  )
  rightLower.position.set(0.08, -0.7, 0.2)
  rightLower.rotation.set(0.2, 0.1, 0.1)
  rightArm.add(rightLower)

  const rightHand = new THREE.Group()
  rightHand.position.set(0.05, -1.0, 0.6)
  rightArm.add(rightHand)

  const palm = new THREE.Mesh(
    new THREE.SphereGeometry(0.22, 32, 32),
    skinMat
  )
  palm.scale.set(1.1, 0.6, 1.3)
  rightHand.add(palm)

  const fingers = []
  for (let i = 0; i < 4; i += 1) {
    const finger = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03, 0.03, 0.22, 10),
      skinMat
    )
    finger.position.set(-0.18 + i * 0.12, 0.05, 0.18)
    finger.rotation.set(0.05, 0, 0.18 * (i - 1.5))
    rightHand.add(finger)
    fingers.push(finger)
  }

  const thumb = new THREE.Mesh(
    new THREE.CylinderGeometry(0.035, 0.035, 0.2, 10),
    skinMat
  )
  thumb.position.set(-0.32, -0.03, 0.12)
  thumb.rotation.set(0.2, 0.1, 0.6)
  rightHand.add(thumb)

  const leftArm = new THREE.Group()
  leftArm.position.set(-0.8, 1.6, 0)
  body.add(leftArm)

  const leftUpper = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.12, 0.9, 8, 16),
    skinMat
  )
  leftUpper.rotation.set(0.1, 0, 0.2)
  leftArm.add(leftUpper)

  const leftLower = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.11, 0.7, 8, 16),
    skinMat
  )
  leftLower.position.set(-0.05, -0.65, 0.1)
  leftLower.rotation.set(0.1, 0, 0.15)
  leftArm.add(leftLower)

  const leftLeg = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.14, 1.25, 8, 16),
    pantsMat
  )
  leftLeg.position.set(-0.22, 0, 0)
  body.add(leftLeg)

  const rightLeg = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.14, 1.25, 8, 16),
    pantsMat
  )
  rightLeg.position.set(0.22, 0, 0)
  body.add(rightLeg)

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

    group.rotation.y = THREE.MathUtils.lerp(group.rotation.y, pointerX * 0.25, 0.06)
    headGroup.rotation.x = THREE.MathUtils.lerp(headGroup.rotation.x, -pointerY * 0.12, 0.06)

    body.position.y = Math.sin(t * 1.6) * 0.03
    group.position.y = -2.2 + Math.sin(t * 0.8) * 0.05

    const reach = 1.8 * scrollProgress
    const lean = 0.3 * scrollProgress

    group.position.z = THREE.MathUtils.lerp(group.position.z, 0.2 + scrollProgress * 1.2, 0.08)

    rightArm.rotation.x = THREE.MathUtils.lerp(rightArm.rotation.x, -1.2 * scrollProgress, 0.1)
    rightArm.rotation.z = THREE.MathUtils.lerp(rightArm.rotation.z, 0.1 * scrollProgress, 0.1)
    rightArm.position.z = THREE.MathUtils.lerp(rightArm.position.z, reach, 0.1)
    rightArm.position.y = THREE.MathUtils.lerp(rightArm.position.y, 0.5 + 0.4 * scrollProgress, 0.1)

    rightHand.position.z = THREE.MathUtils.lerp(rightHand.position.z, 0.6 + 1.2 * scrollProgress, 0.12)
    rightHand.scale.setScalar(1 + scrollProgress * 0.6)

    leftArm.rotation.x = THREE.MathUtils.lerp(leftArm.rotation.x, -0.4 * scrollProgress, 0.1)
    leftArm.position.z = THREE.MathUtils.lerp(leftArm.position.z, 0.3 * scrollProgress, 0.1)

    body.rotation.x = THREE.MathUtils.lerp(body.rotation.x, lean, 0.1)
    body.rotation.z = THREE.MathUtils.lerp(body.rotation.z, -0.05 * scrollProgress, 0.1)

    eyeLeft.position.x = -0.12 + THREE.MathUtils.clamp(pointerX * 0.05, -0.04, 0.04)
    eyeRight.position.x = 0.12 + THREE.MathUtils.clamp(pointerX * 0.05, -0.04, 0.04)
    eyeLeft.position.y = 0.03 + THREE.MathUtils.clamp(pointerY * 0.03, -0.03, 0.03)
    eyeRight.position.y = 0.03 + THREE.MathUtils.clamp(pointerY * 0.03, -0.03, 0.03)

    fingers.forEach((finger, index) => {
      finger.rotation.x = THREE.MathUtils.lerp(
        finger.rotation.x,
        -0.3 * scrollProgress + Math.sin(t * 2 + index) * 0.05,
        0.12
      )
    })

    const targetZ = 5 - scrollProgress * 1.4
    const targetY = 1.35 + scrollProgress * 0.2
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.06)
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, 0.06)
    camera.lookAt(0, 1.4, 0)

    renderer.render(scene, camera)
    requestAnimationFrame(animate)
  }

  animate()
}
