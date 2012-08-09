/**
 * User: willerce
 * Date: 7/30/12
 * Time: 12:24 AM
 */

var storage = require('../storage.js');
var config = require('../config.js').config;
var data2xml = require('data2xml');
var markdown = require('markdown-js');


/* index */
exports.index = function(req,res,next){
  storage.getTimeline(function(error, file){

    var timeline = JSON.parse(file);
    var maxP = parseInt(timeline.length / config.postNum) + (timeline.length % config.postNum ? 1 : 0);
    var crtP = 1;
    var nextP = crtP;
    //页数
    var start = ( crtP -1) * config.postNum;

    if(maxP < crtP)
      return ;
    else if(maxP > crtP)
      nextP = parseInt(crtP) + 1;

    if(timeline.length - start > config.postNum)
      var postNum = config.postNum;
    else
      postNum = timeline.length - start;

    var posts = new Array();

    for(var i = 0; i < timeline.length; i++ ){
      storage.getPostBySlug(timeline[i]["slug"], function (error, file){
        if (error) {
          throw error;
        } else {
          var post = JSON.parse(file);
          post.content = markdown.makeHtml(post.content);
          posts.push(post);

          if(posts.length == postNum)
            res.render('index', {title : config.name, posts : posts, crtP : crtP, maxP : maxP, nextP: nextP});
        }
      });
    }
  });
};

/* index page */
exports.page = function(req,res) {
  storage.getTimeline(function(error, file){
    var timeline = JSON.parse(file);
    var maxP = parseInt(timeline.length / config.postNum) + (timeline.length % config.postNum ? 1 : 0);
    var crtP  = req.params.id;
    var nextP = crtP;
    //页数
    var start = ( crtP -1) * config.postNum;

    if(maxP < crtP)
      return ;
    else if(maxP > crtP)
      nextP = parseInt(crtP) + 1;

    if(timeline.length - start > config.postNum)
      var postNum = config.postNum;
    else
      postNum = timeline.length - start;

    var posts = new Array();

    for(var i = start; i < timeline.length; i++ ){
      storage.getPostBySlug(timeline[i]["slug"], function (error, file){
        if (error) {
          throw error;
        } else {
          var post = JSON.parse(file);
          post.content = markdown.makeHtml(post.content);
          posts.push(post);

          if(posts.length == postNum)
            res.render('index', {title : config.name + " › 第 "+ crtP +" 页", posts : posts, crtP : crtP, maxP : maxP, nextP: nextP});
        }
      });
    }
  });
};

exports.post = function(req, res){
  storage.getPostBySlug(req.params.slug, function(error, file){
    if (error) {
      throw error;
    } else {
      var post = JSON.parse(file);
      post.content = markdown.makeHtml(post.content);
      post.page_title = config.name + " › " + post.title;
      res.render('post', post);
    }
  });
};

exports.feed = function(req, res){
  if (!config.rss) {
    res.statusCode = 404;
    return res.send('Please set `rss` in config.js');
  }

  storage.getTimeline(function(error, file){
    if (error) {
      return next(err);
    }
    var rss_obj = {
      _attr: { version: '2.0' },
      channel: {
        title: config.rss.title,
        description: config.rss.description,
        link: config.rss.link,
        language: config.rss.language,
        managingEditor: config.rss.language,
        webMaster: config.rss.language,
        item: []
      }
    };
    var timeline = JSON.parse(file);

    for(var i = 0; i < config.rss.max_rss_items; i++ ){
      storage.getPostBySlug(timeline[i]["slug"], function (error, file){
        if (error) {
          throw error;
        } else {
          var post = JSON.parse(file);
          post.content = markdown.makeHtml(post.content);

          rss_obj.channel.item.push({
            title: post.title,
            author: {
              name: config.rss.author.name,
              uri : config.rss.author.uri
            },
            link: config.rss.link + '/post/' + post.slug,
            guid: config.rss.link + '/post/' + post.slug,
            pubDate: post.created,
            description: markdown.makeHtml(post.content)

          });
        }

        if(rss_obj.channel.item.length == config.rss.max_rss_items){
          var rss_content = data2xml('rss', rss_obj);
          res.contentType('application/xml');
          res.send(rss_content);
        }

      });
    }


  });
};

exports.about = function(req, res){
  storage.getPageBySlug('about', function(error, file){
    if (error) {
      res.render('500.jade');
    } else {
      var post = JSON.parse(file);
      post.content = markdown.makeHtml(post.content);
      post.page_title = config.name + " › " + post.title;
      res.render('page', post);
    }
  });
};

exports.links = function(req, res){
  storage.getPageBySlug('links', function(error, file){
    if (error) {
      res.render('500.jade');
    } else {
      var post = JSON.parse(file);
      post.content = markdown.makeHtml(post.content);
      post.page_title = config.name + " › " + post.title;
      res.render('page', post);
    }
  });
};

exports.archives = function(req, res){
  storage.getTimeline(function(error, file){
    var archives = JSON.parse(file);
    res.render('archives', {page_title: config.name + " › Archives", archives: archives});
  });
};