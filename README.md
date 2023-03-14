# User Authentication & Authorization REST API with data validation and password hashing

An API for creating and managing user accounts. It stores newly created user accounts on a database after validating the data and hashing the passwords. User login using either e-mail or username. JsonWebToken is used for authorization.

The API has paths for:

- Creating a new user
- Updating exiting user information
- Deleting users
- Getting a single user account data
- Login

### Built with

- NodeJS
- Express
- MongoDB
- Mongoose
- Bcrypt
- JSON Web Token
