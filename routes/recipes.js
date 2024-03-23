// Import the express router as shown in the lecture code
// Note: please do not forget to export the router!
import {Router} from 'express';
const router = Router();
import {recipesData} from '../data/index.js';
import {reviewsData} from '../data/index.js';
import {checkUser} from '../data/users.js'
import validation from '../helpers.js';
router
  .route('/')
  .get(async (req, res) => {
    //code here for GET
    let page;
    try{
      page=req.query.page;
      if(page){
        if (!page.match(/^[\w\s-]+$/)) { throw 'Invalid page'}
        }
      if(!page){
        page=1;
      }
      
      // console.log(typeof(page));
      page=parseInt(page);
      // console.log(page);
      if(page!==Math.floor(page)){
        throw 'Invalid page'
      }
      
      if(page<1 || isNaN(page)){
        throw 'Invalid page'
      }
      console.log(Math.floor(page));
      console.log(page);
    }catch(e){
      return res.status(400).json({error: `${e}`})
    }

    try {
      const recipeList = await recipesData.getAllRecipes(page);
      return res.status(200).json(recipeList);
    } catch (e) {
      return res.status(404).json({error: `${e}`});
    }
  })
  .post(async (req, res) => {
    //code here for POST
    const recipeinput = req.body;
    if (!recipeinput || Object.keys(recipeinput).length === 0) {
      return res
        .status(400)
        .json({error: 'There are no fields in the request body'});
    }
    try {
      if (!recipeinput.title|| !recipeinput.ingredients|| !recipeinput.skillLevel|| !recipeinput.steps) throw 'You must provide all the parameters';
      
      
      
      if(recipeinput.title.length<5){ throw 'he title should be a minimum of 5 characters long'}
      if (recipeinput.title.match(/[^ a-zA-Z0-9]/)) { throw 'No special characters allowed in ingredients'}

      recipeinput.skillLevel = validation.checkString(recipeinput.skillLevel, 'skillLevel');
      recipeinput.skillLevel = recipeinput.skillLevel.toLowerCase();
      if(!(/^(novice|intermediate|advanced)$/.test(recipeinput.skillLevel))){ throw 'Error: Invalid skillLevel'}

      recipeinput.steps = validation.checkStringArray(recipeinput.steps, 'Steps');
      if(recipeinput.steps.length<5){ throw 'there should be at least 5 valid string elements in the array'}
      for (let i in recipeinput.steps) {
        if (!recipeinput.steps[i].match(/^(?=.*[a-zA-Z])(?=(.*[\da-zA-Z]){20}).{20,}$/)) {
            throw ' The minimum number of characters should be 20'
        }
      }

      recipeinput.ingredients = validation.checkStringArray(recipeinput.ingredients, 'Ingredients'); 
      for (let i in recipeinput.ingredients) {
        recipeinput.ingredients[i]=recipeinput.ingredients[i].trim();
        if (!recipeinput.ingredients[i].match(/^([ a-zA-Z0-9]{4,50})$/)) {
            throw 'The minimum characters for each ingredient should be 4 characters and the max 50 characters and no special characters allowed'
        }
      }
      if(recipeinput.ingredients.length<4){ throw 'there should be at least 4 valid string elements in the array'}

    } catch (e) {
      return res.status(400).json({error: e});
    }

    try{
      console.log(req.session.user)
      if(!req.session.user){
        throw 'Error: you must login first'
      }
    }catch(e){
      return res.status(401).json({error: `${e}`});
    }

    try {
      const {title, ingredients, skillLevel, steps} = recipeinput;
      
      let userId= req.session.user._id;
      let username= req.session.user.username;
      const newRecipe = await recipesData.createRecipe(title, ingredients, skillLevel, steps, userId, username);
      return res.status(200).json(newRecipe);
    } catch (e) {
      return res.status(400).json({error: `${e}`});
    }
  });

router
  .route('/:id')
  .get(async (req, res) => {
    //code here for GET
    try {
      req.params.id = validation.checkId(req.params.id, 'Id URL Param');
    } catch (e) {
      return res.status(400).json({error: `${e}`});
    }
    try {
      const recipe = await recipesData.get(req.params.id);
      return res.status(200).json(recipe);
    } catch (e) {
      return res.status(404).json({error: `${e}`});
    }
  })

  .patch(async (req, res) => {
    //code here for PUT
    const updatedData = req.body;
    if (!updatedData || Object.keys(updatedData).length === 0) {
      return res.status(400).json({error: 'There are no fields in the request body'});
    }
    try{
      if(!req.session.user){
        throw 'Error: you must login first'
      }
    }catch(e){
      return res.status(401).json({error: `${e}`});
    }
    let recipe;
    try{
      recipe= await recipesData.get(req.params.id);
    }catch(e){
      return res.status(404).json({error: `${e}`})
    }
     
    try{
      if(recipe.user._id!== req.session.user._id){
        throw 'must be the same user who originally posted the recipe'
      }
    }catch(e){
      return res.status(403).json({error: `${e}`})
    }
    let new_ingredients;
    let new_title;
    let new_skillLevel;
    let new_steps;
    try{
      if (!updatedData.title && !updatedData.ingredients && !updatedData.skillLevel && !updatedData.steps) throw ' At least one field needs to be supplied in the request body';
    
      if(updatedData.title){
        updatedData.title = validation.checkString(updatedData.title, 'Title');
        if(updatedData.title.length<5){ throw 'he title should be a minimum of 5 characters long'}
        if (!updatedData.title.match(/^[\w\s-]+$/)) { throw 'No special characters allowed in title'}
  
        if(updatedData.title==recipe.title){
          throw 'title must be different than what is currently stored'
        }
        new_title=updatedData.title;
      }else{
        new_title=recipe.title;
      }
      let x=0;
      
      if(updatedData.ingredients){
        updatedData.ingredients = validation.checkStringArray(updatedData.ingredients, 'Ingredients'); 
        if(updatedData.ingredients.length!==recipe.ingredients.length){ 
          x=1;
        }
        for (let i in updatedData.ingredients) {
          updatedData.ingredients[i]=updatedData.ingredients[i].trim();
          if(updatedData.ingredients[i]!==recipe.ingredients[i]){
            x=1;
          }
          if (!updatedData.ingredients[i].match(/^([ a-zA-Z0-9]{4,50})$/)) {
              throw 'The minimum characters for each ingredient should be 4 characters and the max 50 characters and No special characters allowed'
          }
        }
        if(updatedData.ingredients.length<4){ throw 'there should be at least 4 valid string elements in the array'}
        if(x==0){ throw 'ingredients must be different than what is currently stored'}
        new_ingredients=updatedData.ingredients;
      }else{
        new_ingredients=recipe.ingredients;
      }
      
      if(updatedData.skillLevel){
        updatedData.skillLevel = validation.checkString(updatedData.skillLevel, 'skillLevel');
        updatedData.skillLevel = updatedData.skillLevel.toLowerCase();
        if(!(/^(novice|intermediate|advanced)$/.test(updatedData.skillLevel))){ throw 'Error: Invalid skillLevel'}
  
        if(updatedData.skillLevel==recipe.skillLevel){ throw 'skillLevel must be different than what is currently stored'}
        new_skillLevel=updatedData.skillLevel;
      }else{
        new_skillLevel=recipe.skillLevel;
      }
      let y=0;
      if(updatedData.steps){
        updatedData.steps = validation.checkStringArray(updatedData.steps, 'Steps');
        if(updatedData.steps.length<5){ throw 'there should be at least 5 valid string elements in the array'}
        if(updatedData.steps.length!==recipe.steps.length){ 
          y=1;
        }
        for (let i in updatedData.steps) {
          if(updatedData.steps[i]!==recipe.steps[i] ){
            y=1;
          }
          if (!updatedData.steps[i].match(/^(?=.*[a-zA-Z])(?=(.*[\da-zA-Z]){20}).{20,}$/)) {
              throw 'The minimum characters for each ingredient should be 4 characters and the max 50 characters'
          }
        }
        if(y==0){ throw 'steps must be different than what is currently stored'}
        new_steps=updatedData.steps;
      }else{
        new_steps=recipe.steps;
      }

    } catch (e) {
      return res.status(400).json({error: `${e}`});
    }

    try {
      const updatedrecipe = await recipesData.updateRecipe(
        req.params.id,
        new_title,
        new_ingredients,
        new_skillLevel,
        new_steps
      );
      res.json(updatedrecipe);
    } catch (e) {
      res.status(404).json({error: `${e}`});
    }
  });

router
  .route('/:id/reviews')
  .post(async (req, res) => {
    try {
      req.params.id = validation.checkId(req.params.id, 'recipeId URL Param');
    } catch (e) {
      return res.status(400).json({error: e});
    }
    try{
      if(!req.session.user){
        throw 'Error: you must login first'
      }
    }catch(e){
      return res.status(401).json({error: `${e}`});
    }
    let recipe1;
    try {
      recipe1 = await recipesData.get(req.params.id);
    } catch (e) {
      return res.status(404).json({error: `${e}`});
    }

    const reviewinput = req.body;
    if (!reviewinput || Object.keys(reviewinput).length === 0) {
      return res.status(400).json({error: 'There are no fields in the request body'});
    }
    try{
      if (!reviewinput.rating|| !reviewinput.review) throw 'You must provide all the parameters';
      if (typeof reviewinput.rating!== 'number' || reviewinput.rating < 1 || reviewinput.rating > 5 || Math.floor(reviewinput.rating) !== reviewinput.rating){ throw `must be a positive whole number between 1-5`}
      reviewinput.review = validation.checkString(reviewinput.review,'review');
      if(reviewinput.review.length<25){
        throw 'The review should be a minimum of 25 characters long'
      }
    }catch(e){
      return res.status(400).json({error: e});
    }
    let userId=req.session.user._id;
    let username= req.session.user.username;

    try {
      let newReview = await reviewsData.createReview(req.params.id, reviewinput.rating, reviewinput.review, userId, username);
      res.status(200).json(newReview);
    } catch (e) {
      res.status(400).json({error: `${e}`});
    }
  });

router
  .route('/:id/likes')
  .post(async (req, res) => {

    try {
      req.params.id = validation.checkId(req.params.id, 'Id URL Param');
    } catch (e) {
      return res.status(400).json({error: e});
    }
    try{
      if(!req.session.user){
        throw 'Error: you must login first'
      }
    }catch(e){
      return res.status(401).json({error: `${e}`});
    }
    let recipe;
    try{
      recipe=await recipesData.get(req.params.id);
    }catch(e){
      return res.status(404).json({error: `${e}`});
    }
    try {
      const liked = await reviewsData.like(req.params.id,req.session.user._id);
      return res.status(200).json(liked);
    } catch (e) {
      return res.status(404).json({error: `${e}`});
    }
  });
  
router
  .route('/:recipeId/:reviewId')
  .delete(async (req, res) => {
    try {
      req.params.reviewId = validation.checkId(req.params.reviewId, 'ReviewId URL Param');
      req.params.recipeId = validation.checkId(req.params.recipeId, 'RecipeId URL Param');
    }catch(e){
      return res.status(400).json({error: e});
    }
    try{
      if(!req.session.user){
        throw 'Error: you must login first'
      }
    }catch(e){
      return res.status(401).json({error: `${e}`});
    }
    let recipe;
    try{
      recipe=await recipesData.get(req.params.recipeId);
    }catch(e){
      return res.status(404).json({error: `${e}`});
    }
    let x=0;
    let y=0;
    try{
      for(let i in recipe.reviews){
        if(recipe.reviews[i]._id==req.params.reviewId){
          x=1;
          if(recipe.reviews[i].user._id==req.session.user._id){
            y=1;
          }
        }
      }
      if(x==0) throw 'review not found'
    }catch(e){
      return res.status(404).json({error: e})
    }
    if(y==0){
      return res.status(401).json({error: 'not authorized'})
    }
    try{
      if(recipe._id.toString()!==req.params.recipeId){
        throw [404, `Error: no review with reviewId in recipe with recipeId`]
      }
    }catch(e){
      return res.status(404).json({error: e})
    }
    try {
      let deletedReview = await reviewsData.deleteReview(req.params.recipeId,req.params.reviewId);
      return res.status(200).json(deletedReview);
    } catch (e) {
      return res.status(500).json({error: `${e}`});
    }
  });  
  
export default router;