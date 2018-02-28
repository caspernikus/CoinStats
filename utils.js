var fs = require('fs');

var clearImgFolder = function () {
    var path = './img';
    if (fs.existsSync(path)) {
        fs.readdirSync(path).forEach(function(file, index){
          var filePath = path + "/" + file;

          fs.unlinkSync(filePath);
        });
    }
}

module.exports = {
  clearImgFolder: clearImgFolder,
}
