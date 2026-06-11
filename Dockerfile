FROM alpine:latest

RUN apk add --no-cache ca-certificates unzip wget

RUN wget https://github.com/pocketbase/pocketbase/releases/download/v0.22.9/pocketbase_0.22.9_linux_amd64.zip
RUN unzip pocketbase_0.22.9_linux_amd64.zip
RUN chmod +x pocketbase

# Copiar todos los archivos
COPY . .

EXPOSE 8090

# 🔧 La corrección está aquí:
CMD ["./pocketbase", "serve", "--http=0.0.0.0:8090", "--publicDir=."]
