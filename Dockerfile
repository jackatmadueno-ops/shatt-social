FROM alpine:latest

RUN apk add --no-cache ca-certificates unzip wget

# Descargar PocketBase
RUN wget https://github.com/pocketbase/pocketbase/releases/download/v0.22.9/pocketbase_0.22.9_linux_amd64.zip
RUN unzip pocketbase_0.22.9_linux_amd64.zip
RUN chmod +x pocketbase

# Crear directorios
RUN mkdir -p /pb_data
RUN mkdir -p /pb_public

# Exponer puerto
EXPOSE 8080

# Iniciar PocketBase (usará los datos del volumen)
CMD ["./pocketbase", "serve", "--http=0.0.0.0:8080"]
