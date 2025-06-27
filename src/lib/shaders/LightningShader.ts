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
  pow, 
  abs, 
  max, 
  min, 
  step, 
  smoothstep, 
  mix, 
  length, 
  normalize,
  dot,
  fract,
  floor,
  mul,
  add,
  sub,
  div,
  clamp,
  exp
} from 'three/tsl'
import type { NodeRepresentation } from 'three/tsl'

// Función de ruido mejorada para nubes
const noise = Fn(([p]: [NodeRepresentation]) => {
  const i = floor(p)
  const f = fract(p)
  
  const a = fract(sin(dot(i, vec2(1, 57))).mul(43758.5453))
  const b = fract(sin(dot(i.add(vec2(1, 0)), vec2(1, 57))).mul(43758.5453))
  const c = fract(sin(dot(i.add(vec2(0, 1)), vec2(1, 57))).mul(43758.5453))
  const d = fract(sin(dot(i.add(vec2(1, 1)), vec2(1, 57))).mul(43758.5453))
  
  const u = f.mul(f).mul(f.mul(-2).add(3))
  
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y)
})

// Ruido fractal para nubes más complejas
const fbm = Fn(([p, octaves]: [NodeRepresentation, NodeRepresentation]) => {
  let value = float(0)
  let amplitude = float(0.5)
  let frequency = float(1)
  
  for (let i = 0; i < 6; i++) {
    value = value.add(amplitude.mul(noise(p.mul(frequency))))
    amplitude = amplitude.mul(0.5)
    frequency = frequency.mul(2)
  }
  
  return value
})

// Función para generar rayos realistas
const lightningBolt = Fn(([uv, time, seed]: [NodeRepresentation, NodeRepresentation, NodeRepresentation]) => {
  // Crear el rayo principal con zigzag
  const mainPath = uv.x.add(sin(uv.y.mul(20).add(time.mul(2))).mul(0.1))
  const boltDistance = abs(mainPath.sub(seed))
  
  // Rayo principal grueso
  const mainBolt = smoothstep(0.02, 0.0, boltDistance)
  
  // Ramificaciones del rayo
  const branch1 = smoothstep(0.01, 0.0, abs(mainPath.add(0.3).sub(seed)).add(abs(uv.y.sub(0.3))))
  const branch2 = smoothstep(0.008, 0.0, abs(mainPath.sub(0.2).sub(seed)).add(abs(uv.y.sub(0.7))))
  
  // Combinar rayo principal y ramificaciones
  const lightning = max(mainBolt, max(branch1.mul(0.6), branch2.mul(0.4)))
  
  // Añadir brillo alrededor del rayo
  const glow = smoothstep(0.1, 0.0, boltDistance).mul(0.3)
  
  return lightning.add(glow)
})

// Función para generar nubes tormentosas
const stormClouds = Fn(([uv, time]: [NodeRepresentation, NodeRepresentation]) => {
  // Múltiples capas de nubes con diferentes escalas
  const clouds1 = fbm(uv.mul(3).add(vec2(time.mul(0.1), 0)), 4)
  const clouds2 = fbm(uv.mul(5).add(vec2(time.mul(-0.05), time.mul(0.02))), 3)
  const clouds3 = fbm(uv.mul(8).add(vec2(time.mul(0.03), time.mul(-0.01))), 2)
  
  // Combinar las capas de nubes
  const combinedClouds = clouds1.mul(0.6).add(clouds2.mul(0.3)).add(clouds3.mul(0.1))
  
  // Hacer las nubes más dramáticas y oscuras
  const cloudDensity = smoothstep(0.3, 0.8, combinedClouds)
  
  return cloudDensity
})

// Función para el efecto de flash de relámpago
const lightningFlash = Fn(([time, frequency]: [NodeRepresentation, NodeRepresentation]) => {
  const t = time.mul(frequency)
  const flashTime = fract(t)
  
  // Flash más dramático y realista
  const flash1 = exp(flashTime.mul(-8)).mul(step(0.95, noise(floor(t))))
  const flash2 = exp(flashTime.mul(-12)).mul(step(0.98, noise(floor(t).add(1))))
  
  return max(flash1, flash2)
})

// Shader principal del cielo con rayos realistas
export const skyLightningShader = Fn(([
  uv, 
  time, 
  lightningIntensity, 
  flashFrequency,
  skyColor,
  lightningColor
]: [
  NodeRepresentation, 
  NodeRepresentation, 
  NodeRepresentation, 
  NodeRepresentation,
  NodeRepresentation,
  NodeRepresentation
]) => {
  // Coordenadas UV ajustadas
  const coord = uv.sub(0.5).mul(2)
  
  // Color base del cielo - más oscuro y tormentoso
  const baseColor = vec3(0.1, 0.15, 0.3)
  const horizonColor = vec3(0.2, 0.25, 0.4)
  const skyGradient = mix(baseColor, horizonColor, smoothstep(-1, 0.5, coord.y))
  
  // Generar nubes tormentosas
  const clouds = stormClouds(coord, time)
  const cloudColor = vec3(0.05, 0.08, 0.15)
  const skyWithClouds = mix(skyGradient, cloudColor, clouds)
  
  // Generar múltiples rayos en diferentes posiciones
  const lightning1 = lightningBolt(coord, time, -0.3)
  const lightning2 = lightningBolt(coord.add(vec2(0.6, 0)), time.mul(1.2), 0.2)
  const lightning3 = lightningBolt(coord.add(vec2(-0.4, 0.3)), time.mul(0.8), 0.1)
  
  // Combinar todos los rayos
  const allLightning = max(max(lightning1, lightning2), lightning3)
  
  // Efecto de flash global
  const flash = lightningFlash(time, flashFrequency)
  
  // Intensidad final de los rayos
  const finalLightning = allLightning.mul(lightningIntensity).mul(flash.add(0.1))
  
  // Color final del rayo - más brillante y realista
  const boltColor = vec3(0.9, 0.95, 1.0).mul(3)
  
  // Mezclar cielo, nubes y rayos
  let finalColor = mix(skyWithClouds, boltColor, finalLightning)
  
  // Añadir iluminación ambiental durante los flashes
  const ambientFlash = flash.mul(0.4)
  finalColor = finalColor.add(vec3(0.3, 0.4, 0.6).mul(ambientFlash))
  
  return vec4(finalColor, 1.0)
})

// Shader simplificado para materiales estándar
export const lightningEmissive = Fn(([time, intensity]: [NodeRepresentation, NodeRepresentation]) => {
  const flash = lightningFlash(time, 2.0)
  const coord = uv().sub(0.5).mul(4)
  const lightning = lightningBolt(coord, time, 0.0)
  
  const emissive = lightning.mul(intensity).mul(flash.add(0.05))
  
  return vec3(emissive.mul(0.8), emissive.mul(0.9), emissive)
})