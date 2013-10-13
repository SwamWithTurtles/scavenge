Package.describe({
  summary: 'Providing MD5 support for Gravatars'
});

Package.on_use(function (api) {
  api.use([
    'meteor',
  ], ['client', 'server']);

  api.use([
    'handlebars',
  ], 'client');

  api.add_files([
    'lib/md5.js',
  ], ['client', 'server']);

});