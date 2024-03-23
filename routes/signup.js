import {Router} from 'express';
const router = Router();
import {createUser} from '../data/users.js';
import validation from '../helpers.js';
router
  .route('/')
  .post(async (req, res) => {

    const userinput = req.body;
    if (!userinput || Object.keys(userinput).length === 0) {
        return res.status(400).json({error: 'There are no fields in the request body'});
    }
    try{
        if (!userinput.name|| !userinput.username || !userinput.password) throw 'You must provide all the parameters';
        userinput.name = validation.checkString(userinput.name, "name");
        userinput.username = validation.checkString(userinput.username, "username");
        if(!( /^[A-Za-z][A-Za-z\'\-]+([\ A-Za-z][A-Za-z\'\-]+)*/.test(userinput.name))){ throw 'Error: Invalid name'}
        if(!( /^(?=.*[a-zA-Z])[A-Za-z0-9]+$/.test(userinput.username))){ throw 'Error: Invalid username'}
        if(userinput.username.length<5){ throw 'username should be atleast 5 charachters long'}
        
        userinput.password = validation.checkString(userinput.password, "Password");
        if((/^(.{0,7}|[^0-9]*|[^a-z]*|[^A-Z]*|[a-zA-Z0-9]*)$/.test(userinput.password))){
            throw 'Error: Invalid Password'
        }
        if(userinput.password.match(/\s/g)){
            throw 'Error: Invalid Password'
        }
    }catch(e){
      return res.status(400).json({error: e});
    }


    try {
      let newUser = await createUser(userinput.name, userinput.username, userinput.password);
      res.status(200).json(newUser);
    } catch (e) {
      res.status(400).json({error: `${e}`});
    }
  });
export default router;