import {users} from '../config/mongoCollections.js';
import {ObjectId} from 'mongodb';
import bcrypt from 'bcrypt';
import validation from '../helpers.js';



export const createUser = async (
  name,
  username,
  password
) => {

    if( !name|| !username|| !password){
        throw 'Error: Must provide all fields'
    }
    name = validation.checkString(name, "name");
    username = validation.checkString(username, "username");

    if(!( /^(?=.*[a-zA-Z])[A-Za-z0-9]+$/.test(username))){ throw 'Error: Invalid username'}
    if(username.length<5){ throw 'username should be atleast 5 charachters long'}
    

    const userCollection= await users();
    username = username.toLowerCase();
    let user = await userCollection.findOne({username:username})
    if(user){
        throw 'there is already a user with that username'
        }

    password = validation.checkString(password, "Password");
    if((/^(.{0,7}|[^0-9]*|[^a-z]*|[^A-Z]*|[a-zA-Z0-9]*)$/.test(password))){
        throw 'Error: Invalid Password'
    }
    if(password.match(/\s/g)){
        throw 'Error: Invalid Password'
    }
    
    const hash = await bcrypt.hash(password, 16);

    let newUser={
        name: name,
        username: username,
        password: hash
    }
    
    const insertInfo = await userCollection.insertOne(newUser);
    if (!insertInfo.acknowledged || !insertInfo.insertedId)
        throw 'Could not add User'

    delete newUser.password
    return newUser;
};

export const checkUser = async (username, password) => {
    if(!username|| !password){
        throw 'Error: username or password not supplied'
    }
    
    username = validation.checkString(username, "Username");
    if(!( /^(?=.*[a-zA-Z])[A-Za-z0-9]+$/.test(username))){ throw 'Error: Invalid username'}
    if(username.length<5){ throw 'username should be atleast 5 charachters long'}

    username = username.toLowerCase();
    password = validation.checkString(password, "Password");
    if((/^(.{0,7}|[^0-9]*|[^a-z]*|[^A-Z]*|[a-zA-Z0-9]*)$/.test(password))){
        throw 'Error: Invalid Password'
    }
    if(password.match(/\s/g)){
        throw 'Error: Invalid Password'
    }

    const userCollection = await users();
    let userList = await userCollection.findOne({username:username});
    let found=false;
    let tempuser;
    if(userList){
        found = true;
        tempuser = userList;
    }
    if(found==false){
        throw 'Either the username or password is invalid'
    }
    let compareToMatch = await bcrypt.compare(password, tempuser.password);
    if(!compareToMatch){
        throw 'Either the username or password is invalid'
    }
    delete tempuser.password;
    return tempuser;
};
