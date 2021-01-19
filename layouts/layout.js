/**
 * @author Xiaodong Zhao
 * @description Base class of layout
 */

class Layout {
    constructor(netv) {
        this.netv = netv
        this.startCallback = () => { }
        this.tickCallback = () => { }
        this.stopCallback = () => { }
    }

    start() { }

    stop() { }

    /**
     * call finish to direct get layout result, without transition animation
     */
    finish() { }

    onStart(cb) {
        this.startCallback = cb
    }
    onTick(cb) {
        this.tickCallback = cb
    }
    onStop(cb) {
        this.stopCallback = cb
    }
}

export { Layout }
