<script lang="ts">
  import TornadoScene from './lib/TornadoScene.svelte'
  import { Canvas, extend } from '@threlte/core'
  import { Pane, Slider, Color } from 'svelte-tweakpane-ui'
  import { MeshStandardNodeMaterial, MeshBasicNodeMaterial, WebGPURenderer } from 'three/webgpu'
  import { 
    uv, 
    time, 
    positionLocal, 
    texture, 
    luminance, 
    color,
    vec2,
    vec3,
    vec4,
    float,
    uniform,
    sin,
    cos,
    atan,
    PI,
    PI2,
    oneMinus,
    min,
    smoothstep,
    step,
    pow,
    add,
    mul,
    sub,
    div,
    length,
    remap,
    Fn
  } from 'three/tsl'

  extend({ 
    MeshStandardNodeMaterial, 
    MeshBasicNodeMaterial, 
    uv, 
    time, 
    positionLocal, 
    texture, 
    luminance, 
    color,
    vec2,
    vec3,
    vec4,
    float,
    uniform,
    sin,
    cos,
    atan,
    PI,
    PI2,
    oneMinus,
    min,
    smoothstep,
    step,
    pow,
    add,
    mul,
    sub,
    div,
    length,
    remap,
    Fn
  })

  let emissiveColor = $state('#ff8b4d')
  let timeScale = $state(0.2)
  let parabolStrength = $state(1)
  let parabolOffset = $state(0.3)
  let parabolAmplitude = $state(0.2)
</script>

<div>
  <Pane
    title="Tornado VFX Controls"
    position="fixed"
  >
    <Color
      bind:value={emissiveColor}
      label="Emissive Color"
    />
    <Slider
      bind:value={timeScale}
      label="Time Scale"
      max={1}
      min={-1}
      step={0.01}
    />
    <Slider
      bind:value={parabolStrength}
      label="Parabola Strength"
      max={2}
      min={0}
      step={0.01}
    />
    <Slider
      bind:value={parabolOffset}
      label="Parabola Offset"
      max={1}
      min={0}
      step={0.01}
    />
    <Slider
      bind:value={parabolAmplitude}
      label="Parabola Amplitude"
      max={2}
      min={0}
      step={0.01}
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
    <TornadoScene 
      {emissiveColor}
      {timeScale}
      {parabolStrength}
      {parabolOffset}
      {parabolAmplitude}
    />
  </Canvas>
</div>

<style>
  div {
    height: 100%;
    background: #201919;
  }
</style>