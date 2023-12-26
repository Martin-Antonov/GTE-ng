FROM node:20.6.0
RUN npm install -g @angular/cli
COPY . /frontend
WORKDIR /frontend
RUN npm install
ENV NODE_OPTIONS=--openssl-legacy-provider
CMD ng serve --host 0.0.0.0 --disable-host-check
