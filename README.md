# Costco CRM example

This project consists of a frontend, backend, and a PostgreSQL database, all orchestrated using Docker Compose.

## Prerequisites

- Docker: Make sure you have Docker installed on your machine. You can download it from [here](https://www.docker.com/products/docker-desktop).
- Docker Compose: Docker Compose is included with Docker Desktop for Windows and Mac. For Linux, you can install it separately by following the instructions [here](https://docs.docker.com/compose/install/).

## Getting Started

Follow these steps to get the project up and running:

1. **Clone the Repository**

   Clone this repository to your local machine using:

   ```bash
   git clone https://github.com/yourusername/your-repo.git
   cd your-repo
   ```

2. **Build and Run the Containers**

   Use Docker Compose to build and start the containers:

   ```bash
   docker-compose up --build
   ```

   This command will build the Docker images for the frontend and backend services and start all the services defined in the `docker-compose.yml` file.

3. **Access the Application**

   - **Frontend**: Open your web browser and go to `http://localhost` to access the frontend application.
   - **Backend**: The backend API is accessible at `http://localhost:3000`.
   - **PostgreSQL**: The database is running on port `5432`. You can connect to it using a database client with the following credentials:
     - Host: `localhost`
     - Port: `5432`
     - User: `postgres`
     - Password: `postgres`
     - Database: `mydatabase`

## Stopping the Containers

To stop the running containers, use:

This command will stop and remove the containers, but the data in the PostgreSQL database will be preserved in the `postgres_data` volume.

## Additional Information

- **Environment Variables**: You can modify the environment variables in the `docker-compose.yml` file to suit your needs.
- **Volumes**: The PostgreSQL data is stored in a Docker volume named `postgres_data` to ensure data persistence across container restarts.

## Troubleshooting

- If you encounter any issues, ensure that no other services are running on the ports `80`, `3000`, or `5432`.
- Check the logs for any errors by running:

  ```bash
  docker-compose logs
  ```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

For any questions or issues, please contact [your-email@example.com](mailto:your-email@example.com).

## SAML Authentication Flow

The application uses SAML 2.0 for authentication with Costco's Identity Provider (IdP).

### Authentication Flow
1. User clicks "Login with SSO" on frontend
2. Frontend redirects to backend `/auth/login`
3. Backend creates SAML request containing:
   - Application details (issuer)
   - Callback URL
   - RelayState (return URL)
4. User is redirected to Costco SSO
5. User authenticates at Costco
6. Costco sends SAML response to our callback URL
7. Backend:
   - Validates SAML response
   - Creates JWT token
   - Redirects to frontend with token
8. Frontend:
   - Stores token
   - Redirects to dashboard

### Environment Setup

#### Development Environment
```env
# Backend (.env)
NODE_ENV=development
FRONTEND_URL=http://localhost:80
BACKEND_URL=http://localhost:3000
JWT_SECRET=your-secret-key-here

# SAML Settings
SAML_ENTRY_POINT=https://loginnp.costco.com/idp/SSO.saml2
SAML_ISSUER=your-app-issuer

# Certificates (development uses local files in src/certs/)
# src/certs/idp-certificate.crt
# src/certs/private.key
```

#### Production/Staging Environment
```env
# Backend (.env)
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain
BACKEND_URL=https://your-backend-domain
JWT_SECRET=your-secure-secret

# SAML Settings
SAML_ENTRY_POINT=https://loginnp.costco.com/idp/SSO.saml2
SAML_ISSUER=your-app-issuer

# SAML Certificates (stored as environment variables)
SAML_CERTIFICATE=-----BEGIN CERTIFICATE-----\n...\n-----END CERTIFICATE-----
SAML_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----
```

### Certificate Management
- **Development**: Certificates are stored in `backend/src/certs/`
- **Production**: Certificates should be provided through environment variables or secrets management service
- **Staging**: Similar to production, but with staging-specific certificates

### Security Considerations
1. Never commit real certificates to repository
2. Use secure secret management in production
3. Different certificates for different environments
4. Proper CORS configuration
5. Secure JWT secret management


