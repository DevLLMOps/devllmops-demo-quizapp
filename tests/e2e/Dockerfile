# OCPA-R1: Fixed version
FROM mcr.microsoft.com/playwright:v1.50.1-noble

WORKDIR /tests

COPY package.json package-lock.json ./
RUN npm ci

COPY playwright.config.js ./
COPY *.spec.js ./

CMD ["npx", "playwright", "test"]
