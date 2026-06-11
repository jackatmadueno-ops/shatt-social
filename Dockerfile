FROM alpine:latest

RUN apk add --no-cache ca-certificates unzip wget

# Descargar PocketBase
RUN wget https://github.com/pocketbase/pocketbase/releases/download/v0.22.9/pocketbase_0.22.9_linux_amd64.zip
RUN unzip pocketbase_0.22.9_linux_amd64.zip
RUN chmod +x pocketbase

# Copiar TODOS los archivos HTML a la raíz del servidor
COPY *.html ./

# Crear directorio para datos
RUN mkdir -p /pb_data

EXPOSE 8090

CMD ["./pocketbase", "serve", "--http=0.0.0.0:8090"]
