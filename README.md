# 1. Pare tudo
docker-compose down -v

# 2. Suba o banco primeiro
docker-compose up db -d

# 3. Verifique se o MySQL está rodando
docker ps

# 4. Conecte dentro do container do app
docker-compose exec app ping db

# Executar o codigo por completo
docker-compose up --build

