import {checkUser, createUser} from '../data/users.js'
import {Router} from 'express';
const router = Router();
import validation from '../helpers.js';
router
  .route('/')
  .post(async (req, res) => {

    const logininput = req.body;
    if(req.session.user){
        throw res.status(403).json({error: 'You are already logged in'})
    }
    if (!logininput || Object.keys(logininput).length === 0) {
        return res.status(400).json({error: 'There are no fields in the request body'});
    }
    try{
        if (!logininput.username || !logininput.password) throw 'You must provide all the parameters';
        logininput.username = validation.checkString(logininput.username, "username");
        if(!( /^(?=.*[a-zA-Z])[A-Za-z0-9]+$/.test(logininput.username))){ throw 'Error: Invalid username'}
        if(logininput.username.length<5){ throw 'username should be atleast 5 charachters long'}
        
        logininput.password = validation.checkString(logininput.password, "Password");
        if((/^(.{0,7}|[^0-9]*|[^a-z]*|[^A-Z]*|[a-zA-Z0-9]*)$/.test(logininput.password))){
            throw 'Error: Invalid Password'
        }
        if(logininput.password.match(/\s/g)){
            throw 'Error: Invalid Password'
        }
    }catch(e){
      return res.status(400).json({error: e});
    }


    try {
      let newUser = await checkUser(logininput.username, logininput.password);
      if(newUser){
        req.session.user = newUser;
      }
      res.status(200).json(newUser);
    } catch (e) {
      res.status(400).json({error: `${e}`});
    }
  });
export default router;