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

if(typeof String.prototype.replaceAll == "undefined") {
    String.prototype.replaceAll = function(match, replace){
        return this.replace(new RegExp(match, 'g'), () => replace);
    }
}
