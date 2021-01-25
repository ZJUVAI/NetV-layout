/**
 * @author Xiaodong Zhao <zhaoxiaodong@zju.edu.cn>
 * @description collect all layout releated objects and export
 */

import * as initOGDF from 'ogdf-js'
console.log(initOGDF)

import { RandomLayout } from './layouts/random'
import { D3ForceLayout } from './layouts/d3-force'
import { RadialTree } from './layouts/radial-tree'

export {
    RandomLayout,
    D3ForceLayout,
    RadialTree,
    initOGDF
}
