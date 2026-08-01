using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using TradingCardEventCalendar.Api.Data;
using TradingCardEventCalendar.Api.Models;
using TradingCardEventCalendar.Api.Services;

namespace TradingCardEventCalendar.Api.Tests;

public sealed class TestDbContextFactory : IDisposable
{
    private readonly string _connectionString;
    private readonly SqliteConnection _keepAlive;

    public TestDbContextFactory()
    {
        _connectionString = $"Data Source=TestDb_{Guid.NewGuid():N};Mode=Memory;Cache=Shared";
        _keepAlive = new SqliteConnection(_connectionString);
        _keepAlive.Open();

        using var db = CreateContext();
        db.Database.EnsureCreated();
    }

    public AppDbContext CreateContext()
    {
        var connection = new SqliteConnection(_connectionString);
        connection.Open();
        return new AppDbContext(new DbContextOptionsBuilder<AppDbContext>()
            .UseSqlite(connection)
            .Options);
    }

    public async Task<Event> SeedEventAsync(
        int playerCapacity = 32,
        Guid? registrationToken = null,
        string name = "Test Event")
    {
        await using var db = CreateContext();

        var evt = new Event
        {
            Name = name,
            GameType = "Magic: The Gathering",
            PlayFormat = "Standard",
            StartDatetime = DateTime.UtcNow.AddDays(7),
            EndDatetime = DateTime.UtcNow.AddDays(7).AddHours(3),
            PlayerCapacity = playerCapacity,
            MinPlayers = 2,
            ShowMinPlayersOnEvent = false,
            RegistrationToken = registrationToken ?? Guid.NewGuid()
        };

        db.Events.Add(evt);
        await db.SaveChangesAsync();
        return evt;
    }

    public async Task SeedRegistrationAsync(int eventId, string playerName)
    {
        await using var db = CreateContext();

        var player = new Player { Name = playerName };
        db.EventRegistrations.Add(new EventRegistration
        {
            EventId = eventId,
            Player = player,
            RegisteredAt = DateTime.UtcNow
        });
        await db.SaveChangesAsync();
    }

    public RegistrationService CreateRegistrationService() =>
        new(CreateContext());

    public TemplateValidationService CreateTemplateValidationService() =>
        new(CreateContext());

    public void Dispose() => _keepAlive.Dispose();
}
