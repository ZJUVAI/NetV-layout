const path = require('path');

module.exports = {
    entry: './index.js',
    devtool: 'inline-source-map',
    mode: 'development',
    output: {
        filename: 'netv-layout.js',
        path: path.resolve(__dirname, 'dist'),
        libraryTarget: 'umd',
    },
};