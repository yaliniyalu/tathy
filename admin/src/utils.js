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
