const puppeteer = require('puppeteer');
const Jimp = require("jimp");

const renderSvg = async (svg, sizes, filepath) => {
    const browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 1200 });
    await page.goto('about:blank', {waitUntil: 'networkidle0'});

    await page.evaluate( function(svg, sizes) {
        function appendStyleSheet(url) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.type = 'text/css';
            link.href = url;
            document.head.appendChild(link);
        }

        function setSvg(svg, size) {
            const div = document.createElement('div')
            div.style.width = size
            div.style.width = size
            div.id = "svg_wrapper_" + size
            div.innerHTML = svg
            document.body.appendChild(div)
        }

        appendStyleSheet("https://fonts.googleapis.com/css2?family=Fleur+De+Leah&display=swap")
        appendStyleSheet('https://fonts.googleapis.com/css2?family=Nova+Flat&family=Nova+Flat')
        appendStyleSheet('https://fonts.googleapis.com/css2?family=Asap+Condensed:wght@400;700&family=Barlow+Condensed:wght@400;700&family=Barlow+Semi+Condensed:wght@400;700&family=Fira+Sans+Condensed:wght@400;700&family=Istok+Web:wght@400;700&family=Open+Sans+Condensed:wght@300;700&family=Roboto+Condensed:wght@400;700&family=Saira+Condensed:wght@400;700&family=Stint+Ultra+Condensed&family=Ubuntu+Condensed&display=swap')

        sizes.forEach(v => setSvg(svg, v))
    }, svg, sizes);
    await page.waitForNetworkIdle()

    for (let i = 0; i < sizes.length; i++) {
        const el = await page.$(`#svg_wrapper_${sizes[i]}`);
        await el.screenshot({
            path: filepath + `_${sizes[i]}.jpg`,
            type: 'jpeg',
            quality: 70
        });
    }

    await browser.close()
};

const renderWatermark = async (imageStr, logoStr, outputStr) => {
    const [image, logo] = await Promise.all([
        Jimp.read(imageStr),
        Jimp.read(logoStr)
    ]);

    logo.opacity(0.7)

    const x = 10, y = 10

    const output = await image.composite(logo, x, y, [{
        mode: Jimp.BLEND_SCREEN,
        opacitySource: 0.1,
        opacityDest: 1
    }])
    output.write(outputStr)
};

module.exports = {
    renderSvg,
    renderWatermark
}
