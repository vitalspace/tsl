<script lang="ts">
  import { T } from '@threlte/core'
  import { skyLightningShader } from './shaders/LightningShader'
  import { uniform, vec3, uv } from 'three/tsl'

  let { 
    time,
    lightningIntensity = 1.0,
    flashFrequency = 1.5,
    skyColor = [0.1, 0.15, 0.3],
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
  scale={[100, 100, 100]}
  rotation={[0, 0, 0]}
>
  <T.SphereGeometry args={[1, 64, 32]} />
  <T.MeshBasicNodeMaterial
    side={1}
    colorNode={skyLightningShader(
      uv(),
      time,
      uLightningIntensity,
      uFlashFrequency,
      uSkyColor,
      uLightningColor
    )}
  />
</T.Mesh>