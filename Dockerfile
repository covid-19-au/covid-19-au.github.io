# Get the latest node LTS release
FROM node:14
WORKDIR /src/

# Copy install info to root dir
COPY package*.json ./
RUN npm install

# Run the server on port 3008
EXPOSE 3008
CMD npm start
