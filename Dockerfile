FROM node:22-slim

WORKDIR /app

RUN apt-get update && \
    apt-get install -y python3 make g++ && \
    rm -rf /var/lib/apt/lists/*

RUN corepack enable && corepack prepare pnpm@10.29.2 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY server/package.json ./server/
COPY client/package.json ./client/

COPY . .

RUN pnpm install --frozen-lockfile
RUN pnpm rebuild sqlite3

RUN pnpm build

EXPOSE 3000

ENV DATA_DIR=/data

CMD ["pnpm", "--filter", "server", "start"]
