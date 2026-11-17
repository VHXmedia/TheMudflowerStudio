FROM node:20-alpine
RUN apk add --no-cache git
WORKDIR /app
COPY . .
ENV NODE_ENV=production HOST=0.0.0.0 PORT=3000
EXPOSE 3000
CMD ["node","server.js"]
