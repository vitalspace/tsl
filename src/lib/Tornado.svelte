<script lang="ts">
  import { T, useTask } from '@threlte/core'
  import { useTexture } from '@threlte/extras'
  import { 
    Fn, 
    vec2, 
    vec3, 
    vec4, 
    float, 
    uniform, 
    uv, 
    sin, 
    cos, 
    atan, 
    PI, 
    PI2,
    time,
    positionLocal,
    texture,
    oneMinus,
    min,
    smoothstep,
    luminance,
    color,
    step,
    pow,
    add,
    mul,
    sub,
    div,
    length,
    remap
  } from 'three/tsl'
  import type { NodeRepresentation } from 'three/tsl'
  import * as THREE from 'three'

  let { 
    emissiveColor = '#ff8b4d',
    timeScale = 0.2,
    parabolStrength = 1,
    parabolOffset = 0.3,
    parabolAmplitude = 0.2
  }: { 
    emissiveColor?: string,
    timeScale?: number,
    parabolStrength?: number,
    parabolOffset?: number,
    parabolAmplitude?: number
  } = $props()

  // Uniforms
  const uEmissiveColor = uniform(color(emissiveColor))
  const uTimeScale = uniform(timeScale)
  const uParabolStrength = uniform(parabolStrength)
  const uParabolOffset = uniform(parabolOffset)
  const uParabolAmplitude = uniform(parabolAmplitude)

  $effect(() => {
    uEmissiveColor.value.set(emissiveColor)
    uTimeScale.value = timeScale
    uParabolStrength.value = parabolStrength
    uParabolOffset.value = parabolOffset
    uParabolAmplitude.value = parabolAmplitude
  })

  // Load perlin noise texture
  const perlinTexture = useTexture('/textures/noises/perlin/rgb-256x256.png')

  // Create cylinder geometry with proper translation
  const cylinderGeometry = new THREE.CylinderGeometry(1, 1, 1, 20, 20, true)
  cylinderGeometry.translate(0, 0.5, 0)

  // TSL Functions
  const toRadialUv = Fn(([uv, multiplier, rotation, offset]: [NodeRepresentation, NodeRepresentation, NodeRepresentation, NodeRepresentation]) => {
    const centeredUv = uv.sub(0.5)
    const distanceToCenter = length(centeredUv)
    const angle = atan(centeredUv.y, centeredUv.x)
    let radialUv = vec2(angle.add(PI).div(PI2), distanceToCenter)
    radialUv = radialUv.mul(multiplier)
    radialUv = vec2(radialUv.x.add(rotation), radialUv.y.add(offset))
    return radialUv
  })

  const toSkewedUv = Fn(([uv, skew]: [NodeRepresentation, NodeRepresentation]) => {
    return vec2(
      uv.x.add(uv.y.mul(skew.x)),
      uv.y.add(uv.x.mul(skew.y))
    )
  })

  const twistedCylinder = Fn(([position, parabolStrength, parabolOffset, parabolAmplitude, time]: [NodeRepresentation, NodeRepresentation, NodeRepresentation, NodeRepresentation, NodeRepresentation]) => {
    const angle = atan(position.z, position.x)
    const elevation = position.y

    // Parabola
    let radius = parabolStrength.mul(position.y.sub(parabolOffset)).pow(2).add(parabolAmplitude)

    // Turbulences
    radius = radius.add(sin(elevation.sub(time).mul(20).add(angle.mul(2))).mul(0.05))

    const twistedPosition = vec3(
      cos(angle).mul(radius),
      elevation,
      sin(angle).mul(radius)
    )

    return twistedPosition
  })

  // Floor material function
  const floorMaterial = Fn(([perlinTex]: [NodeRepresentation]) => {
    const scaledTime = time.mul(uTimeScale)

    // Noise 1
    let noise1Uv = toRadialUv(
      uv(),
      vec2(0.5, 0.5),
      scaledTime,
      scaledTime
    )
    noise1Uv = toSkewedUv(noise1Uv, vec2(-1, 0))
    noise1Uv = noise1Uv.mul(vec2(4, 1))
    
    const noise1 = texture(perlinTex, noise1Uv, 1).r.remap(0.45, 0.7)

    // Noise 2
    let noise2Uv = toRadialUv(
      uv(),
      vec2(2, 8),
      scaledTime.mul(2),
      scaledTime.mul(8)
    )
    noise2Uv = toSkewedUv(noise2Uv, vec2(-0.25, 0))
    noise2Uv = noise2Uv.mul(vec2(2, 0.25))
    
    const noise2 = texture(perlinTex, noise2Uv, 1).b.remap(0.45, 0.7)

    // Outer fade
    const distanceToCenter = uv().sub(0.5)
    const outerFade = min(
      oneMinus(length(distanceToCenter)).smoothstep(0.5, 0.9),
      length(distanceToCenter).smoothstep(0, 0.2)
    )

    // Effect
    const effect = noise1.mul(noise2).mul(outerFade)

    // Output
    return vec4(
      uEmissiveColor.mul(step(float(0.2), effect)).mul(3), // Emissive
      effect.smoothstep(0, 0.01) // Alpha
    )
  })

  // Emissive cylinder material function
  const emissiveMaterial = Fn(([perlinTex]: [NodeRepresentation]) => {
    const scaledTime = time.mul(uTimeScale)

    // Noise 1
    let noise1Uv = uv().add(vec2(scaledTime, scaledTime.negate()))
    noise1Uv = toSkewedUv(noise1Uv, vec2(-1, 0))
    noise1Uv = noise1Uv.mul(vec2(2, 0.25))
    const noise1 = texture(perlinTex, noise1Uv, 1).r.remap(0.45, 0.7)

    // Noise 2
    let noise2Uv = uv().add(vec2(scaledTime.mul(0.5), scaledTime.negate()))
    noise2Uv = toSkewedUv(noise2Uv, vec2(-1, 0))
    noise2Uv = noise2Uv.mul(vec2(5, 1))
    const noise2 = texture(perlinTex, noise2Uv, 1).g.remap(0.45, 0.7)

    // Outer fade
    const outerFade = min(
      uv().y.smoothstep(0, 0.1),
      oneMinus(uv().y).smoothstep(0, 0.4)
    )

    // Effect
    const effect = noise1.mul(noise2).mul(outerFade)

    const emissiveColorLuminance = luminance(uEmissiveColor)

    // Output
    return vec4(
      uEmissiveColor.mul(1.2).div(emissiveColorLuminance), // emissive
      effect.smoothstep(0, 0.1) // alpha
    )
  })

  // Dark cylinder material function
  const darkMaterial = Fn(([perlinTex]: [NodeRepresentation]) => {
    const scaledTime = time.mul(uTimeScale).add(123.4)

    // Noise 1
    let noise1Uv = uv().add(vec2(scaledTime, scaledTime.negate()))
    noise1Uv = toSkewedUv(noise1Uv, vec2(-1, 0))
    noise1Uv = noise1Uv.mul(vec2(2, 0.25))
    const noise1 = texture(perlinTex, noise1Uv, 1).g.remap(0.45, 0.7)

    // Noise 2
    let noise2Uv = uv().add(vec2(scaledTime.mul(0.5), scaledTime.negate()))
    noise2Uv = toSkewedUv(noise2Uv, vec2(-1, 0))
    noise2Uv = noise2Uv.mul(vec2(5, 1))
    const noise2 = texture(perlinTex, noise2Uv, 1).b.remap(0.45, 0.7)

    // Outer fade
    const outerFade = min(
      uv().y.smoothstep(0, 0.2),
      oneMinus(uv().y).smoothstep(0, 0.4)
    )

    // Effect
    const effect = noise1.mul(noise2).mul(outerFade)

    return vec4(
      vec3(0),
      effect.smoothstep(0, 0.01)
    )
  })
</script>

{#await perlinTexture then perlinTex}
  {@const uPerlinTex = uniform(perlinTex)}
  
  <!-- Tornado Floor -->
  <T.Mesh rotation.x={-Math.PI * 0.5}>
    <T.PlaneGeometry args={[2, 2]} />
    <T.MeshBasicNodeMaterial 
      transparent={true}
      outputNode={floorMaterial(uPerlinTex)}
    />
  </T.Mesh>

  <!-- Tornado Emissive Cylinder -->
  <T.Mesh geometry={cylinderGeometry}>
    <T.MeshBasicNodeMaterial 
      transparent={true}
      side={2}
      positionNode={twistedCylinder(
        positionLocal, 
        uParabolStrength, 
        uParabolOffset, 
        uParabolAmplitude.sub(0.05), 
        time.mul(uTimeScale)
      )}
      outputNode={emissiveMaterial(uPerlinTex)}
    />
  </T.Mesh>

  <!-- Tornado Dark Cylinder -->
  <T.Mesh geometry={cylinderGeometry}>
    <T.MeshBasicNodeMaterial 
      transparent={true}
      side={2}
      positionNode={twistedCylinder(
        positionLocal, 
        uParabolStrength, 
        uParabolOffset, 
        uParabolAmplitude, 
        time.mul(uTimeScale)
      )}
      outputNode={darkMaterial(uPerlinTex)}
    />
  </T.Mesh>
{/await}