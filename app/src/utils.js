
export function getAssetsUrl(name, type) {
  return process.env.API_URL + "/uploads/" + type + "/" + name
}

export function getOptimizeImageSize() {
  const sizes = [200, 320, 480, 720, 960, 1280]
  const screenWidth = window.screen.width;

  return sizes.reduce((prev, curr) => Math.abs(curr - screenWidth) < Math.abs(prev - screenWidth) ? curr : prev);
}
