/**
 * linear interpolation from source positions to target positions
 * @param source source positions
 * @param target target positions
 * @param ratio lerp ratio, (0, 1)
 */
export function lerpPosition(source, target, ratio) {
    return Array(source.length)
        .fill(undefined)
        .map((_, i) => {
            const x = source[i].x + (target[i].x - source[i].x) * ratio
            const y = source[i].y + (target[i].y - source[i].y) * ratio
            return { x, y }
        })
}