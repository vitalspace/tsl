<script lang="ts">
  import { T } from '@threlte/core'
  import { skyLightningShader } from './shaders/LightningShader'
  import { uniform, vec3 } from 'three/tsl'

  let { 
    time,
    lightningIntensity = 1.0,
    flashFrequency = 1.5,
    skyColor = [0.1, 0.2, 0.4],
    lightningColor = [0.9, 0.95, 1.0]
  }: { 
    time: any,
    lightningIntensity?: number,
    flashFrequency?: number,
    skyColor?: number[],
    lightningColor?: number[]
  } = $props()

  const uLightningIntensity = uniform(lightningIntensity)
  const uFlashFrequency = uniform(flashFrequency)
  const uSkyColor = uniform(vec3(...skyColor))
  const uLightningColor = uniform(vec3(...lightningColor))

  $effect(() => {
    uLightningIntensity.value = lightningIntensity
    uFlashFrequency.value = flashFrequency
    uSkyColor.value.set(...skyColor)
    uLightningColor.value.set(...lightningColor)
  })
</script>

<T.Mesh
  scale={[50, 50, 50]}
  rotation={[0, 0, 0]}
>
  <T.SphereGeometry args={[1, 32, 16]} />
  <T.MeshBasicNodeMaterial
    side={1}
    colorNode={skyLightningShader(
      T.uv(),
      time,
      uLightningIntensity,
      uFlashFrequency,
      uSkyColor,
      uLightningColor
    )}
  />
</T.Mesh>