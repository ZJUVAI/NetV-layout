const netv = new NetV({
    container: document.getElementById('main'),
    width: 500,
    height: 500
})

const miserables = netv.loadDataset('miserables')

const colorMap = [
    { r: 166, g: 206, b: 227, a: 0.9 },
    { r: 178, g: 223, b: 138, a: 0.9 },
    { r: 31, g: 120, b: 180, a: 0.9 },
    { r: 51, g: 160, b: 44, a: 0.9 },
    { r: 251, g: 154, b: 153, a: 0.9 },
    { r: 227, g: 26, b: 28, a: 0.9 },
    { r: 253, g: 191, b: 111, a: 0.9 },
    { r: 255, g: 127, b: 0, a: 0.9 },
    { r: 202, g: 178, b: 214, a: 0.9 },
    { r: 106, g: 61, b: 154, a: 0.9 },
    { r: 255, g: 255, b: 153, a: 0.9 },
    { r: 177, g: 89, b: 40, a: 0.9 }
]
miserables.nodes.forEach((node) => {
    const { r, g, b, a } = colorMap[node.group]
    node.style = {}
    node.style.fill = { r: r / 255, g: g / 255, b: b / 255, a }
    // NOTE: build-in dataset contains position, random it
    node.x = Math.random() * 500 + 150 // scale and offset to center
    node.y = Math.random() * 500
})

netv.data(miserables)

const radialTree = new RadialTree(netv, {
    rootID: 'Myriel',
})

radialTree.onTick(() => {
    netv.draw()
})

radialTree.start()

netv.on('pan', () => {})
netv.on('zoom', () => {})
