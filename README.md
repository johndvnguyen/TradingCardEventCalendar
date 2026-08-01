# Trading Card Event Calendar

A lightweight event calendar web application for trading card games. Schedule events using game-type templates, share registration QR codes, and let players register online with server-enforced capacity limits.

## Features

- **React + FullCalendar** — month, week, and list views
- **Play format templates** — each game type has formats with their own capacity rules and defaults
- **Schedule events** — name, game type, play format, start/end time, player capacity
- **Registration** — unique link + QR code per event; capacity enforced on the server
- **Calendar invites** — download `.ics` files (Google Calendar, Outlook, Apple Calendar)
- **SQLite + C# API** — ASP.NET Core backend with Entity Framework Core
- **Docker deployment** — single `docker compose up` builds React UI and API

## Play Format Templates

Each **GameType** has one or more **PlayFormat** templates that control:

| Field | Purpose |
|-------|---------|
| `defaultCapacity` | Pre-fills the capacity input when scheduling |
| `minPlayers` | Minimum allowed capacity (enforced client + server) |
| `maxCapacity` | Optional upper cap (`null` = no limit) |
| `defaultDurationHours` | Pre-fills end time from start |
| `showMinPlayersOnEvent` | Shows "Minimum N players" on event pages |

### Seeded formats

**Magic: The Gathering**

| Format | Default cap | Min | Max |
|--------|-------------|-----|-----|
| Standard | 32 | 2 | — |
| Modern | 32 | 2 | — |
| Commander | 16 | 2 | — |
| Draft | 8 | 8 | 24 |

**Pokemon TCG** — Standard, Expanded, Limited (min 2, no max)

**Yu-Gi-Oh!** — Advanced, Traditional, Sealed (min 2; Sealed max 16)

## Quick Start (Docker)

```bash
docker compose up --build
```

Open [http://localhost:8080](http://localhost:8080).

## Local Development

### Backend

Requires [.NET 10 SDK](https://dotnet.microsoft.com/download).

```bash
cd backend/TradingCardEventCalendar.Api
dotnet run
```

### Frontend

Requires Node.js 18+ (20 recommended).

```bash
cd frontend
npm install
npm run dev
```

UI at [http://localhost:5173](http://localhost:5173) proxies `/api` to port 5000.

Production build:

```bash
cd frontend
npm run build
```

## Database reset

The project uses `EnsureCreated()`. After schema changes, delete the database and restart:

```bash
# Local
rm backend/TradingCardEventCalendar.Api/Data/calendar.db

# Docker — remove the volume
docker compose down -v
docker compose up --build
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/gametypes` | Game types with nested play format templates |
| GET | `/api/events` | List events |
| POST | `/api/events` | Create event (template validation) |
| PUT | `/api/events/{id}` | Update event |
| DELETE | `/api/events/{id}` | Delete event |
| GET | `/api/events/public/{token}` | Public event details |
| POST | `/api/events/public/{token}/register` | Register player (409 when full) |

## Project Structure

```
TradingCardEventCalendar/
├── frontend/              # React + Vite + FullCalendar
├── backend/TradingCardEventCalendar.Api/
│   ├── Models/            # GameType, PlayFormat, Event, ...
│   ├── Services/          # TemplateValidationService, RegistrationService
│   └── wwwroot/           # React production build
├── Dockerfile
└── docker-compose.yml
```

TODO:
Core functionality seems to be working was able to test adding events, adding registrations, see QR code and ICS generation
BUG Event Registration page does not update Spots Left value when submitting (display only issue). Manipulating the db directly or opening multiple registration pages correctly rejects registrations, but the displayed count is wrong and awkward
CLEAN UP bloat code
Rethink the templating, I think the prompt actually meant that it should have variable fields based on game type


## Design write-up (~1 page)** answering:
     - How did you determine and enforce how many people can attend an event? Where does capacity live, and what happens under concurrent registrations for the last seat?
     - How does your template system work, and what would adding a 4th game (or a non-card game) require?
     - What did you deliberately cut or fake to stay in the timebox, and what would you build next?
     While not in the requirements some better form of user registration based on email. Its currently validating just based on the name value which is bad. But also theres no requirement so putting off for later iterations

## AI usage note (a few sentences):** which tools you used and for what, and one example of AI output you rejected or had to fix.
I used cursor for most of the code generation with the following initial input. I followed up with some additions to the eventRegistration and QR code features I missed. I also used AI to do some troubleshooting with my docker and wsl installation as my personal machine did not have these

Removed:
-The entire PlayerController as the only interaction with the players is on registration. Theres no player maniuplation outside the context of an event
-getEvent frontend endpoint
-An Extra tsconfig.app.json was created and is unused
-EventPageUrl was not really being used as event pages are not needed just registration and the calendar itself

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