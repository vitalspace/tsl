<script lang="ts">
  import { T } from '@threlte/core'
  import { OrbitControls } from '@threlte/extras'
  import Tornado from './Tornado.svelte'

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
</script>

<T.PerspectiveCamera
  makeDefault
  fov={25}
  position={[1, 1, 3]}
>
  <OrbitControls 
    target={[0, 0.4, 0]}
    enableDamping={true}
    minDistance={0.1}
    maxDistance={50}
  />
</T.PerspectiveCamera>

<!-- Ambient lighting -->
<T.AmbientLight intensity={0.2} />

<!-- Tornado -->
<Tornado 
  {emissiveColor}
  {timeScale}
  {parabolStrength}
  {parabolOffset}
  {parabolAmplitude}
/>