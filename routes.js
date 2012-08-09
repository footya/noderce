/**
 * User: willerce
 * Date: 7/30/12
 * Time: 12:23 AM
 */

var blog = require('./routes/blog');
var admin = require('./routes/admin')

module.exports = function (app) {
  app.get('/', blog.index);
  app.get('/page/:id', blog.page);
  app.get('/post/:slug', blog.post);
  app.get('/feed', blog.feed);
  app.get('/about', blog.about);
  app.get('/links', blog.links);
  app.get('/archives', blog.archives);


  /* admin */
  app.get('/admin', admin.index);
  app.get('/admin/login', admin.login);
  app.get('/admin/logout', admin.logout);
  app.get('/admin/post', admin.post);
  app.get('/admin/post/write', admin.postWrite);
  app.get('/admin/post/edit/:slug', admin.postEdit);

  /* admi post */
  app.post('/admin/login', admin.login);

  app.post('/admin/post/write', admin.postWrite);
  app.post('/admin/post/edit/:slug', admin.postEdit);

}