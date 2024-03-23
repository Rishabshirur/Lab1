
import recipeRoutes from './recipes.js';
import logoutRoutes from './logout.js';
import loginRoutes from './login.js';
import signupRoutes from './signup.js';

const constructorMethod = (app) => {
  app.use('/recipes', recipeRoutes);
  app.use('/login', loginRoutes);
  app.use('/logout', logoutRoutes);
  app.use('/signup', signupRoutes);

  app.use('*', (req, res) => {
    res.status(404).json({error: 'Route Not found'});
  });
};

export default constructorMethod;