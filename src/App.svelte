<script lang="ts">
  import Scene from './lib/Scene.svelte'
  import { Canvas, extend } from '@threlte/core'
  import { Pane, Slider, Color } from 'svelte-tweakpane-ui'
  import { MeshStandardNodeMaterial, MeshBasicNodeMaterial, WebGPURenderer } from 'three/webgpu'

  extend({ MeshStandardNodeMaterial, MeshBasicNodeMaterial })

  let emissiveIntensity = $state(0.5)
  let lightningIntensity = $state(1.2)
  let flashFrequency = $state(1.8)
</script>

<div>
  <Pane
    title="Lightning Sky Controls"
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
      max={3}
      min={0}
      step={0.1}
    />
    <Slider
      bind:value={flashFrequency}
      label="Flash Frequency"
      max={5}
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
    background: #0a0a0f;
  }
</style>