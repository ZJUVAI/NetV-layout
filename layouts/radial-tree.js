import * as d3 from 'd3'
import { Layout } from './layout'
import { lerpPosition } from '../utils'

function radialLayout(graph, rootId, configs) {
    const { directed = false, centerX, centerY, radius } = configs
    const trees = graphBFS(graph, rootId, directed)
    const tree = trees[0]
    graph.links = []
    applyRadialTreeGraph(graph, tree, centerX, centerY, radius)
    return graph
}

function radialLayoutMultiple(graph, rootId, configs) {
    const { directed = false, width, height } = configs

    const trees = graphBFS(graph, rootId, directed)
    const treesDegree = trees.map(tree => tree.degree)
    const bubblePositions = computeBubbleLayoutPosition(treesDegree, width, height)

    graph.links = []

    for (let i = 0; i < trees.length; i++) {
        applyRadialTreeGraph(graph, trees[i], bubblePositions[i].x, bubblePositions[i].y, bubblePositions[i].r)
    }
    return graph
}

function applyRadialTreeGraph(graph, tree, centerX, centerY, radius) {
    const links = getTreeLinks(tree)
    graph.links.push(...links)

    const hierachy = d3.hierarchy(tree)
        .sort((a, b) => d3.ascending(a.data.id, b.data.id))

    const d3tree = d3.tree()
        .size([2 * Math.PI, radius])
        .separation((a, b) => (a.parent == b.parent ? 1 : 2) / a.depth)
    d3tree(hierachy)
    // console.log(hierachy)

    const nodeMap = {}
    for (const node of graph.nodes) {
        nodeMap[node.id] = node
    }

    // bfs hierachy
    const queue = [hierachy]

    while (queue.length > 0) {
        const curr = queue.shift()
        const degree = curr.x
        const radius = curr.y
        const x = centerX + radius * Math.cos(degree)
        const y = centerY + radius * Math.sin(degree)
        nodeMap[curr.data.id].x = x
        nodeMap[curr.data.id].y = y

        if (!curr.children) continue

        for (const child of curr.children) {
            queue.push(child)
        }
    }

    return graph
}

function pack(data, width, height, padding, valueFunc) {
    return d3.pack()
        .size([width - padding, height - padding])
        .padding(padding)
        (d3.hierarchy({ children: data })
            .sum(valueFunc))
}

function computeBubbleLayoutPosition(data, width, height) {
    const bubbles = pack(data, width, height, 20, (d) => ((d * 10 + 2) ** 2))
    return bubbles.children.map(x => ({ x: x.x, y: x.y, r: x.r }))
}

function getTreeLinks(tree) {
    const links = []
    const queue = [tree]

    while (queue.length > 0) {
        const curr = queue.shift()
        for (const child of curr.children) {
            links.push({ source: curr.id, target: child.id })
            queue.push(child)
        }
    }

    return links
}

function rootBaseBFS(adjNodes, rootId, visitedSet) {
    visitedSet.add(rootId)

    const queue = []
    const tree = { id: rootId, depth: 0, parent: null, children: [] }
    queue.push(tree)

    let degree = 0
    while (queue.length > 0) {
        const x = queue.shift()
        degree = Math.max(degree, x.depth)
        if (!adjNodes[x.id]) continue
        for (const yId of adjNodes[x.id]) {
            if (visitedSet.has(yId)) continue
            const y = { id: yId, depth: x.depth + 1, parent: x, children: [] }
            x.children.push(y)
            queue.push(y)
            visitedSet.add(yId)
        }
    }

    tree.degree = degree // NOTE: only root node of tree has degree attribute

    return tree
}

function graphBFS(graph, rootId, directed = false) {
    // construct adjacient relation
    const adjNodes = {}
    for (const { source, target } of graph.links) {
        if (!(source in adjNodes)) {
            adjNodes[source] = new Set()
        }
        adjNodes[source].add(target)

        // consider undirected graph
        if (!directed) {
            if (!(target in adjNodes)) {
                adjNodes[target] = new Set()
            }
            adjNodes[target].add(source)

        }
    }

    const trees = []
    const visitedSet = new Set()
    trees.push(rootBaseBFS(adjNodes, rootId, visitedSet))

    for (const node of graph.nodes) {
        if (!visitedSet.has(node.id)) {
            trees.push(rootBaseBFS(adjNodes, node.id, visitedSet))
        }
    }

    return trees
}

// NOTE: not used, compute depth during BFS
function computeTreeDepth(tree) {
    let depth = 0
    let p = tree
    let q = [p]
    while (q.length > 0) {
        let qq = []
        for (const x of q) {
            if (x.children) {
                for (const y of x.children) {
                    qq.push(y)
                }
            }
        }
        if (qq.length > 0) depth += 1
        q = qq
    }

    return depth
}

export class RadialTree extends Layout {
    constructor(netv, parameters) {
        super(netv)
        this.parameters = parameters
        this._time = 1000 // TODO: all parameters, refactor
    }

    start() {
        const graph = this.netv.data()

        const {
            rootID,
            directed = false,
        } = this.parameters

        this.sourcePositions = graph.nodes.map((n) => ({ x: n.x, y: n.y }))

        const newGraph = radialLayoutMultiple(graph, this.parameters.rootID, {
            directed,
            width: this.netv.$_configs.width,
            height: this.netv.$_configs.height
        })

        this.targetPositions = newGraph.nodes.map((n) => ({ x: n.x, y: n.y }))

        // netv.draw()

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
    }
}
