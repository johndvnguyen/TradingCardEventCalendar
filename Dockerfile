FROM node:20-alpine AS frontend
WORKDIR /src/frontend
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm install
COPY frontend/ ./
RUN npm run build

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS backend
WORKDIR /src

COPY backend/TradingCardEventCalendar.Api/TradingCardEventCalendar.Api.csproj ./TradingCardEventCalendar.Api/
RUN dotnet restore TradingCardEventCalendar.Api/TradingCardEventCalendar.Api.csproj

COPY backend/TradingCardEventCalendar.Api/ ./TradingCardEventCalendar.Api/
COPY --from=frontend /src/backend/TradingCardEventCalendar.Api/wwwroot ./TradingCardEventCalendar.Api/wwwroot/
RUN dotnet publish TradingCardEventCalendar.Api/TradingCardEventCalendar.Api.csproj \
    -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app

RUN mkdir -p /app/data

COPY --from=backend /app/publish .

ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Docker

EXPOSE 8080

VOLUME ["/app/data"]

ENTRYPOINT ["dotnet", "TradingCardEventCalendar.Api.dll"]
