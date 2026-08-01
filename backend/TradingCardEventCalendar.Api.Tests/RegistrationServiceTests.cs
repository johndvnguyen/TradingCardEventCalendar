using TradingCardEventCalendar.Api.Dto;
using TradingCardEventCalendar.Api.Models;
using TradingCardEventCalendar.Api.Services;

namespace TradingCardEventCalendar.Api.Tests;

public class RegistrationServiceTests : IDisposable
{
    private readonly TestDbContextFactory _factory = new();

    public void Dispose() => _factory.Dispose();

    [Fact]
    public async Task RegisterAsync_EmptyName_ReturnsError()
    {
        var evt = await _factory.SeedEventAsync();
        var service = _factory.CreateRegistrationService();

        var (success, error, response) = await service.RegisterAsync(evt.RegistrationToken, "   ");

        Assert.False(success);
        Assert.Equal("Name is required.", error);
        Assert.Null(response);
    }

    [Fact]
    public async Task RegisterAsync_NameTooLong_ReturnsError()
    {
        var evt = await _factory.SeedEventAsync();
        var service = _factory.CreateRegistrationService();

        var (success, error, response) = await service.RegisterAsync(
            evt.RegistrationToken,
            new string('A', 101));

        Assert.False(success);
        Assert.Equal("Name must be 100 characters or fewer.", error);
        Assert.Null(response);
    }

    [Fact]
    public async Task RegisterAsync_InvalidToken_ReturnsNotFound()
    {
        var service = _factory.CreateRegistrationService();

        var (success, error, response) = await service.RegisterAsync(Guid.NewGuid(), "Player");

        Assert.False(success);
        Assert.Equal("Event not found.", error);
        Assert.Null(response);
    }

    [Fact]
    public async Task RegisterAsync_Success_AddsRegistration()
    {
        var evt = await _factory.SeedEventAsync();
        var service = _factory.CreateRegistrationService();

        var (success, error, response) = await service.RegisterAsync(evt.RegistrationToken, "Alice");

        Assert.True(success);
        Assert.Null(error);
        Assert.NotNull(response);
        Assert.Equal("Alice", response!.PlayerName);

        await using var db = _factory.CreateContext();
        Assert.Equal(1, db.EventRegistrations.Count(r => r.EventId == evt.Id));
    }

    [Fact]
    public async Task RegisterAsync_FullEvent_ReturnsConflictMessage()
    {
        var evt = await _factory.SeedEventAsync(playerCapacity: 1);
        await _factory.SeedRegistrationAsync(evt.Id, "Existing Player");
        var service = _factory.CreateRegistrationService();

        var (success, error, response) = await service.RegisterAsync(evt.RegistrationToken, "New Player");

        Assert.False(success);
        Assert.Equal("This event is full. Registration is closed.", error);
        Assert.Null(response);
    }

    [Fact]
    public async Task RegisterAsync_DuplicateName_CaseInsensitive()
    {
        var evt = await _factory.SeedEventAsync();
        var service = _factory.CreateRegistrationService();

        await service.RegisterAsync(evt.RegistrationToken, "Alice");
        var (success, error, response) = await service.RegisterAsync(evt.RegistrationToken, "alice");

        Assert.False(success);
        Assert.Equal("This name is already registered for this event.", error);
        Assert.Null(response);
    }

    [Fact]
    public async Task RegisterAsync_ConcurrentLastSpot_OnlyOneSucceeds()
    {
        var evt = await _factory.SeedEventAsync(playerCapacity: 1);

        var tasks = Enumerable.Range(1, 5).Select(i => Task.Run(async () =>
        {
            try
            {
                var service = _factory.CreateRegistrationService();
                return await service.RegisterAsync(
                    evt.RegistrationToken,
                    Guid.NewGuid().ToString("N")[..8]);
            }
            catch
            {
                return (false, null, null);
            }
        }));

        var results = await Task.WhenAll(tasks);
        var successes = results.Count(r => r.Success);

        Assert.Equal(1, successes);

        await using var db = _factory.CreateContext();
        Assert.Equal(1, db.EventRegistrations.Count(r => r.EventId == evt.Id));
    }

    [Fact]
    public void BuildRegistrationUrl_TrimsTrailingSlash()
    {
        var token = Guid.Parse("00000000-0000-0000-0000-000000000001");

        var url = RegistrationService.BuildRegistrationUrl("http://localhost:5000/", token);

        Assert.Equal("http://localhost:5000/register/00000000-0000-0000-0000-000000000001", url);
    }

    [Fact]
    public void ToDto_ComputesSpotsRemainingAndIsFull()
    {
        var token = Guid.NewGuid();
        var evt = new Event
        {
            Id = 1,
            Name = "FNM",
            GameType = "Magic: The Gathering",
            PlayFormat = "Standard",
            StartDatetime = DateTime.UtcNow,
            EndDatetime = DateTime.UtcNow.AddHours(3),
            PlayerCapacity = 4,
            MinPlayers = 2,
            ShowMinPlayersOnEvent = false,
            RegistrationToken = token
        };

        var dto = RegistrationService.ToDto(evt, registrationCount: 3, "http://localhost:5000");

        Assert.Equal(1, dto.SpotsRemaining);
        Assert.False(dto.IsFull);
        Assert.Contains(token.ToString("D"), dto.RegistrationUrl);
    }

    [Fact]
    public void ToPublicDto_MarksFullWhenAtCapacity()
    {
        var evt = new Event
        {
            Id = 1,
            Name = "Draft Night",
            GameType = "Magic: The Gathering",
            PlayFormat = "Draft",
            StartDatetime = DateTime.UtcNow,
            EndDatetime = DateTime.UtcNow.AddHours(3),
            PlayerCapacity = 2,
            MinPlayers = 8,
            ShowMinPlayersOnEvent = true,
            RegistrationToken = Guid.NewGuid()
        };

        var dto = RegistrationService.ToPublicDto(evt, registrationCount: 2, "http://localhost:5000");

        Assert.Equal(0, dto.SpotsRemaining);
        Assert.True(dto.IsFull);
    }
}
