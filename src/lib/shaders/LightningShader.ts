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
  div
} from 'three/tsl'
import type { NodeRepresentation } from 'three/tsl'

// Función de ruido simplificada
const noise = Fn(([p]: [NodeRepresentation]) => {
  const i = floor(p)
  const f = fract(p)
  
  const a = sin(dot(i, vec2(1, 57))).mul(43758.5453)
  const b = sin(dot(i.add(vec2(1, 0)), vec2(1, 57))).mul(43758.5453)
  const c = sin(dot(i.add(vec2(0, 1)), vec2(1, 57))).mul(43758.5453)
  const d = sin(dot(i.add(vec2(1, 1)), vec2(1, 57))).mul(43758.5453)
  
  const u = f.mul(f).mul(f.mul(-2).add(3))
  
  return mix(mix(fract(a), fract(b), u.x), mix(fract(c), fract(d), u.x), u.y)
})

// Función para generar rayos fractales
const lightning = Fn(([uv, time, seed]: [NodeRepresentation, NodeRepresentation, NodeRepresentation]) => {
  let intensity = float(0)
  let p = uv.mul(8).add(vec2(seed, 0))
  
  // Múltiples octavas para crear patrones de rayos complejos
  for (let i = 0; i < 4; i++) {
    const n = noise(p.add(time.mul(0.5)))
    const branch = abs(n.sub(0.5)).mul(2)
    intensity = intensity.add(pow(max(float(0), float(1).sub(branch.mul(4))), 2).div(pow(2, i)))
    p = p.mul(2)
  }
  
  return intensity
})

// Función para crear relámpagos intermitentes
const flash = Fn(([time, frequency]: [NodeRepresentation, NodeRepresentation]) => {
  const t = time.mul(frequency)
  const flashTime = fract(t)
  const flashIntensity = smoothstep(0.0, 0.1, flashTime).mul(smoothstep(0.3, 0.2, flashTime))
  
  // Añadir variación aleatoria
  const randomFlash = step(0.7, noise(floor(t)))
  
  return flashIntensity.mul(randomFlash)
})

// Función principal del shader de cielo con rayos
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
  // Coordenadas UV centradas
  const centeredUV = uv.sub(0.5).mul(2)
  
  // Color base del cielo con gradiente
  const skyGradient = mix(
    skyColor,
    skyColor.mul(0.3),
    smoothstep(-1, 1, centeredUV.y)
  )
  
  // Generar múltiples rayos en diferentes posiciones
  const lightning1 = lightning(centeredUV.add(vec2(-0.3, 0)), time, 1.0)
  const lightning2 = lightning(centeredUV.add(vec2(0.3, 0)), time.mul(1.3), 2.0)
  const lightning3 = lightning(centeredUV.add(vec2(0, -0.2)), time.mul(0.8), 3.0)
  
  // Combinar rayos
  const combinedLightning = max(max(lightning1, lightning2), lightning3)
  
  // Efecto de relámpago intermitente
  const flashEffect = flash(time, flashFrequency)
  
  // Intensidad final de los rayos
  const finalLightningIntensity = combinedLightning.mul(lightningIntensity).mul(flashEffect.add(0.3))
  
  // Color final mezclando cielo y rayos
  const finalColor = mix(
    skyGradient,
    lightningColor,
    finalLightningIntensity
  )
  
  // Añadir brillo adicional durante los flashes
  const glowEffect = flashEffect.mul(0.2)
  
  return vec4(finalColor.add(glowEffect), 1.0)
})

// Shader simplificado para materiales estándar
export const lightningEmissive = Fn(([time, intensity]: [NodeRepresentation, NodeRepresentation]) => {
  const flashEffect = flash(time, 2.0)
  const lightningPattern = lightning(uv().sub(0.5).mul(4), time, 1.0)
  
  const emissive = lightningPattern.mul(intensity).mul(flashEffect.add(0.1))
  
  return vec3(emissive.mul(0.8), emissive.mul(0.9), emissive)
})