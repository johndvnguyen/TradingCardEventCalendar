using TradingCardEventCalendar.Api.Models;
using TradingCardEventCalendar.Api.Services;

namespace TradingCardEventCalendar.Api.Tests;

public class TemplateValidationServiceTests : IDisposable
{
    private readonly TestDbContextFactory _factory = new();

    public void Dispose() => _factory.Dispose();

    [Fact]
    public async Task ApplyTemplateAsync_ValidStandard_Succeeds()
    {
        var service = _factory.CreateTemplateValidationService();
        var evt = CreateEvent("Magic: The Gathering", "Standard", playerCapacity: 30);

        var (success, error) = await service.ApplyTemplateAsync(evt);

        Assert.True(success);
        Assert.Null(error);
        Assert.Equal(2, evt.MinPlayers);
        Assert.False(evt.ShowMinPlayersOnEvent);
    }

    [Fact]
    public async Task ApplyTemplateAsync_UnknownFormat_Fails()
    {
        var service = _factory.CreateTemplateValidationService();
        var evt = CreateEvent("Not A Game", "Not A Format", playerCapacity: 8);

        var (success, error) = await service.ApplyTemplateAsync(evt);

        Assert.False(success);
        Assert.Contains("Unknown game type and format", error);
    }

    [Fact]
    public async Task ApplyTemplateAsync_BelowMinPlayers_Fails()
    {
        var service = _factory.CreateTemplateValidationService();
        var evt = CreateEvent("Magic: The Gathering", "Draft", playerCapacity: 4);

        var (success, error) = await service.ApplyTemplateAsync(evt);

        Assert.False(success);
        Assert.Contains("requires at least 8 players", error);
    }

    [Fact]
    public async Task ApplyTemplateAsync_AboveMaxCapacity_Fails()
    {
        var service = _factory.CreateTemplateValidationService();
        var evt = CreateEvent("Magic: The Gathering", "Draft", playerCapacity: 30);

        var (success, error) = await service.ApplyTemplateAsync(evt);

        Assert.False(success);
        Assert.Contains("allows at most 24 players", error);
    }

    [Fact]
    public async Task ApplyTemplateAsync_Draft_ShowsMinOnEvent()
    {
        var service = _factory.CreateTemplateValidationService();
        var evt = CreateEvent("Magic: The Gathering", "Draft", playerCapacity: 8);

        var (success, error) = await service.ApplyTemplateAsync(evt);

        Assert.True(success);
        Assert.Null(error);
        Assert.Equal(8, evt.MinPlayers);
        Assert.True(evt.ShowMinPlayersOnEvent);
    }

    private static Event CreateEvent(string gameType, string playFormat, int playerCapacity) =>
        new()
        {
            Name = "Template Test Event",
            GameType = gameType,
            PlayFormat = playFormat,
            StartDatetime = DateTime.UtcNow.AddDays(1),
            EndDatetime = DateTime.UtcNow.AddDays(1).AddHours(3),
            PlayerCapacity = playerCapacity,
            RegistrationToken = Guid.NewGuid()
        };
}
