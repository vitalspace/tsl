<script lang="ts">
  import Scene from './lib/Scene.svelte'
  import { Canvas, extend } from '@threlte/core'
  import { Pane, Slider, Color } from 'svelte-tweakpane-ui'
  import { MeshStandardNodeMaterial, MeshBasicNodeMaterial, WebGPURenderer } from 'three/webgpu'
  import { uv } from 'three/tsl'

  extend({ MeshStandardNodeMaterial, MeshBasicNodeMaterial, uv })

  let emissiveIntensity = $state(0.5)
  let lightningIntensity = $state(2.0)
  let flashFrequency = $state(0.8)
</script>

<div>
  <Pane
    title="Storm Sky Controls"
    position="fixed"
  >
    <Slider
      bind:value={emissiveIntensity}
      label="Sphere Emissive"
      max={2}
      min={0}
      step={0.1}
    />
    <Slider
      bind:value={lightningIntensity}
      label="Lightning Intensity"
      max={5}
      min={0}
      step={0.1}
    />
    <Slider
      bind:value={flashFrequency}
      label="Flash Frequency"
      max={3}
      min={0.1}
      step={0.1}
    />
  </Pane>
  <Canvas
    createRenderer={(canvas) => {
      return new WebGPURenderer({
        antialias: true,
        canvas,
        forceWebGL: false
      })
    }}
  >
    <Scene 
      {emissiveIntensity} 
      {lightningIntensity}
      {flashFrequency}
    />
  </Canvas>
</div>

<style>
  div {
    height: 100%;
    background: #050510;
  }
</style>