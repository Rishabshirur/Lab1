// This data file should export all functions using the ES6 standard as shown in the lecture code
import {recipes} from '../config/mongoCollections.js';
import {ObjectId} from 'mongodb';
import validation from '../helpers.js';

const exportedMethods = {

  async get(recipeId){
    recipeId = validation.checkId(recipeId, 'recipeId');
    const recipeCollection = await recipes();
    const recipe = await recipeCollection.findOne({_id: new ObjectId(recipeId)});
    if (recipe === null) throw 'No recipe with that id';
    recipe._id = recipe._id.toString();
    return recipe;
  },
  async createRecipe(
    title,
    ingredients,
    skillLevel,
    steps,
    userId,
    username
  ){
    if (!title|| !ingredients|| !skillLevel|| !steps|| !userId|| !username) throw 'You must provide all the parameters';
    title = validation.checkString(title, 'Title');
    if(title.length<5){ throw 'he title should be a minimum of 5 characters long'}
    if (title.match(/[^ a-zA-Z0-9]/)) { throw 'No special characters allowed in Title'}

    skillLevel = validation.checkString(skillLevel, 'skillLevel');
    skillLevel = skillLevel.toLowerCase();
    if(!(/^(novice|intermediate|advanced)$/.test(skillLevel))){ throw 'Error: Invalid skillLevel'}

    steps = validation.checkStringArray(steps, 'Steps');
    if(steps.length<5){ throw 'there should be at least 5 valid string elements in the array'}
    for (let i in steps) {
      if (!steps[i].match(/^(?=.*[a-zA-Z])(?=(.*[\da-zA-Z]){20}).{20,}$/)) {
          throw ' The minimum number of characters should be 20.'
      }
    }
    

    ingredients = validation.checkStringArray(ingredients, 'Ingredients'); 
    for (let i in ingredients) {
      ingredients[i]=ingredients[i].trim();
      if (!ingredients[i].match(/^([ a-zA-Z0-9]{4,50})$/)){
          throw 'The minimum characters for each ingredient should be 4 characters and the max 50 characters and No special characters allowed'
      }
    }
    if(ingredients.length<4){ throw 'there should be at least 4 valid string elements in the array'}

    

    let newrecipe={
      title: title,
      ingredients: ingredients,
      skillLevel: skillLevel,
      steps: steps,
      user: {_id: userId, username: username},
      reviews:[],
      likes: []
    }
    const recipeCollection= await recipes();
    const insertInfo = await recipeCollection.insertOne(newrecipe);
    if (!insertInfo.acknowledged || !insertInfo.insertedId)
      throw 'Could not add recipe';
    const newId = insertInfo.insertedId.toString();
    const recipe = await this.get(newId);
    return recipe;
  },

  async getAllRecipes(page=1){
    const recipeCollection = await recipes();
    let recipeList = await recipeCollection.find({}).skip((page-1)*50).limit(50).toArray();
    if (recipeList.length==0) throw 'there are no more recipes';
    recipeList = recipeList.map((element) => {
      element._id = element._id.toString();
      return element;
    });
    return recipeList;
  },

  async updateRecipe(
    recipeId,
    title,
    ingredients,
    skillLevel,
    steps
  ){
    if (!title && !ingredients && !skillLevel && !steps) throw ' At least one field needs to be supplied in the request body';
    
    let recipe= await this.get(recipeId);

    
    title = validation.checkString(title, 'Title');
    if(title.length<5){ throw 'he title should be a minimum of 5 characters long'}
    if (!title.match(/^[\w\s-]+$/)) { throw 'No special characters allowed in title'}

    
   
    
    ingredients = validation.checkStringArray(ingredients, 'Ingredients'); 
    for (let i in ingredients) {
      ingredients[i]=ingredients[i].trim();
      if (!ingredients[i].match(/^([ a-zA-Z0-9]{4,50})$/)) {
          throw 'The minimum characters for each ingredient should be 4 characters and the max 50 characters and No special characters allowed'
      }
    }
    if(ingredients.length<4){ throw 'there should be at least 4 valid string elements in the array'}
      
    
    skillLevel = validation.checkString(skillLevel, 'skillLevel');
    skillLevel = skillLevel.toLowerCase();
    if(!(/^(novice|intermediate|advanced)$/.test(skillLevel))){ throw 'Error: Invalid skillLevel'}
    

    steps = validation.checkStringArray(steps, 'Steps');
    if(steps.length<5){ throw 'there should be at least 5 valid string elements in the array'}
    for (let i in steps) {

      if (!steps[i].match(/^(?=.*[a-zA-Z])(?=(.*[\da-zA-Z]){20}).{20,}$/)) {
          throw 'The minimum characters for each ingredient should be 4 characters and the max 50 characters'
      }
    }
      
  
    let user=recipe.user;
    let reviews;
    if(recipe.reviews){
     reviews=recipe.reviews
    }else{
      reviews=[];
    }
    let likes;
    if(recipe.likes){
      likes=recipe.likes
     }else{
       likes=[];
     }


    let updatedRecipeData = {
      title:title,
      ingredients:ingredients,
      skillLevel:skillLevel,
      steps:steps,
      user:user,
      reviews:reviews,
      likes:likes
    };
    
    const recipeCollection = await recipes();    
    const updateInfo = await recipeCollection.findOneAndReplace(
      {_id:new ObjectId(recipeId)},
      updatedRecipeData,
      {returnDocument: 'after'}
    );
    if (updateInfo.lastErrorObject.n === 0)
      throw [404, `Error: Update failed! Could not update post with id ${recipeId}`];
    return updateInfo.value;
  }
};
export default exportedMethods;
