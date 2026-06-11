FROM alpine:latest

# Instalar dependencias
RUN apk add --no-cache ca-certificates unzip wget

# Descargar PocketBase
RUN wget https://github.com/pocketbase/pocketbase/releases/download/v0.22.9/pocketbase_0.22.9_linux_amd64.zip
RUN unzip pocketbase_0.22.9_linux_amd64.zip
RUN chmod +x pocketbase

# Copiar TODOS tus archivos
COPY pb_public ./pb_public
COPY pb_data ./pb_data

# Crear directorios necesarios
RUN mkdir -p /pb_data
RUN mkdir -p /pb_public

# Exponer puerto
EXPOSE 8080

# Iniciar PocketBase
CMD ["./pocketbase", "serve", "--http=0.0.0.0:8080", "--dir=/pb_data", "--publicDir=/pb_public"]
