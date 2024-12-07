FROM node:20-alpine

# Create app directory
RUN mkdir -p /usr/src
WORKDIR /usr/src

# Install app dependencies
COPY package.json /usr/src/
COPY package-lock.json /usr/src/
RUN npm install

# Bundle app source
COPY . /usr/src

# note that this doesn't actually publish the port to the host machine; it's more of an informational guideline.
EXPOSE 7172

CMD ["npm", "start"]