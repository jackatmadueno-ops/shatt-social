FROM alpine:latest

RUN apk add --no-cache ca-certificates unzip wget

# Descargar PocketBase versión compatible con Linux
RUN wget https://github.com/pocketbase/pocketbase/releases/download/v0.22.9/pocketbase_0.22.9_linux_amd64.zip
RUN unzip pocketbase_0.22.9_linux_amd64.zip
RUN chmod +x pocketbase

# Crear directorio para datos
RUN mkdir -p /pb_data
RUN mkdir -p /pb_public

# Exponer puerto
EXPOSE 8080

# Iniciar PocketBase en el puerto 8080
CMD ["./pocketbase", "serve", "--http=0.0.0.0:8080", "--dir=/pb_data", "--publicDir=/pb_public"]
