// This data file should export all functions using the ES6 standard as shown in the lecture code
import {recipes} from '../config/mongoCollections.js';
import * as recipesData from './recipes.js';
import {ObjectId} from 'mongodb';
import validation from '../helpers.js';

const exportedMethods = {
  async createReview(
  recipeId,
  rating,
  review,
  userId,
  username
  ){
    if(!recipeId|| !rating|| !review){ throw `All fields need to have valid values`}
    recipeId = validation.checkId(recipeId, 'recipeId');
    if (typeof rating!== 'number' || rating < 1 || rating > 5 || Math.floor(rating) !== rating){ throw `must be a positive whole number between 1-5`}
    review = validation.checkString(review,'review');
    if (review.match(/^[^a-zA-Z0-9]+$/)) { throw 'Cannot be all special chars'}
    if(review.length<25){
      throw 'The review should be a minimum of 25 characters long'
    }

    const newReview = {
      _id: new ObjectId(),
      user: {_id:userId, username:username},
      rating:rating,
      review:review
    };

    let recipe= await recipesData.default.get(recipeId);
    let tempReviews = recipe.reviews;
    tempReviews.forEach(ele => {
      if(ele.user._id==userId){
        throw "you are only allowed to review a recipe once";
      }
    });

    const recipeCollection= await recipes();
    const insertInfo = await recipeCollection.updateOne(
      {_id:new ObjectId(recipeId)},
      {$addToSet:{reviews:newReview}}
    );
    if (insertInfo.modifiedCount === 0)
      throw 'Could not add review';

    recipe= await recipesData.default.get(recipeId);
    return recipe;
  },

  async deleteReview(recipeId,reviewId){
    if(!recipeId|| !reviewId){ throw `All fields need to have valid values`}
    recipeId = validation.checkId(recipeId,'recipeId');
    reviewId = validation.checkId(reviewId,'reviewId');

    const recipeCollection = await recipes();
    const recipe1 = await recipeCollection.findOne({reviews:{$elemMatch:{_id:new ObjectId(reviewId)}}});

    if (!recipe1) throw 'Error: review with that reviewId doesnt exist';
    
    let recipe=await recipesData.default.get(recipeId);
    if(!recipe){
      throw 'no recipe with that recipeId'
    }
    if(recipe1._id.toString()!==recipeId){
      throw [404, `Error: no review with reviewId in recipe with recipeId`]
    }

    const deletionInfo = await recipeCollection.updateOne({_id:new ObjectId(recipeId)},{$pull:{reviews:{_id:new ObjectId(reviewId)}}});
    if(!deletionInfo){
      throw 'errror';
    }
    if (deletionInfo.modifiedCount == 0)
      throw [404, `Error: Could not delete review with id of ${reviewId}`];
    let recipe2 = await recipesData.default.get(recipeId);

    return recipe2;
  },

  async like(recipeId, userId){
    if(!recipeId|| !userId){ throw `All fields need to have valid values`}
    recipeId = validation.checkId(recipeId,'recipeId');
    userId = validation.checkId(userId,'userId');  

    let recipe=await recipesData.default.get(recipeId);
    if(!recipe){ throw 'recipe with that recipeID does not exist'}

    const recipeCollection = await recipes();
    const LikedPreviously = await recipeCollection.findOne({likes:userId});
    if(LikedPreviously){
      recipe.likes.pop(userId);
    }else{
      recipe.likes.push(userId);
    }
    const updateInfo = await recipeCollection.updateOne(
      {_id:new ObjectId(recipeId)}, {$set: {likes:recipe.likes}}
    );
    if (updateInfo.modifiedCount === 0)
      throw [404, `Error: Update failed!`];
    let newrecipe=await recipesData.default.get(recipeId);
    return newrecipe;
  }
};
export default exportedMethods;
