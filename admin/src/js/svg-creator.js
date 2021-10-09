import {SVG} from "@svgdotjs/svg.js";
import wrapSvgText from "wrap-svg-text/dist"

let w = 602;
let h = 602;

const minFontSize = 16;
const maxFontSize = 46;

const bgColor = "#010101";


const typeTextFontSize = 28;
const typeTextPadding = 10;
const typeTextBorderWidth = 5

class SvgCreator {
  constructor(parent) {
/*    w = parent.clientWidth
    h = parent.clientWidth*/

    this.draw = SVG().addTo(parent)
      // .size(w, h)
      .attr({viewBox: `0 0 ${w} ${h}`})

    this.themeColor = "#fe0"
    this.fontFamily = ""
    this.fontSize = 0

    this.hasSeparator = true
    this.typeText = null
    this.text = null

    this.image = null
    this.imageHeight = 60
    this.h2 = ((60 * h) / 100)

    this.textNode = null
  }

  getSvgSize() {
    return { w, h }
  }

  setThemeColor(color) {
    this.themeColor = color
    this.render()
  }

  setFontFamily(font) {
    this.fontFamily = font
    this.resizeText()
    this.render()
  }

/*  setFontSize(size) {
    this.fontSize = size
    this.calculateTextNode(size)
    this.render()
  }*/

  setHasSeparator(has) {
    this.hasSeparator = has
    this.render()
  }

  setTypeText(text) {
    this.typeText = text
    this.render()
  }

  setText(text) {
    this.text = text
    this.resizeText()
    this.render()
  }

  setImage(image) {
    this.image = image
    this.render()
  }

  setImageHeight(height) {
    this.imageHeight = height
    this.h2 = (height * h) / 100;
    this.resizeText()
    this.render()
  }

  refresh() {
    this.resizeText()
    this.render()
  }

  getImageSize() {
    return { width: w - 20, height: this.h2 - 10 }
  }

  getRenderedSvg() {
    return this.draw.node.outerHTML
  }

  render() {
    this.draw.clear()

    this.renderBackground()
    this.renderBorder()

    if (this.image) {
      this.renderImage()
    }

    if (this.hasSeparator) {
      this.renderSeparator()
    }

    if (this.typeText) {
      this.renderTypeText()
    }

    if (this.text && this.textNode) {
      this.renderText();
    }
  }

  renderBackground() {
    this.draw.rect(w, h).fill(bgColor);
  }

  renderBorder() {
    this.draw
      .path(`M 0,0 h ${w} v ${h} h ${-h} z M 10,10 v ${w - 20} h ${h - 20} v ${-(h - 20)}z`)
      .fill(this.themeColor);
  }

  renderImage() {
    this.draw
      .image(this.image, function () {})
      .move(10, 10)
      .size(w - 20, this.h2 - 10)
      .attr({preserveAspectRatio: "xMidYMid slice"});
  }

  renderSeparator() {
    this.draw.line(0, this.h2, w, this.h2).stroke({ width: 5, color: this.themeColor });
  }

  renderTypeText() {
    const rect1 = this.draw.rect();
    const rect2 = this.draw.rect();

    const text = this.draw
      .text(this.typeText)
      .font({
        family: "Istok Web",
        size: typeTextFontSize,
        weight: "bold",
        anchor: "middle"
      })
      .fill(this.themeColor);

    let width = text.length() + typeTextPadding * 2;
    let height = typeTextFontSize + typeTextPadding * 2;
    let center = w / 2;

    rect1
      .size(width, height)
      .move(center - width / 2, this.h2 - height / 2)
      .fill(this.themeColor)
      .radius(5);

    rect2
      .size(width - 10, height - 10)
      .move(center - (width / 2) + 5, this.h2 - (height / 2) + 5)
      .fill(bgColor);

    text.move(center - (width / 2) + 5 + (typeTextPadding / 2), this.h2 - (height / 2) + 5);
  }

  renderText() {
    const x = 30
    const y = this.h2 + 28
/*    const rect = this.draw.rect()
      .size(w - (x * 2), h - (this.h2 + 28 + 30)) // top padding + bottom padding
      .move(x, y)
      .stroke("#f0e")*/
    this.draw.svg(this.textNode.outerHTML)
  }

  resizeText() {
    const [fontSize, padding] = this.getAdjustedFontSize(h - (this.h2 + 28 + 30));
    this.fontSize = fontSize
    this.calculateTextNode(this.fontSize, padding)
  }

  calculateTextNode(fontSize, padding) {
    const c = this.getTextNode(fontSize)
    c.setAttribute("transform", `translate(${30}, ${this.h2 + 28 + (padding / 2) + 5})`); // 5 = adjustment
    this.textNode = c
  }

  getAdjustedFontSize(boxHeight) {
    let prevResult = null
    let defaultPadding = 0;
    for (let i = minFontSize; i <= maxFontSize; i++) {

      const c = this.getTextNode(i)

      c.setAttribute("id", "svg-text");
      c.setAttribute("hidden", "true");
      this.draw.svg(c.outerHTML);

      const el = this.draw.find("#svg-text");
      const currentHeight = el.height()[0]
      el.remove();

      if (currentHeight > boxHeight) {
        if (i === minFontSize) {
          return [i, defaultPadding];
        } else {
          return prevResult;
        }
      }

      prevResult = [i, Math.max(boxHeight - currentHeight, defaultPadding)]
    }

    return prevResult ?? [maxFontSize, defaultPadding];
  }

  getTextNode(fontSize) {
    const c = wrapSvgText({
      text: this.text,
      style: {
        fontSize: `${fontSize}px`,
        fontWeight: 400,
        // fontWeight: "bold",
        fontFamily: this.fontFamily,
        width: `${w - 60}px`,
        textAlign: "center"
      }
    });

    c.childNodes.forEach((el) => {
      el.setAttribute("font-size", fontSize);
      el.setAttribute("font-family", this.fontFamily);
      // el.setAttribute("font-weight", "bold");
      el.setAttribute("font-weight", 400);
      el.setAttribute("fill", "#fff");
    });
    c.setAttribute("transform", `translate(${30}, ${this.h2 + 30})`);

    return c;
  }
}


export default SvgCreator









/*
async function offscreenRender(svg) {
  const c = Document.createCanvas(w, h);
  const ctx = c.getContext("2d");
  const v = await Canvg.fromString(ctx, svg, presets.offscreen());

  await v.render();

  const download = function () {
    const link = document.createElement("a");
    link.download = "filename.png";
    link.href = c.toDataURL();
    link.click();
  };

  // download();
}
*/


