import {date} from "quasar";

export function getAvatarUrl(user) {
  if (user.image) {
    return process.env.API_URL + "/uploads/users/" + user.image
  }

  return `${generateAvatar(user.name)}`
}

export function getAssetUrl(asset, path) {
  return process.env.API_URL + "/uploads/" + path + "/" + asset
}

function stringToHslColor(str, s, l) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  const h = hash % 360;
  return 'hsl('+h+', '+s+'%, '+l+'%)';
}

function hslToHex(h, s, l) {
  l /= 100;
  const a = s * Math.min(l, 1 - l) / 100;
  const f = n => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');   // convert to Hex and prefix "0" if needed
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

export function generateAvatar(text) {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  canvas.width = 200;
  canvas.height = 200;

  // Draw background
  context.fillStyle = stringToHslColor(text, 30, 80);
  context.fillRect(0, 0, canvas.width, canvas.height);

  text = (text => text.map((n, i)=>(i===0||i===text.length-1)&&n[0]).filter(n=>n).join(""))(text.split(" "));

  // Draw text
  context.font = "bold 100px Assistant";
  context.fillStyle = "#fff";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(text, canvas.width / 2, canvas.height / 2);

  return canvas.toDataURL("image/png");
}

export function textEllipsis(input) {
  if (input.length > 5) {
    return input.substring(0, 5) + '...';
  }
  return input;
}

export function humanDateTime(d) {
  const timeStamp = new Date(d)
  return date.formatDate(timeStamp, 'DD-MM-YYYY h:m a')
}

/**
 * @param {string} url - The source image
 * @param {number} aspectRatio - The aspect ratio
 * @return {Promise<HTMLCanvasElement>} A Promise that resolves with the resulting image as a canvas element
 */
export function crop(url, aspectRatio) {
  return new Promise((resolve) => {
    const inputImage = new Image();
    inputImage.crossOrigin = "anonymous";

    inputImage.onload = () => {
      const inputWidth = inputImage.naturalWidth;
      const inputHeight = inputImage.naturalHeight;

      const inputImageAspectRatio = inputWidth / inputHeight;

      let outputWidth = inputWidth;
      let outputHeight = inputHeight;
      if (inputImageAspectRatio > aspectRatio) {
        outputWidth = inputHeight * aspectRatio;
      } else if (inputImageAspectRatio < aspectRatio) {
        outputHeight = inputWidth / aspectRatio;
      }

      const outputX = (outputWidth - inputWidth) * 0.5;
      const outputY = (outputHeight - inputHeight) * 0.5;

      const outputImage = document.createElement("canvas");

      outputImage.width = outputWidth;
      outputImage.height = outputHeight;

      const ctx = outputImage.getContext("2d");
      ctx.drawImage(inputImage, outputX, outputY);
      resolve(outputImage);
    };

    inputImage.src = url;
  });
}

export function rgbToHex(r, g, b) {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}
