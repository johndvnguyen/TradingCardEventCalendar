FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY backend/TradingCardEventCalendar.Api/TradingCardEventCalendar.Api.csproj ./TradingCardEventCalendar.Api/
RUN dotnet restore TradingCardEventCalendar.Api/TradingCardEventCalendar.Api.csproj

COPY backend/TradingCardEventCalendar.Api/ ./TradingCardEventCalendar.Api/
RUN dotnet publish TradingCardEventCalendar.Api/TradingCardEventCalendar.Api.csproj \
    -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app

RUN mkdir -p /app/data

COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Docker

EXPOSE 8080

VOLUME ["/app/data"]

ENTRYPOINT ["dotnet", "TradingCardEventCalendar.Api.dll"]
