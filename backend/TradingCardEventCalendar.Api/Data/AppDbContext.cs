using Microsoft.EntityFrameworkCore;
using TradingCardEventCalendar.Api.Models;

namespace TradingCardEventCalendar.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Event> Events => Set<Event>();
    public DbSet<Player> Players => Set<Player>();
    public DbSet<GameType> GameTypes => Set<GameType>();
    public DbSet<PlayFormat> PlayFormats => Set<PlayFormat>();
    public DbSet<EventRegistration> EventRegistrations => Set<EventRegistration>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Event>(entity =>
        {
            entity.Property(e => e.Name).HasMaxLength(200);
            entity.Property(e => e.GameType).HasMaxLength(100);
            entity.Property(e => e.PlayFormat).HasMaxLength(100);
            entity.HasIndex(e => e.RegistrationToken).IsUnique();
        });

        modelBuilder.Entity<Player>(entity =>
        {
            entity.Property(p => p.Name).HasMaxLength(100);
        });

        modelBuilder.Entity<GameType>(entity =>
        {
            entity.Property(g => g.Name).HasMaxLength(100);
        });

        modelBuilder.Entity<PlayFormat>(entity =>
        {
            entity.Property(p => p.Name).HasMaxLength(100);
            entity.HasOne(p => p.GameType)
                .WithMany(g => g.PlayFormats)
                .HasForeignKey(p => p.GameTypeId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<EventRegistration>(entity =>
        {
            entity.HasOne(r => r.Event)
                .WithMany(e => e.Registrations)
                .HasForeignKey(r => r.EventId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(r => r.Player)
                .WithMany(p => p.Registrations)
                .HasForeignKey(r => r.PlayerId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(r => new { r.EventId, r.PlayerId }).IsUnique();
        });

        modelBuilder.Entity<GameType>().HasData(
            new GameType { Id = 1, Name = "Magic: The Gathering" },
            new GameType { Id = 2, Name = "Pokemon TCG" },
            new GameType { Id = 3, Name = "Yu-Gi-Oh!" }
        );

        modelBuilder.Entity<PlayFormat>().HasData(
            new PlayFormat
            {
                Id = 1, GameTypeId = 1, Name = "Standard",
                DefaultCapacity = 32, MinPlayers = 2, MaxCapacity = null,
                DefaultDurationHours = 3, ShowMinPlayersOnEvent = false
            },
            new PlayFormat
            {
                Id = 2, GameTypeId = 1, Name = "Modern",
                DefaultCapacity = 32, MinPlayers = 2, MaxCapacity = null,
                DefaultDurationHours = 3, ShowMinPlayersOnEvent = false
            },
            new PlayFormat
            {
                Id = 3, GameTypeId = 1, Name = "Commander",
                DefaultCapacity = 16, MinPlayers = 2, MaxCapacity = null,
                DefaultDurationHours = 3, ShowMinPlayersOnEvent = false
            },
            new PlayFormat
            {
                Id = 4, GameTypeId = 1, Name = "Draft",
                DefaultCapacity = 8, MinPlayers = 8, MaxCapacity = 24,
                DefaultDurationHours = 3, ShowMinPlayersOnEvent = true
            },
            new PlayFormat
            {
                Id = 5, GameTypeId = 2, Name = "Standard",
                DefaultCapacity = 24, MinPlayers = 2, MaxCapacity = null,
                DefaultDurationHours = 3, ShowMinPlayersOnEvent = false
            },
            new PlayFormat
            {
                Id = 6, GameTypeId = 2, Name = "Expanded",
                DefaultCapacity = 24, MinPlayers = 2, MaxCapacity = null,
                DefaultDurationHours = 3, ShowMinPlayersOnEvent = false
            },
            new PlayFormat
            {
                Id = 7, GameTypeId = 2, Name = "Limited",
                DefaultCapacity = 16, MinPlayers = 2, MaxCapacity = null,
                DefaultDurationHours = 3, ShowMinPlayersOnEvent = false
            },
            new PlayFormat
            {
                Id = 8, GameTypeId = 3, Name = "Advanced",
                DefaultCapacity = 16, MinPlayers = 2, MaxCapacity = null,
                DefaultDurationHours = 3, ShowMinPlayersOnEvent = false
            },
            new PlayFormat
            {
                Id = 9, GameTypeId = 3, Name = "Traditional",
                DefaultCapacity = 16, MinPlayers = 2, MaxCapacity = null,
                DefaultDurationHours = 3, ShowMinPlayersOnEvent = false
            },
            new PlayFormat
            {
                Id = 10, GameTypeId = 3, Name = "Sealed",
                DefaultCapacity = 8, MinPlayers = 2, MaxCapacity = 16,
                DefaultDurationHours = 3, ShowMinPlayersOnEvent = false
            }
        );
    }
}
