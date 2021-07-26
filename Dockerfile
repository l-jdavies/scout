FROM node:15.1.0

LABEL version="1.0"
LABEL description="Docker base image for scout daemon"

WORKDIR /app 

COPY ["package.json", "package-lock.json", "./"]

RUN npm install

COPY . .

EXPOSE 3030

CMD ["npm", "start"]