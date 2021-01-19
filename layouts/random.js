/**
 * @author Xiaodong Zhao
 * @description random layout class
 */

import { Layout } from './layout'

/**
 * linear interpolation from source positions to target positions
 * @param source source positions
 * @param target target positions
 * @param ratio lerp ratio, (0, 1)
 */
function lerpPosition(source, target, ratio) {
    return Array(source.length)
        .fill(undefined)
        .map((_, i) => {
            const x = source[i].x + (target[i].x - source[i].x) * ratio
            const y = source[i].y + (target[i].y - source[i].y) * ratio
            return { x, y }
        })
}

class RandomLayout extends Layout {
    // private _time: number
    // private sourcePositions: Positions
    // private currentPositions: Positions
    // private targetPositions: Positions

    constructor(netv) {
        super(netv)
    }

    /**
     * set total animation time
     * @param _time 
     */
    time(_time) {
        this._time = _time
    }

    start() {
        this.computePosition()

        let start = undefined

        /**
         * animation step
         * @param timestamp 
         */
        const step = (timestamp) => {
            if (start === undefined) {
                start = timestamp
                this.startCallback && this.startCallback()
            }
            const elapsed = timestamp - start

            this.currentPositions = lerpPosition(
                this.sourcePositions,
                this.targetPositions,
                elapsed / this._time
            )

            this.applyPosition()

            this.tickCallback && this.tickCallback()

            if (elapsed < this._time) {
                requestAnimationFrame(step)
            } else {
                this.stopCallback && this.stopCallback()
            }
        }

        requestAnimationFrame(step)
    }
    stop() { }
    finish() {
        this.computePosition()
        this.currentPositions = this.targetPositions
        this.applyPosition()
    }

    /**
     * for random layout, can directly compute target position
     */
    computePosition() {
        if (this.targetPositions) {
            return
        }
        const nodes = this.netv.nodes()
        this.sourcePositions = nodes.map((n) => ({ x: n.x(), y: n.y() }))
        // random target position
        const width = this.netv.$_configs.width
        const height = this.netv.$_configs.height
        this.targetPositions = Array(this.sourcePositions.length)
            .fill(undefined)
            .map(() => {
                return {
                    x: Math.random() * width,
                    y: Math.random() * height
                }
            })
    }

    /**
     * apply new position to canvas
     */
    applyPosition() {
        const nodes = this.netv.nodes()
        nodes.forEach((n, i) => {
            n.x(this.currentPositions[i].x)
            n.y(this.currentPositions[i].y)
        })
        // this.netv.draw()
    }
}

export { RandomLayout }
