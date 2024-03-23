import {dbConnection, closeConnection} from './config/mongoConnection.js';
import {recipesData} from './data/index.js';
import {createUser} from './data/users.js';
const db= await dbConnection();
await db.dropDatabase();

let tempusername = "username1";
let tempuser = await createUser("User",tempusername,"Password@123");


let temprecipe;
for(let i=1;i<53;i++){
    temprecipe=await recipesData.createRecipe(
 `Recipe Title ${i}`,    
  ["One whole chicken", "2 cups of flour", "2 eggs", "salt", "pepper", "1 cup cooking oil", "3 lemons"], 
 "Novice",
 ["First take the two eggs and mix them with the flour, the salt and the pepper", "Next, dip the chicken into the mix", "take 1 cup of oil and put in frier", "Fry the chicken on medium heat for 1 hour", "squeeze lemon juice on chicken and serve"],
 tempuser._id.toString(),
 tempusername
    );
}

await closeConnection();