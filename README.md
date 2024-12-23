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

## SAML Authentication

The application uses SAML 2.0 for authentication with Costco's Identity Provider (IdP). The SAML configuration is flexible and supports multiple ways of providing certificates and metadata.

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

### SAML Configuration Options

The application supports multiple ways to configure SAML, in order of priority:

1. **Metadata File**
   ```env
   SAML_METADATA_FILE=path/to/costco_nonprod_meta.xml
   ```
   - Contains IdP endpoints and certificates
   - Automatically configures entryPoint and cert
   - Can be overridden by environment variables

2. **Environment Variables**
   ```env
   SAML_ENTRY_POINT=https://loginnp.costco.com/idp/SSO.saml2
   SAML_ISSUER=your-app-issuer
   SAML_CERTIFICATE=-----BEGIN CERTIFICATE-----\n...\n-----END CERTIFICATE-----
   SAML_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----
   ```

3. **Auto-generated Certificates**
   - If no certificates are provided, the application will:
     - Generate self-signed certificates
     - Store them in `src/certs` directory
     - Use them for SAML signing/encryption
   - Generated certificates persist across restarts
   - Not recommended for production use

### Environment Setup

#### Development Environment
```env
# Backend (.env)
NODE_ENV=development
FRONTEND_URL=http://localhost:80
BACKEND_URL=http://localhost:3000
JWT_SECRET=your-secret-key-here

# SAML Settings (using metadata file)
SAML_METADATA_FILE=costco_nonprod_meta.xml

# Certificates are auto-generated if not provided
```

#### Production Environment
```env
# Backend (.env)
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain
BACKEND_URL=https://your-backend-domain
JWT_SECRET=your-secure-secret

# SAML Settings
SAML_METADATA_FILE=/path/to/metadata.xml
# Or use environment variables:
SAML_CERTIFICATE=-----BEGIN CERTIFICATE-----\n...\n-----END CERTIFICATE-----
SAML_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----
```

### Certificate Management

The application handles certificates in the following order:

1. **Production**
   - Use environment variables for certificates
   - Or use metadata file with separate private key
   - Never use auto-generated certificates

2. **Development**
   - Can use metadata file for IdP certificate
   - Auto-generates SP certificates if needed
   - Certificates stored in `src/certs` directory

3. **Auto-generation**
   - Creates RSA 4096-bit key pair
   - Generates self-signed certificate
   - Stores in accessible directory
   - Handles Docker volume permissions

### Security Considerations

1. **Certificate Handling**
   - Never commit real certificates to repository
   - Use secure secrets management in production
   - Different certificates for different environments
   - Auto-generated certificates only for development

2. **Configuration Security**
   - Protect metadata files
   - Secure environment variables
   - Use proper file permissions
   - Regular certificate rotation

3. **Development vs Production**
   - Auto-generation only in development
   - Strict certificate requirements in production
   - Proper error handling and logging
   - Environment-specific configurations

## Stopping the Containers

To stop the running containers, use:
```bash
docker-compose down
```

This command will stop and remove the containers, but the data in the PostgreSQL database will be preserved in the `postgres_data` volume.

## Troubleshooting

- If you encounter any issues, ensure that no other services are running on the ports `80`, `3000`, or `5432`.
- Check the logs for any errors:
  ```bash
  docker-compose logs
  ```
- For SAML-specific issues, check the backend logs:
  ```bash
  docker-compose logs backend
  ```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

For any questions or issues, please contact [your-email@example.com](mailto:your-email@example.com).


