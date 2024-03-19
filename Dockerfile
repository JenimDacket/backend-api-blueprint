# Start your image with a node base image
FROM node:20

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and yarn.lock to the working directory
COPY package.json ./
COPY yarn.lock ./

# Set Env variables
ENV NODE_ENV=development

# Install dependencies
RUN yarn install

# Bundle app source by copying the rest of api's source code
COPY . .

# Api listens on port 3000; expose that port in the Docker image
EXPOSE 3000

# Compile TypeScript code -- currently the custom yarn scripts aren't working 
RUN yarn build

# Run compiled TS code
CMD ["yarn", "start"]

