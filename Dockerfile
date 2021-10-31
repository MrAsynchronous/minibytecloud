FROM node:latest
  
WORKDIR /usr/minibytescloud

# install deps
COPY package.json /usr/minibytescloud
RUN npm install

# Setup workdir
COPY . .

# run
EXPOSE 3000
CMD ["npm", "start"]