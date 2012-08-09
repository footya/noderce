/**
 * User: willerce
 * Date: 7/30/12
 * Time: 11:47 PM
 */

var storage = require('../storage.js');
var util = require('../lib/util.js');
var config = require('../config.js').config;

/**
 * All Post List
 * [get] /admin/post
 * @param req
 * @param res
 */
exports.post = function(req, res){
  storage.getTimeline(function(error, file){
    var post_list = JSON.parse(file);
    res.render('admin/post',{post_list: post_list});
  });
};

/**
 * Write Post
 * [get][post] /admin/post/write
 * @param req
 * @param res
 */
exports.postWrite = function(req,res){
  if (req.method == 'GET') {//render post write view
    res.render('admin/post_write');
  }else if (req.method == 'POST') {// POST a post
    var post = {
      title : req.body.title,
      slug: req.body.slug,
      content : req.body.content,
      created : util.format_date(new Date())
    }

    try{
      storage.writePost(post);
      res.redirect('/admin/post/'+ post.slug);
    }
    catch(error) {
      console.log(error);
    }
  }
};

/**
 * [post] /admin/post/edit
 * @param req
 * @param res
 */
exports.postEdit = function(req, res){
  if(req.method == "GET") {
    var slug = req.params.slug;
    storage.getPostBySlug(slug,function(err, file){
      res.render('admin/post_edit', JSON.parse(file));
    });
  } else if(req.method == "POST") {
    var post = {
      title : req.body.title,
      slug: req.body.slug,
      content : req.body.content,
      created : req.body.created
    }

    try{
      storage.updatePost(req.body.old_slug, post);
      res.redirect('/admin/post/edit/'+ post.slug+"?msg=success");
    }
    catch(error) {
      console.log(error);
    }
  }
};

/**
 * [get] /admin
 * @param req
 * @param res
 */
exports.index = function(req,res){
  if (!req.session.user) {
    res.redirect('/admin/login');
  }else{
    res.render('admin/index');
  }
};


exports.login = function(req, res){
  if(req.method == "GET") {
    res.render("admin/login");
  } else if(req.method == "POST") {
    var name = req.body.name.trim();
    var pass = req.body.pass.trim();
    if(name ==''||pass == ''){
      res.render('admin/login', {
        error : '信息不完整。'
      });
      return;
    }

    storage.getUserByName(name, function(user){
      pass = util.md5(pass)
      if(user.pass != pass){
        res.render('admin/login', {
          error : '密码错误。'
        });
        return;
      }
      gen_session(user, res);// store session cookie
      res.redirect('/admin');
    });
  }
};

/**
 * 退出系统
 */
exports.logout = function(req, res, next) {
  req.session.destroy();
  res.clearCookie(config.auth_cookie_name, {
    path : '/'
  });
  res.redirect('/');
};

/**
 * auth_user middleware
 */
exports.auth_user = function(req, res, next) {
  if (req.session.user) {
    return next();
  }
  else {
    var cookie = req.cookies[config.auth_cookie_name];
    if (!cookie)
      return next();

    var auth_token = util.decrypt(cookie, config.session_secret);
    var auth = auth_token.split('\t');
    var user_name = auth[0];

    storage.getUserByName(user_name, function(user){
      if (user) {
        req.session.user = user;
        return next();
      }
      else
        return next();
      }
    );

  }
};

/** private function */

function gen_session(user, res) {
  var auth_token = util.encrypt(user.name + '\t' + user.pass , config.session_secret);
  res.cookie(config.auth_cookie_name, auth_token, {
    path : '/',
    maxAge : 1000 * 60 * 60 * 24 * 7
  }); // cookie 有效期1周
};