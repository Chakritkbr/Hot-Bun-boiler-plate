import app from './app';

console.log(process.env.PORT);

app.listen(app.get('server_port'), () => {
  console.log('server running on port:' + app.get('server_port'));
});
