const fs = require("fs");

const dirs = [
    'items/cropped',
    'items/rendered/shared',
    'packs',
    'temp',
    'users'
]

dirs.forEach(dir => {
    fs.mkdirSync(process.env.UPLOAD_DIR + '/' + dir, { recursive: true });
})
