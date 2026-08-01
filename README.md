# Trading Card Event Calendar

AI Input:
AI input:
Create a small calendar web application that uses a docker container for local deployment. The calendar will have an option to schedule events, view events. The backend will use a sqlite db. The backend code should use c#.
the basic entities are Entities:
Event 
- id int
- name text
- gameType text
- startDatetime datetime
- playerCapacity int

Player
- id int
- name text

GameType
- id int
- name text
- playFormats text
- maxCapacity int
- minPlayers int

A lightweight event calendar web application for trading card games. Schedule and view events for Magic: The Gathering, Pokemon TCG, Yu-Gi-Oh!, and other games.

## Features

- **Calendar view** — month, week, and list views powered by FullCalendar
- **Schedule events** — create events with name, game type, start time, and player capacity
- **View & edit events** — click an event to see details or edit/delete it
- **SQLite persistence** — data stored locally in a SQLite database
- **Docker deployment** — run everything with a single `docker compose up`

## Entities

| Entity | Fields |
|--------|--------|
| **Event** | id, name, gameType, startDatetime, playerCapacity |
| **Player** | id, name |
| **GameType** | id, name, playFormats, maxCapacity, minPlayers |

Three game types are seeded on first run: Magic: The Gathering, Pokemon TCG, and Yu-Gi-Oh!.

## Quick Start (Docker)

**Prerequisites:** [Docker Desktop](https://www.docker.com/products/docker-desktop/)

```bash
docker compose up --build
```

Open [http://localhost:8080](http://localhost:8080) in your browser.

The SQLite database is persisted in a Docker volume (`calendar-data`).

To stop:

```bash
docker compose down
```

## Local Development (without Docker)

**Prerequisites:** [.NET 10 SDK](https://dotnet.microsoft.com/download)

```bash
cd backend/TradingCardEventCalendar.Api
dotnet run
```

Open [http://localhost:5000](http://localhost:5000).

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/events` | List events (optional `?start=` and `?end=` filters) |
| GET | `/api/events/{id}` | Get a single event |
| POST | `/api/events` | Create an event |
| PUT | `/api/events/{id}` | Update an event |
| DELETE | `/api/events/{id}` | Delete an event |
| GET | `/api/gametypes` | List game types |
| GET | `/api/players` | List players |
| POST | `/api/players` | Create a player |

## Project Structure

```
TradingCardEventCalendar/
├── backend/TradingCardEventCalendar.Api/
│   ├── Controllers/       # REST API controllers
│   ├── Data/              # EF Core DbContext
│   ├── Models/            # Entity models
│   └── wwwroot/           # Calendar frontend (HTML/CSS/JS)
├── Dockerfile
├── docker-compose.yml
└── TradingCardEventCalendar.sln
```
