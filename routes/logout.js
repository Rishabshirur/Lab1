import {Router} from 'express';
const router = Router();
import validation from '../helpers.js';
router
  .route('/')
  .get(async (req, res) => {
    try {
        if(!req.session.user){
            throw 'Error: You are not logged in'
        }
    } catch (e) {
        return res.status(403).json({error: e})
    }
    req.session.destroy();
    return res.status(200).json({message:"Successfully Logged out"});
  });
  export default router;  