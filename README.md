# URL SHORTENER REDIRECTION

## Description  
This server handles redirecting users to the original long URL. It includes a caching layer using Redis, where the long URL is stored on the first request and cached for 24 hours. If the URL is not found in the Redis cache, it is retrieved from DynamoDB.

---

## Prerequisites to Start the Server  
1. Ensure Docker is installed.  
2. Run the Redpanda Docker Compose file from the **Url-Shortener-Core** repository to start a Kafka server in cluster mode.  
3. Start a Redis server in cluster mode.  
4. Update the environment variables accordingly.

---

## Steps to Install  
1. Clone the repository.  
2. Navigate to the `Url-Shortener-Core` directory:  
   ```bash
   cd Url-Shortener-Core
   npm install
   npm run build
   npm start
   ```
