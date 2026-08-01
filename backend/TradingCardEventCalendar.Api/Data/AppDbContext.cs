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
    public DbSet<EventRegistration> EventRegistrations => Set<EventRegistration>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Event>(entity =>
        {
            entity.Property(e => e.Name).HasMaxLength(200);
            entity.Property(e => e.GameType).HasMaxLength(100);
            entity.HasIndex(e => e.RegistrationToken).IsUnique();
        });

        modelBuilder.Entity<Player>(entity =>
        {
            entity.Property(p => p.Name).HasMaxLength(100);
        });

        modelBuilder.Entity<GameType>(entity =>
        {
            entity.Property(g => g.Name).HasMaxLength(100);
            entity.Property(g => g.PlayFormats).HasMaxLength(500);
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
            new GameType
            {
                Id = 1,
                Name = "Magic: The Gathering",
                PlayFormats = "Standard, Modern, Commander, Draft",
                MaxCapacity = 32,
                MinPlayers = 2
            },
            new GameType
            {
                Id = 2,
                Name = "Pokemon TCG",
                PlayFormats = "Standard, Expanded, Limited",
                MaxCapacity = 24,
                MinPlayers = 2
            },
            new GameType
            {
                Id = 3,
                Name = "Yu-Gi-Oh!",
                PlayFormats = "Advanced, Traditional, Sealed",
                MaxCapacity = 16,
                MinPlayers = 2
            }
        );
    }
}
