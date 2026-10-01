#!/bin/sh
set -eu

escapar() {
  printf '%s' "$1" | sed -e 's/[\\"]/\&/g'
}

versao=$(escapar "${AEGIS_VERSION:-}")
data_lancamento=$(escapar "${AEGIS_RELEASE_DATE:-}")

printf 'window.__AEGIS_CONFIG__ = { versao: "%s", dataLancamento: "%s" };\n' \
  "$versao" "$data_lancamento" \
  > /usr/share/nginx/html/config.js

echo "Aegis: config.js gerado (versão ${AEGIS_VERSION:-sem versão})"
