/**
 * Categorical series styling for the group lines.
 * Palette validated with the dataviz skill's validator (light surface #FFFFFF):
 * adjacent CVD ΔE ≥ 9.2, normal-vision ΔE ≥ 18, all inside the lightness band.
 * Hues are assigned in fixed order and never cycled; groups 9–10 reuse slots 1–2
 * with a dashed stroke so identity never rests on color alone.
 */
export const SERIES_COLORS = [
  '#9D2235', // Temple cherry
  '#2a78d6', // blue
  '#EB6834', // orange
  '#1BAF7A', // aqua
  '#C98500', // gold (darkened for contrast)
  '#E87BA4', // magenta
  '#008300', // green
  '#4A3AA7', // violet
] as const

export type MarkerShape = 'circle' | 'square' | 'triangle' | 'diamond' | 'cross' | 'star' | 'hexagon' | 'wye'
export const SERIES_SHAPES: MarkerShape[] = ['circle', 'square', 'triangle', 'diamond', 'cross', 'star', 'hexagon', 'wye']

export function seriesStyle(index: number) {
  const slot = index % SERIES_COLORS.length
  return {
    color: SERIES_COLORS[slot],
    shape: SERIES_SHAPES[slot],
    dashed: index >= SERIES_COLORS.length,
  }
}

/** SVG path for a marker centered at (0,0) with radius r. */
export function markerPath(shape: MarkerShape, r: number): string {
  switch (shape) {
    case 'circle':
      return `M ${-r} 0 a ${r} ${r} 0 1 0 ${2 * r} 0 a ${r} ${r} 0 1 0 ${-2 * r} 0`
    case 'square':
      return `M ${-r} ${-r} h ${2 * r} v ${2 * r} h ${-2 * r} z`
    case 'triangle':
      return `M 0 ${-r * 1.15} L ${r * 1.1} ${r * 0.85} L ${-r * 1.1} ${r * 0.85} z`
    case 'diamond':
      return `M 0 ${-r * 1.3} L ${r * 1.3} 0 L 0 ${r * 1.3} L ${-r * 1.3} 0 z`
    case 'cross': {
      const t = r * 0.42
      return `M ${-t} ${-r} h ${2 * t} v ${r - t} h ${r - t} v ${2 * t} h ${-(r - t)} v ${r - t} h ${-2 * t} v ${-(r - t)} h ${-(r - t)} v ${-2 * t} h ${r - t} z`
    }
    case 'star': {
      const pts: string[] = []
      for (let i = 0; i < 10; i++) {
        const rad = i % 2 === 0 ? r * 1.25 : r * 0.55
        const ang = -Math.PI / 2 + (i * Math.PI) / 5
        pts.push(`${(Math.cos(ang) * rad).toFixed(2)} ${(Math.sin(ang) * rad).toFixed(2)}`)
      }
      return `M ${pts.join(' L ')} z`
    }
    case 'hexagon': {
      const pts: string[] = []
      for (let i = 0; i < 6; i++) {
        const ang = (i * Math.PI) / 3
        pts.push(`${(Math.cos(ang) * r * 1.1).toFixed(2)} ${(Math.sin(ang) * r * 1.1).toFixed(2)}`)
      }
      return `M ${pts.join(' L ')} z`
    }
    case 'wye': {
      // Three-armed Y, drawn as a thick stroke outline.
      const t = r * 0.38
      const L = r * 1.2
      const arm = (ang: number) => {
        const c = Math.cos(ang), s = Math.sin(ang)
        const nx = -s * t, ny = c * t
        return `M ${nx} ${ny} L ${c * L + nx} ${s * L + ny} L ${c * L - nx} ${s * L - ny} L ${-nx} ${-ny} z`
      }
      return [arm(-Math.PI / 2), arm(Math.PI / 6), arm((5 * Math.PI) / 6)].join(' ')
    }
  }
}
