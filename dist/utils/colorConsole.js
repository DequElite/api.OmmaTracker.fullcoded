"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = colorize;
function colorize(text, color = 'white', bgColor = 'black', style = 'bold') {
    const colorCodes = {
        black: '30', red: '31', green: '32', yellow: '33', blue: '34',
        magenta: '35', cyan: '36', white: '37', gray: '90'
    };
    const bgColorCodes = {
        black: '40', red: '41', green: '42', yellow: '43', blue: '44',
        magenta: '45', cyan: '46', white: '47'
    };
    const styleCodes = {
        bold: '1', italic: '3', underline: '4', strikethrough: '9'
    };
    const styleCode = styleCodes[style];
    const colorCode = colorCodes[color];
    const bgColorCode = bgColorCodes[bgColor];
    const codes = [];
    if (styleCode)
        codes.push(styleCode);
    if (colorCode)
        codes.push(colorCode);
    if (bgColorCode)
        codes.push(bgColorCode);
    return `\x1b[${codes.join(';')}m${text}\x1b[0m`;
}
