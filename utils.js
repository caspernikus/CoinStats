var fs = require('fs');

var clearImgFolder = function() {
    var path = './img';
    if (fs.existsSync(path)) {
        fs.readdirSync(path).forEach(function(file, index){
          var filePath = path + "/" + file;

          fs.unlinkSync(filePath);
        });
    }
}

var writeToStateJSON = function() {
    const todayDate = new Date()
    const day = todayDate.getDate()
    const month = todayDate.getMonth() + 1
    const year = todayDate.getFullYear()

    var state = {
      last_time_posted: day + "/" + month + "/" + year
    };

    fs.writeFile('state.json', JSON.stringify(state), function (err) {
      if (err) {
          console.log(err);
      }
    });
}

module.exports = {
  clearImgFolder: clearImgFolder,
  writeToStateJSON: writeToStateJSON,
}
