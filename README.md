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
