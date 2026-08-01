# Trading Card Event Calendar

A lightweight event calendar web application for trading card games. Schedule events, share registration QR codes, and let players register online with server-enforced capacity limits.

## Features

- **React + FullCalendar** — month, week, and list views
- **Schedule events** — name, game type, start/end time, player capacity
- **Registration** — unique link + QR code per event; capacity enforced on the server
- **Calendar invites** — download `.ics` files via `react-icalendar-link` (Google Calendar, Outlook, Apple Calendar)
- **SQLite + C# API** — ASP.NET Core backend with Entity Framework Core
- **Docker deployment** — single `docker compose up` builds React UI and API

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

API runs at [http://localhost:5000](http://localhost:5000).

### Frontend

Requires Node.js 18+ (20 recommended).

```bash
cd frontend
npm install
npm run dev
```

UI runs at [http://localhost:5173](http://localhost:5173) and proxies `/api` to the backend.

Production build output goes to `backend/TradingCardEventCalendar.Api/wwwroot`:

```bash
cd frontend
npm run build
```

Then run the backend to serve the built React app.

## Routes

| Route | Description |
|-------|-------------|
| `/` | Calendar home |
| `/event/:token` | Event page with QR code and calendar invite |
| `/register/:token` | Player registration form |

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/events` | List events |
| POST | `/api/events` | Create event |
| PUT | `/api/events/{id}` | Update event |
| DELETE | `/api/events/{id}` | Delete event |
| GET | `/api/events/public/{token}` | Public event details |
| POST | `/api/events/public/{token}/register` | Register player (409 when full) |
| GET | `/api/gametypes` | List game types |

## Project Structure

```
TradingCardEventCalendar/
├── frontend/              # React + Vite + FullCalendar + react-icalendar-link
├── backend/TradingCardEventCalendar.Api/
│   ├── Controllers/
│   ├── Data/
│   ├── Models/
│   ├── Services/
│   └── wwwroot/           # React production build output
├── Dockerfile
└── docker-compose.yml
```

## Schema changes

If upgrading from an older database, delete `backend/TradingCardEventCalendar.Api/Data/calendar.db` and restart so EF Core can recreate the schema (includes `EndDatetime`, `RegistrationToken`, and `EventRegistrations`).

TODO:
Core functionality seems to be working was able to test adding events, adding registrations
BUG Event Registration page does not update Spots Left value when submitting (display only issue). Manipulating the db directly or opening multiple registration pages correctly rejects registrations, but the displayed count is wrong and awkward
CLEAN UP bloat code
Rethink the templating, I think the prompt actually meant that it should have variable fields based on game type
Ensure ICS for registration only shows after the player is registered

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