<script lang="ts">
  import { Fn, cos, float, uniform, vec4, vec3 } from 'three/tsl'
  import type { NodeRepresentation } from 'three/tsl'
  import { T, useTask } from '@threlte/core'
  import { useTexture, OrbitControls } from '@threlte/extras'
  import { lightningEmissive } from './shaders/LightningShader'
  import SkyDome from './SkyDome.svelte'

  const defaultEmissiveIntensity = 1

  let { 
    emissiveIntensity = defaultEmissiveIntensity,
    lightningIntensity = 1.0,
    flashFrequency = 1.5
  }: { 
    emissiveIntensity: number,
    lightningIntensity?: number,
    flashFrequency?: number
  } = $props()

  const uTime = uniform(0)
  const uIntensity = uniform(defaultEmissiveIntensity)
  const uLightningIntensity = uniform(lightningIntensity)

  $effect(() => {
    uIntensity.value = emissiveIntensity
    uLightningIntensity.value = lightningIntensity
  })

  let positionY = $state(0)

  useTask((delta) => {
    uTime.value += delta
    positionY = 0.1 * Math.sin(uTime.value)
  })

  const red = Fn(([time, intensity]: [NodeRepresentation, NodeRepresentation]) => {
    const r = float(1).add(cos(time)).mul(0.5)
    return vec4(r.mul(intensity), 0, 0, 1)
  })

  const texture = useTexture('/pixel-sky.png')
</script>

<!-- Domo del cielo con rayos -->
<SkyDome 
  time={uTime} 
  {lightningIntensity}
  {flashFrequency}
  skyColor={[0.05, 0.1, 0.2]}
  lightningColor={[0.9, 0.95, 1.0]}
/>

<T.PerspectiveCamera
  makeDefault
  position={[2, 1, 2]}
>
  <OrbitControls />
</T.PerspectiveCamera>

<!-- Luz ambiental suave -->
<T.AmbientLight intensity={0.3} />

<!-- Luz direccional que simula relámpagos -->
<T.DirectionalLight 
  position={[5, 10, 5]} 
  intensity={0.5}
  color="#ffffff"
/>

{#await texture then map}
  <T.Mesh
    rotation.z={Math.PI}
    position.y={positionY}
  >
    <T.SphereGeometry />
    <T.MeshStandardNodeMaterial
      {map}
      emissiveNode={mix(
        red(uTime, uIntensity),
        vec4(lightningEmissive(uTime, uLightningIntensity), 1),
        0.3
      )}
      roughness={0.7}
      metalness={0.1}
    />
  </T.Mesh>
{/await}

<!-- Plano del suelo para mejor contexto -->
<T.Mesh
  rotation.x={-Math.PI / 2}
  position.y={-2}
>
  <T.PlaneGeometry args={[20, 20]} />
  <T.MeshStandardNodeMaterial
    color="#1a1a2e"
    roughness={0.8}
    metalness={0.1}
    emissiveNode={vec3(0.01, 0.02, 0.05)}
  />
</T.Mesh>