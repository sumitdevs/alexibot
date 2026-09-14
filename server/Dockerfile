FROM postgres:16

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        postgresql-server-dev-16 \
        build-essential \
        git \
        ca-certificates \
    && update-ca-certificates \
    && git clone --branch v0.8.0 --depth 1 \
        https://github.com/pgvector/pgvector.git /tmp/pgvector \
    && cd /tmp/pgvector \
    && make \
    && make install \
    && rm -rf /tmp/pgvector \
    && apt-get purge -y \
        postgresql-server-dev-16 \
        build-essential \
        git \
    && apt-get autoremove -y \
    && rm -rf /var/lib/apt/lists/*