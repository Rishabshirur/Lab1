# Recipe API Development

This RESTful API allows users to perform various operations such as creating, updating, and deleting recipes, as well as adding reviews and likes to recipes. Below is an overview of the API endpoints and their functionalities:

## API Endpoints

### Recipes

- **GET /recipes**: Retrieves a paginated list of recipes. By default, it shows the first 50 recipes in the collection. You can navigate through pages using the `page` query parameter.
- **GET /recipes/:id**: Retrieves the recipe with the specified ID.
- **POST /recipes**: Creates a new recipe with the supplied details.
- **PATCH /recipes/:id**: Updates the recipe with the specified ID.
- **POST /recipes/:id/reviews**: Adds a new review to the recipe.
- **POST /recipes/:id/likes**: Allows a user to like/unlike a recipe.
- **DELETE /recipes/:recipeId/:reviewId**: Deletes the review with the specified ID from the recipe.

### Authentication

- **POST /signup**: Creates a new user in the system.
- **POST /login**: Logs in a user with the supplied username and password.
- **GET /logout**: Logs out the user and expires the session.

### Middleware

- Logs request bodies and tracks URL request counts.

## Database

There are two collections:
1. **Recipes**: Contains recipe documents with fields such as title, ingredients, steps, skill level, user, reviews, and likes.
2. **Users**: Contains user documents with fields such as name, username, and hashed password.

## Error Handling

All routes and database functions perform thorough error checking to ensure correct data types, presence of required fields, and logical data constraints. Proper HTTP status codes (e.g., 400, 404, 403) are returned for different types of failures.

## Usage

To use the API, you can make HTTP requests using tools like Postman. Ensure that the request bodies are in JSON format.

## Setup

1. Clone this repository to your local machine.
2. Install dependencies using `npm install`.
3. Configure environment variables (e.g., MongoDB connection string).
4. Start the server using `npm start`.

