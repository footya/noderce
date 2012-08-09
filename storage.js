/**
 * User: willerce
 * Date: 7/22/12
 * Time: 3:57 PM
 */

var fs = require("fs");

exports.getPostBySlug = function (slug, callBack) {
  if (slug != undefined && slug !== '') {//not null or empty
    fs.readFile('./storage/post/' + slug + '.json', "utf8", callBack);
  }
};

exports.getPageBySlug = function (slug, callBack) {
  if (slug != undefined && slug !== '') {//not null or empty
    fs.readFile('./storage/page/' + slug + '.json', "utf8", callBack);
  }
};

exports.getTimeline = function (callBack) {
  fs.readFile('./storage/timeline.json', "utf8", callBack);
};

exports.addPost = function (post) {
  fs.writeFileSync('./storage/post/' + post.slug + '.json', data);
  this.getTimeline(function (err, file) {
    var timeline = JSON.parse(file);
    timeline.unshift({slug:post.slug, title:post.title});
    fs.writeFileSync('./storage/timeline.json', JSON.stringify(timeline));
  });
};

exports.updatePost = function (old_slug, post) {
  try {
    if (old_slug != post.slug) {
      fs.renameSync('./storage/post/' + old_slug + '.json', './storage/recycle-bin/' + old_slug + '.json');
    }

    //write post file of json format
    fs.writeFileSync('./storage/post/' + post.slug + '.json', JSON.stringify(post));

    //update timeline.json

    this.getTimeline(function (err, file) {
      var timeline = JSON.parse(file);
      for (var i = 0; i < timeline.length; i++) {
        if (timeline[i].slug == old_slug) {
          timeline[i]['title'] = post.title;
          timeline[i]['slug'] = post.slug;
          fs.writeFileSync('./storage/timeline.json', JSON.stringify(timeline));
        }
      }
    });
  } catch (error) {
    console.log(error);
  }
};


exports.getUserByName = function (name, callBack) {
  fs.readFile('./storage/user.json', "utf8", function(err,file){
    userList = JSON.parse(file);

    for(var i = 0; i < userList.length; i++){
     if(userList[i]['name'] == name){
       callBack(userList[i])
     }
    }
  });
}
