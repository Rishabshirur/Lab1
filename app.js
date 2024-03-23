// This file should set up the express server as shown in the lecture code
import express from 'express';
const app = express();
import configRoutes from './routes/index.js';
import session from 'express-session';

app.use(
  session({
      name: 'AuthCookie',
      secret: 'some secret string!',
      resave: false,
      saveUninitialized: false
})
);
app.use(express.json());
app.use(express.urlencoded({ extended: true}));

let urlcounter={};
app.use((req, res, next) => {

  if(!urlcounter[req.url]){
    urlcounter[req.url]=1;
  }else{
    urlcounter[req.url]++;
  }
  console.log(urlcounter);
  console.log(`No. of times url ${req.url} requested: ${urlcounter[req.url]}`);

  let b=req.body;
  let body1 = Object.assign({}, b);

  if(body1.password){
    delete body1.password;
  }
  console.log("Request body : ",body1);
  console.log("URL : "+req.url);
  console.log("Method : "+ req.method);
  next();
});




configRoutes(app);
app.listen(3000, () => {
  console.log("We've now got a server!");
  console.log('Your routes will be running on http://localhost:3000');
});
