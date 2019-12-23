const { JSDOM } = require('jsdom')

const pluginName = 'VConsoleWebpackPlugin'
const safeTypeReg = /\.html$/

const injectVConsole = (htmlText) => {
    const { document } = new JSDOM(htmlText).window
    const vConsoleScriptNode = document.createElement('script')
    vConsoleScriptNode.src = 'http://wechatfe.github.io/vconsole/lib/vconsole.min.js?v=3.2.0'
    vConsoleScriptNode.innerHTML = 'window.vConsole = new window.VConsole();'
    document.querySelector('body').appendChild(vConsoleScriptNode)
    return document.documentElement.innerHTML
}

class VConsoleWebpackPlugin {
    constructor(props) {
        this.props = props
    }

    apply(compiler) {
        compiler.hooks.emit.tapAsync(pluginName, (compilation, callback) => {
            const { enabled, exclude } = this.props
            if (!enabled) return
            const { assets } = compilation
            Object.entries(assets).forEach(([filename, file]) => {
                if (exclude.test(filename)) return
                if (!safeTypeReg.test(filename)) return
                const currentHTML = injectVConsole(file.source())
                compilation.assets[filename] = {
                    source() {
                        return currentHTML
                    },
                    size() {
                        return currentHTML.length
                    }
                }
            })

            callback && callback()
        });
    }
}

module.exports = VConsoleWebpackPlugin;