Prompt:
I am testing the admin application management module. When I try to approve an application, the system displays "Application has already been reviewed", even though the frontend still shows its status as PENDING. Please check the existing frontend and backend code and identify why this is happening. Fix the issue without changing the existing application workflow.
Output:
Reviewed the application management component and onboarding controller. Updated the application review logic to validate the current database status before processing an approval or rejection. Added debugging logs to identify the application ID, admin ID, requested status, and actual database status.
Prompt:
Please check my existing onboarding controller carefully. I think the issue may be in the application review function. Correct the logic so that an application can only be reviewed once and the account should be created only after successful approval. Also make sure the audit log is recorded correctly.
Output:
Improved the application review controller with conditional status updates, duplicate-review prevention, account creation after approval, and audit log recording within the database transaction.
Prompt:
The frontend is displaying the application details, but some actions are not behaving as expected. Check whether the API endpoint, application ID, request method, and request body match the backend route. Correct the integration while keeping the existing UI design.
Output:
Reviewed the frontend API request and backend route structure. Corrected integration issues where necessary and maintained the existing application management interface.
Prompt:
I noticed that some errors are not clearly displayed to the user. Please improve the error handling in this module so that users receive meaningful messages instead of generic errors. Also handle loading states properly.
Output:
Improved error handling and loading-state management to make application actions easier to understand and troubleshoot.
Prompt:
Please verify that only administrators can access the admin dashboard and application management features. Check the protected routes and backend authorization middleware. Do not rely only on hiding buttons in the frontend.
Output:
Reviewed frontend route protection and backend role-based authorization to ensure that administrative operations require appropriate permissions.
Prompt:
Please check the database operations involved in approving an onboarding application. I want the application status, account creation, and audit log to remain consistent. If an operation fails, avoid leaving partially updated data.
Output:
Reviewed the database transaction used during application approval and improved the handling of related database operations.
Prompt:
The issue is still occurring after deployment. Please help me identify the actual cause using the backend deployment logs. Add useful debugging information where necessary, but do not expose passwords, JWT secrets, or other sensitive data.
Output:
Added targeted debugging logs to the application review process to help identify whether the issue originates from the requested application ID, database status, or conditional update operation.
Prompt:
Please review the modified module once again. Check for syntax errors, incorrect API paths, missing validations, and possible issues with the existing workflow. Make sure the changes do not break other modules.
Output:
Reviewed the modified module and its related frontend and backend integration points. Identified the areas requiring verification before considering the bug fix complete.
Prompt:
While testing user registration, I noticed that invalid details are not always handled properly. Please check the registration controller and validation schema. Make sure the name, email, and password are validated before creating a user. Also prevent duplicate email registrations.
Output:
Reviewed the registration validation and backend logic. Improved input validation and duplicate email handling to prevent invalid user records.
Prompt:
Please check my login module. Verify that the password comparison, JWT generation, and cookie handling are working correctly. If the login credentials are incorrect, display a proper error message without exposing sensitive information.
Output:
Reviewed the authentication flow and improved credential validation, token handling, and error responses.
Prompt:
After logging in, users should be redirected to the correct dashboard based on their role. Currently, I am facing issues with page navigation. Please check the authentication context, protected routes, and admin routes and correct the redirection logic.
Output:
Reviewed the authentication context and route protection logic to improve role-based navigation for customers and administrators.
Prompt:
I want the customer dashboard to display the correct account and application information. Please check how the frontend fetches data from the backend and correct any issues with API responses or state updates. Keep the current design.
Output:
Reviewed dashboard data fetching and state management to improve the display of customer-specific information.
Prompt:
Please check the account onboarding module. A customer should be able to submit an application for a Savings or Current account. Make sure the system prevents duplicate pending applications and handles rejected applications correctly when the customer tries again.
Output:
Improved onboarding validation and application status handling, including duplicate submission prevention and rejected application resubmission logic.
Prompt:
When an administrator approves or rejects an application, the updated status should be reflected correctly in the admin dashboard and customer dashboard. Please check the API response and frontend refresh logic.
Output:
Reviewed application status updates and frontend data refresh behavior to improve consistency between the customer and admin views.
Prompt:
Please review the admin user management module. Check whether the user information is fetched correctly from the database and displayed in the frontend. Also make sure that only authorized administrators can access this information.
Output:
Reviewed the user management API, frontend data fetching, and administrative access restrictions.
Prompt:
I want to maintain a record of important administrative activities in BalanceVault. Please check the audit log implementation and make sure application review actions are recorded with the appropriate user and action details.
Output:
Reviewed the audit logging implementation and its integration with administrative application review operations.
Prompt:
Some API errors are difficult to understand while testing with Postman. Please check the backend controllers and return appropriate HTTP status codes and meaningful error messages for validation failures, unauthorized requests, and missing records.
Output:
Improved API error responses to make backend behavior clearer during frontend integration and API testing.
Prompt:
Before pushing the project to GitHub, please check whether sensitive configuration values are exposed in the source code. Make sure database credentials, JWT secrets, and email credentials are stored in environment variables and that the .env file is excluded from Git.
Output:
Reviewed environment variable usage and Git ignore configuration to help prevent sensitive credentials from being committed to the repository.
Prompt:
I am facing issues connecting the backend to PostgreSQL. Please check the Prisma database configuration and connection settings. Help me identify whether the problem is related to the database URL, environment variables, or database connectivity.
Output:
Reviewed Prisma configuration and database connection settings to troubleshoot PostgreSQL connectivity.
Prompt:
The application works locally, but I need to make sure it runs correctly after deployment. Please check the frontend API URL, backend environment variables, CORS configuration, and production cookie settings for Vercel and Render.
Output:
Reviewed production configuration and frontend-backend integration settings for deployment.
Prompt:
When I refresh the browser, I want the application to maintain the user's login state if the session is still valid. Please check the authentication context and user-loading logic and fix any issues without weakening authentication security.
Output:
Reviewed authentication initialization and user-loading behavior to improve session handling during page refreshes.
Prompt:
Please review the existing BalanceVault project structure. Check whether the controllers, routes, middleware, services, and frontend components are organized properly. Suggest and make necessary improvements without unnecessarily changing working code.
Output:
Reviewed the project organization and improved code consistency while preserving the existing application architecture.
