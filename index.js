const { JSDOM } = require('jsdom')

const pluginName = 'VConsoleWebpackPlugin'
const safeTypeReg = /\.html$/

const injectVConsole = (htmlText, version) => {
    const { document } = new JSDOM(htmlText).window
    const vScript1 = document.createElement('script')
    vScript1.src = `http://wechatfe.github.io/vconsole/lib/vconsole.min.js?v=${version}`
    const vScript2 = document.createElement('script')
    vScript2.innerHTML = 'window.vConsole = new window.VConsole();'
    document.querySelector('body').appendChild(vScript1)
    document.querySelector('body').appendChild(vScript2)
    return document.documentElement.innerHTML
}

class VConsoleWebpackPlugin {
    constructor(props) {
        this.props = props
    }

    apply(compiler) {
        compiler.hooks.emit.tapAsync(pluginName, (compilation, callback) => {
            const { enabled, exclude, version = '3.2.0' } = this.props
            if (!enabled) return
            const { assets } = compilation
            Object.entries(assets).forEach(([filename, file]) => {
                if (exclude && exclude.test(filename)) return
                if (!safeTypeReg.test(filename)) return
                const currentHTML = injectVConsole(file.source(), version)
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