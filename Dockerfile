FROM alpine:latest

RUN apk add --no-cache ca-certificates unzip wget

# Descargar PocketBase
RUN wget https://github.com/pocketbase/pocketbase/releases/download/v0.22.9/pocketbase_0.22.9_linux_amd64.zip
RUN unzip pocketbase_0.22.9_linux_amd64.zip
RUN chmod +x pocketbase

# Crear directorios
RUN mkdir -p /app/pb_data
RUN mkdir -p /app/pb_public

# Copiar archivos (la ruta es importante)
COPY ./pb_public /app/pb_public
COPY ./pb_data /app/pb_data

WORKDIR /app

EXPOSE 8080

CMD ["./pocketbase", "serve", "--http=0.0.0.0:8080"]
