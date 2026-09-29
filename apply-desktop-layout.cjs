// Apply the approved preview CSS only; player scripts remain byte-for-byte intact.
const fs = require('fs');
const builder = fs.readFileSync('build-desktop-preview.cjs', 'utf8');
const finale = fs.readFileSync('desktop-preview-finale.js', 'utf8');
const main = builder.slice(builder.indexOf('@media(min-width:850px)'), builder.indexOf('\n`;'));
const gifts = finale.slice(finale.indexOf('    @media(min-width:850px)'), finale.indexOf('\n  `;'));
const css = (main + '\n' + gifts).replaceAll('body:not(.phone) ', 'body ')
  .replace('min-height:calc(100vh - 100px)', 'min-height:100vh');
let page = fs.readFileSync('index.html', 'utf8');
const scripts = page.match(/<script\b[^>]*>[\s\S]*?<\/script>/g);
page = page.replace(/\n?<style id="desktop-layout">[\s\S]*?<\/style>/, '');
page = page.replace('</head>', '<style id="desktop-layout">\n' + css + '\n</style>\n</head>');
if (JSON.stringify(scripts) !== JSON.stringify(page.match(/<script\b[^>]*>[\s\S]*?<\/script>/g))) throw Error('Player scripts changed');
fs.writeFileSync('index.html', page);
console.log('Applied desktop layout; all player scripts unchanged.');
