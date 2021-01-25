/**
 * @author Xiaodong Zhao
 * @description FM3 layout using ogdf.js(https://github.com/Basasuya/ogdf.js)
 */

import { Layout } from './layout'
import { lerpPosition } from '../utils'

class FM3Layout extends Layout {
    // private _time: number
    // private sourcePositions: Positions
    // private currentPositions: Positions
    // private targetPositions: Positions

    constructor(netv) {
        super(netv)
        this._time = 1000 // TODO: all parameters, refactor
    }

    /**
     * set total animation time
     * @param _time 
     */
    time(_time) {
        this._time = _time
    }

    start() {
        const graph = netv.data()
        this.sourcePositions = graph.nodes.map((n) => ({ x: n.x, y: n.y }))

        initOGDF()
            .then(function (Module) {
                const dic = {}
                for (let i = 0; i < graph.nodes.length; ++i) {
                    if (graph.nodes[i]['id'] in dic) {
                        console.log('there is a bug');
                    } else dic[graph.nodes[i]['id']] = i;
                }
                let nodes = graph.nodes.length
                let links = graph.links.length
                let source = Module._malloc(4 * links);
                let target = Module._malloc(4 * links);
                for (let i = 0; i < links; ++i) {
                    Module.HEAP32[source / 4 + i] = dic[graph.links[i].source]; Module.HEAP32[target / 4 + i] = dic[graph.links[i].target];
                }
                console.log(nodes, links)
                console.time("sort");
                let result = Module._FM3(nodes, links, source, target);
                console.timeEnd("sort");
                console.log('complete layout')
                for (let i = 0; i < nodes; ++i) {
                    graph.nodes[i]['x'] = Module.HEAPF32[(result >> 2) + i * 2]
                    graph.nodes[i]['y'] = Module.HEAPF32[(result >> 2) + i * 2 + 1];
                }
                // for (let i = 0; i < links; ++i) {
                // graph.links[i]['source'] = graph.nodes[dic[graph.links[i]['source']]];
                // graph.links[i]['target'] = graph.nodes[dic[graph.links[i]['target']]];
                // }
                return graph
            })
            .then((graph) => {
                this.targetPositions = graph.nodes.map((n) => ({ x: n.x, y: n.y }))
                console.log(graph)


                let start = undefined

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

                    const nodes = this.netv.nodes()
                    nodes.forEach((n, i) => {
                        n.x(this.currentPositions[i].x)
                        n.y(this.currentPositions[i].y)
                    })

                    this.tickCallback && this.tickCallback()

                    if (elapsed < this._time) {
                        requestAnimationFrame(step)
                    } else {
                        this.stopCallback && this.stopCallback()
                    }
                }

                requestAnimationFrame(step)

                // netv.data(graph)
                // netv.draw()
            })
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

export { FM3Layout }
