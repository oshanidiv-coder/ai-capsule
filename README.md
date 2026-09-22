README - AI Capsule
AI Capsule is a full-stack web application for storing, reviewing, updating, and managing useful AI prompts. Users authenticate using GitHub OAuth and can access only their own prompt records.
The application uses a React frontend, an Express/Node.js backend, SQLite for data storage, GitHub OAuth for authentication, and an application-issued JWT stored in a Secure, HttpOnly cookie.
Public Deployment
The application is deployed on Render as a public web service.
Public application URL:
https://ai-capsule-1-jwav.onrender.com
Both the React frontend and Express backend are served from the same deployed application and public URL.
For example:
•	Frontend: /
•	Dashboard: /dashboard
•	Express API: /api/...
•	OAuth: /auth/...
•	Health check: /api/health
This allows the React frontend to communicate with the Express API using relative URLs such as /api/capsules.
Technology Stack
Frontend
•	React
•	React Router
•	Vite
•	CSS
Backend
•	Node.js
•	Express
•	Passport
•	GitHub OAuth
•	JSON Web Tokens
•	cookie-parser
•	Multer
Database
•	SQLite
Cloud Deployment
•	Render Web Service
•	GitHub repository used as the deployment source

Project Structure
The project is organised into separate frontend and backend directories.
ai-capsule/
│
├── backend/
│ ├── middleware/
│ │ └── auth.js
│ ├── database.js
│ ├── passport.js
│ ├── server.js
│ ├── package.json
│ └── package-lock.json
│
├── frontend/
│ ├── public/
│ ├── src/
│ │ ├── pages/
│ │ │ ├── Dashboard.jsx
│ │ │ ├── Landing.jsx
│ │ │ └── Login.jsx
│ │ └── ...
│ ├── package.json
│ └── package-lock.json
│
├── .gitignore
└── README.md
Generated dependencies, secrets, local database files, uploads, and production build files are excluded from the source repository where appropriate.

Installation and Local Setup
Prerequisites
The following software was required:
•	Node.js
•	npm
•	Git
•	A GitHub account
•	A registered GitHub OAuth application
Clone or extract the project and open a terminal in the project directory.

Backend Installation
Navigate to the backend directory: cd backend
Install dependencies: npm install
The backend provides the Express API, GitHub OAuth authentication, JWT authentication, SQLite integration, and screenshot upload functionality.

Frontend Installation
Open another terminal and navigate to the frontend directory: cd frontend
Install dependencies: npm install
For frontend development with Vite: npm run dev
To create the production frontend build: npm run build
The production build is generated in: frontend/dist/
The Express application is configured to serve this production React build.



Running the Combined Application Locally
Build the React frontend first: 1. cd frontend
                                                                              2 .npm run build
Then navigate to the backend: cd ../backend
Start the Express application: npm start
By default, the local application is available at: http://localhost:5000
The backend uses the PORT environment variable when one is supplied by the deployment environment.


Environment Variables
Sensitive values are stored using environment variables and are not committed to the source repository.
The backend requires/configures the following environment-variable names:
1.	GITHUB_CLIENT_ID
2.	GITHUB_CLIENT_SECRET
3.	GITHUB_CALLBACK_URL
4.	JWT_SECRET
5.	SESSION_SECRET
6.	FRONTEND_URL
7.	NODE_ENV
8.	PORT
9.	DATA_DIR
The deployed Render environment also uses deployment configuration such as: NODE_VERSION
Example variable names may be documented, but real secret values must never be committed to the repository or included in this README.
The local .env file is excluded using .gitignore.



GitHub OAuth Authentication
GitHub is used as the OAuth authentication provider.
The authentication flow is:

User
↓
GitHub OAuth
↓
Express OAuth callback
↓
Authenticated application identity
↓
Application JWT created by Express
↓
JWT stored in token cookie
↓
Protected Dashboard/API access

After successful GitHub OAuth authentication, Express issues its own application JWT.
The JWT is signed using the server-side JWT_SECRET.
The JWT is not stored in localStorage or manually entered by the user.



JWT Cookie Security
The application JWT is stored in a cookie named: token

In the deployed HTTPS environment, the cookie is configured with:
•	HttpOnly: true
•	Secure: true
The real JWT value must not be displayed, documented, or submitted.
The frontend sends authenticated requests using the browser cookie, while the Express backend performs JWT verification before allowing access to protected capsule data.



Protected API and User Ownership
All capsule CRUD routes are protected using server-side JWT verification middleware.
The authenticated user identifier is obtained from the verified authentication/JWT context.
The user does not manually enter a User ID into the prompt form.
This prevents a user from choosing another user's identifier and manipulating record ownership.
Database operations restrict capsule access according to the authenticated user, ensuring that users can access only their own prompt records.
Cross-user testing confirmed that one authenticated user could not read, update, or delete another user's records.



API Routes
Health Check

GET /api/health

Public endpoint used to verify that the deployed Express API is operational.
Received response: 
{
"status": "ok"
}
Authentication is not required for this endpoint.


Create Capsule

POST /api/capsules

Creates a new prompt/capsule belonging to the authenticated user.
Authentication is required.
The user ownership value is obtained from the verified JWT identity rather than from user input.


Read Capsules

GET /api/capsules

Returns only the records belonging to the authenticated user.
Authentication is required.
An unauthenticated request returns HTTP 401 Unauthorized.


Update Capsule

PUT /api/capsules/:id

Updates an existing capsule when the requested capsule belongs to the authenticated user.
Authentication is required.
Users cannot update records belonging to another user.


Delete Capsule

DELETE /api/capsules/:id

Deletes an existing capsule when the requested capsule belongs to the authenticated user.
Authentication is required.
Users cannot delete records belonging to another user.
The interface also requests confirmation before performing the delete operation.


Prompt Record Model
Each capsule contains information such as:
•	User ownership identifier
•	Project name
•	Prompt title
•	Prompt version
•	Prompt text
•	Response summary
•	Category
•	Usefulness
•	Reviewed status
•	Improved status
•	Screenshot URL
•	Notes
•	Created timestamp
The user ownership identifier is supplied automatically from the authenticated identity and is not entered manually.




Database Setup
The application uses SQLite.
The primary database tables are:
users
Stores authenticated-user information associated with GitHub authentication.
capsules
Stores AI prompt records and associates each record with an authenticated user.
The database initialization logic is contained in: backend/database.js
The application uses CREATE TABLE IF NOT EXISTS statements, so the required tables are automatically created when the SQLite database does not already exist.
This database-initialization behaviour was tested using a newly created database.
Therefore, the project does not depend on a pre-populated development database to establish the required schema.


Screenshot Support
AI Capsule optionally supports screenshots through:
•	Screenshot URL
•	Direct image upload
•	Screenshot preview
•	Full screenshot link
Uploaded files are restricted to image MIME types.
The maximum screenshot upload size is: 5 MB
When an uploaded screenshot is replaced, the previous local screenshot file is removed.
When a capsule is deleted, its locally uploaded screenshot is also removed.
Screenshot uploading is an additional feature and is not required for the basic CRUD workflow.



Cloud Deployment
The application is deployed using Render Web Service.
The Render service is connected to the project's GitHub repository and deploys the main branch.
The cloud build performs the following general steps:
1.	Install backend dependencies.
2.	Install frontend dependencies.
3.	Build the React frontend using Vite.
4.	Start the Express application.
The Express backend serves both:
•	the built React frontend
•	the Express API
This enables both parts of the application to use the same public origin.



Cloud Storage Approach
The application uses:
•	SQLite for prompt/user records
•	local filesystem storage for uploaded screenshots
The code supports a configurable data directory through: DATA_DIR
The database and upload directory can therefore be placed under an alternative storage location when persistent storage is available.
For the submitted deployment, the application uses the Render free web service.
Render Free uses ephemeral local filesystem storage. Therefore, SQLite database records and uploaded screenshot files may be lost after a Render restart or redeployment.
The database initialization code automatically recreates the required database schema when a new SQLite database is created.



Required cURL Security Tests

All assessment cURL tests use the public deployed Render URL, not localhost.

Test 1: Unauthenticated Request
Command: curl -i https://ai-capsule-1-jwav.onrender.com/api/capsules
Observed result: HTTP 401 Unauthorized

This demonstrates that the protected capsule endpoint cannot be accessed without authentication.

Test 2: Fake/Invalid JWT
Command: curl -i --cookie "token=fake-token-123" https://ai-capsule-1-jwav.onrender.com/api/capsules
Observed result: HTTP 401 Unauthorized

This demonstrates that the backend verifies the JWT and does not simply check whether a cookie named token exists.


Public Health Check
The deployed health endpoint can be tested with: curl -i https://ai-capsule-1-jwav.onrender.com/api/health
Observed result: HTTP/2 200
Response body: 
{
"status": "ok"
}


CRUD Verification

The deployed application was tested for the complete CRUD lifecycle.

CREATE
A new prompt record was created through the public Render application.

READ
The browser was refreshed and the created record was successfully loaded again through the API.

UPDATE
The existing record was edited while retaining the same database ID. The updated values remained after refreshing the application.

DELETE
The record was deleted using the Delete control. After refreshing the application, the deleted record did not return.


Ownership and Security Testing
User ownership was tested using different authenticated GitHub accounts.
Testing confirmed that:
•	A user could retrieve only their own prompt records.
•	A user could not update another user's record.
•	A user could not delete another user's record.
Attempts to update or delete a record belonging to another authenticated user were rejected by the backend.


Application Limitation

One limitation of the submitted deployment is the use of SQLite and local filesystem storage on the Render free web service.
The Render free service uses temporary/ephemeral filesystem storage. As a result, prompt records stored in SQLite and uploaded screenshot files may be lost when the service is restarted or redeployed.
The application compensates partially for this limitation by automatically recreating the required database schema when a new database is initialized, but runtime user data is not guaranteed to survive a cloud redeployment.
For a longer-term production system, persistent database and object/file storage would be preferable.



AI-Assisted Development Statement
Microsoft Copilot was used as an AI-assisted development tool during this project.
AI assistance was used to:
•	understand development errors
•	review implementation approaches
•	troubleshoot authentication and API issues
•	diagnose deployment problems
•	review security and testing requirements
•	README sections
AI-generated suggestions were reviewed, implemented, and tested during development rather than being accepted without verification.


Example Problem Identified and Corrected
One issue identified after cloud deployment affected the DELETE functionality.
The deployed frontend initially sent a request equivalent to:
/api/capsules1
instead of:
/api/capsules/1
Because the forward slash before the capsule ID was missing, the Express route did not match and the deployed server returned HTTP 404.
The issue was diagnosed using the browser Network tools.
The frontend route was corrected, the updated code was committed and redeployed, and DELETE functionality was successfully re-tested on the public Render application.





Implementation and Deployment Decision
One important deployment decision was to serve the built React frontend directly from the Express application rather than deploying the frontend and backend as separate cloud services.
The React frontend and Express API therefore share the same public Render domain.
This allows the frontend to use relative endpoints such as: /api/capsules
and: /auth/github
Using a single public origin simplified:
•	frontend/backend communication
•	GitHub OAuth redirects
•	production URL configuration
•	authentication cookie handling
•	CORS considerations



Security Notes
The following sensitive information is intentionally excluded from this repository and README:
•	GitHub OAuth Client Secret
•	JWT secret
•	Session secret
•	Personal Access Tokens
•	real JWT values
•	local .env files
Secrets are supplied through environment variables.
The .gitignore file excludes local secret files and generated dependencies.











Summary
AI Capsule demonstrates:
•	React frontend
•	Express REST API
•	SQLite database integration
•	Complete CRUD operations
•	GitHub OAuth authentication
•	Express-issued application JWT
•	Secure and HttpOnly authentication cookie
•	Server-side JWT verification
•	Per-user record ownership
•	Protected API routes
•	Public health endpoint
•	Screenshot upload support
•	Real public cloud deployment on Render
Public application:
https://ai-capsule-1-jwav.onrender.com



























