# Trading Card Event Calendar

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


TODO:
Core functionality seems to be working was able to test adding events, adding registrations
BUG Event Registration page does not update Spots Left value when submitting (display only issue). Manipulating the db directly or opening multiple registration pages correctly rejects registrations, but the displayed count is wrong and awkward
CLEAN UP bloat code
Add ICS generation library

## Design write-up (~1 page)** answering:
     - How did you determine and enforce how many people can attend an event? Where does capacity live, and what happens under concurrent registrations for the last seat?
     - How does your template system work, and what would adding a 4th game (or a non-card game) require?
     - What did you deliberately cut or fake to stay in the timebox, and what would you build next?

## AI usage note (a few sentences):** which tools you used and for what, and one example of AI output you rejected or had to fix.
I used cursor for most of the code generation with the following initial input. I followed up with some additions to the eventRegistration and QR code features I missed. I also used AI to do some troubleshooting with my docker and wsl installation as my personal machine did not have these

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