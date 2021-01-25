/**
 * @author Xiaodong Zhao
 * @description FM3 layout using ogdf.js(https://github.com/Basasuya/ogdf.js)
 */

import { Layout } from './layout'
import * as initOGDF from 'ogdf-js'

class FM3Layout extends Layout {
    constructor(netv) {
        super(netv)
    }
}

export {
    FM3Layout,
    initOGDF
}