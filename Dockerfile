
# Step 1: Use an official Node.js base image
FROM node:24-alpine as builder

# Step 2: Set the working directory inside the container
WORKDIR /app

# Step 3: Copy package.json and package-lock.json for dependency installation
COPY package*.json ./

# Step 4: Install dependencies (npm ci ensures a clean install)
RUN npm ci

# Step 5: Copy the rest of the project files into the container
COPY . .

# Step 6: Build the project
RUN npm run build

# Step 7: Use Nginx as the base image for the production environment
FROM nginx:alpine

LABEL authors="jozala"

# Step 8: Copy the built files from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Step 9: Copy a custom Nginx configuration file if needed
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# Step 10: Expose port 80 to serve the app
EXPOSE 80

# Step 11: Start Nginx when the container runs
CMD ["nginx", "-g", "daemon off;"]
