FROM node:16.14 AS builder
RUN npm install --global pnpm
WORKDIR /app
COPY package.json .
COPY pnpm-lock.yaml .
COPY postcss.config.js .
COPY rome.json .
COPY tailwind.config.js .
COPY tsconfig.json .
COPY next.config.mjs .
COPY .env .env 
COPY contentlayer.config.js .
COPY mdx-components.tsx .
COPY global.css .
COPY next-env.d.ts .
COPY global.css .
RUN pnpm install
COPY app ./app
COPY content ./content
COPY pages ./pages/
COPY types ./types
COPY util ./util
CMD ["pnpm", "run", "dev"]
