FROM node
RUN apt-get update
RUN apt-get install transmission-cli -y
WORKDIR /usr/src/app/
ENV TZ=America/Chicago
COPY . .
RUN npm install
EXPOSE 8663
CMD ["node","index.js"]
