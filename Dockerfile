FROM --platform=$BUILDPLATFORM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY . .
RUN npm run build

FROM nginxinc/nginx-unprivileged:1.27-alpine

ARG VERSION=
ARG REVISION=unknown
ARG BUILD_DATE=

LABEL org.opencontainers.image.title="Aegis Web" \
      org.opencontainers.image.description="Gerador e analisador de senhas que roda inteiro no navegador" \
      org.opencontainers.image.source="https://github.com/ByGustavoo/AegisWeb" \
      org.opencontainers.image.version="${VERSION}" \
      org.opencontainers.image.revision="${REVISION}" \
      org.opencontainers.image.created="${BUILD_DATE}"

ENV AEGIS_VERSION=${VERSION} \
    AEGIS_RELEASE_DATE=${BUILD_DATE}

COPY docker/seguranca.conf /etc/nginx/snippets/aegis-seguranca.conf
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --chmod=755 docker/40-aegis-config.sh /docker-entrypoint.d/40-aegis-config.sh
COPY --from=build --chown=101:101 /app/dist /usr/share/nginx/html

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q --spider http://127.0.0.1:8080/healthz || exit 1
