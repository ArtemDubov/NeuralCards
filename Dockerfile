FROM node:18

WORKDIR /app

# Копируем package.json отдельно для кэширования
COPY package*.json ./
RUN npm install

# Копируем Prisma схему и генерируем клиент
COPY prisma ./prisma
RUN npx prisma generate

# Копируем остальные файлы
COPY . .

EXPOSE 5001

CMD ["npm", "run", "dev"]