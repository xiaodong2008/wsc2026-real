FROM node:24.1.0-bookworm
ARG NPM_REGISTRY=https://registry.npmjs.org/
RUN npm config set registry "$NPM_REGISTRY"

# npm pinned to the WSC2026 spec
RUN npm install -g npm@11.5.0

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# .env.prod is the deployed configuration; .env is the local one. The platform
# rewrites .env.prod when your repository is created, so bake it into .env here
# — the running container then needs no setup step, and `docker run` on this
# image behaves the same as the deployed service.
RUN if [ -f .env.prod ]; then cp .env.prod .env; fi

# Generate the Prisma client into node_modules at build time
RUN npx prisma generate

COPY docker-entrypoint.sh /usr/local/bin/entrypoint
# Strip any CR before making the entrypoint executable. .gitattributes already
# forces LF on checkout, but that only helps a fresh clone — this keeps a working
# copy that was checked out before it, or copied off a Windows share, from
# producing "env: 'bash\r': No such file or directory" and exit 127.
RUN sed -i 's/\r$//' /usr/local/bin/entrypoint \
    && chmod +x /usr/local/bin/entrypoint

EXPOSE 80
ENTRYPOINT ["entrypoint"]
