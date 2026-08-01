using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TradingCardEventCalendar.Api.Data;
using TradingCardEventCalendar.Api.Dto;
using TradingCardEventCalendar.Api.Models;
using TradingCardEventCalendar.Api.Services;

namespace TradingCardEventCalendar.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EventsController : ControllerBase
{
    private readonly AppDbContext _db;

    public EventsController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<EventDto>>> GetAll(
        [FromQuery] DateTime? start,
        [FromQuery] DateTime? end)
    {
        var query = _db.Events.AsQueryable();

        if (start.HasValue)
            query = query.Where(e => e.StartDatetime >= start.Value);

        if (end.HasValue)
            query = query.Where(e => e.StartDatetime <= end.Value);

        var events = await query.OrderBy(e => e.StartDatetime).ToListAsync();
        var counts = await GetRegistrationCountsAsync(events.Select(e => e.Id));

        var baseUrl = GetBaseUrl();
        return events
            .Select(e => RegistrationService.ToDto(e, counts.GetValueOrDefault(e.Id, 0), baseUrl))
            .ToList();
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<EventDto>> GetById(int id)
    {
        var evt = await _db.Events.FindAsync(id);
        if (evt is null)
            return NotFound();

        var count = await _db.EventRegistrations.CountAsync(r => r.EventId == id);
        return RegistrationService.ToDto(evt, count, GetBaseUrl());
    }

    [HttpPost]
    public async Task<ActionResult<EventDto>> Create(Event evt)
    {
        evt.RegistrationToken = Guid.NewGuid();
        _db.Events.Add(evt);
        await _db.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetById),
            new { id = evt.Id },
            RegistrationService.ToDto(evt, 0, GetBaseUrl()));
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, Event evt)
    {
        if (id != evt.Id)
            return BadRequest();

        var existing = await _db.Events.FindAsync(id);
        if (existing is null)
            return NotFound();

        var registrationCount = await _db.EventRegistrations.CountAsync(r => r.EventId == id);
        if (evt.PlayerCapacity < registrationCount)
        {
            return BadRequest(new ErrorResponse(
                $"Capacity cannot be set below current registrations ({registrationCount})."));
        }

        existing.Name = evt.Name;
        existing.GameType = evt.GameType;
        existing.StartDatetime = evt.StartDatetime;
        existing.PlayerCapacity = evt.PlayerCapacity;

        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var evt = await _db.Events.FindAsync(id);
        if (evt is null)
            return NotFound();

        _db.Events.Remove(evt);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    private string GetBaseUrl() =>
        $"{Request.Scheme}://{Request.Host}";

    private async Task<Dictionary<int, int>> GetRegistrationCountsAsync(IEnumerable<int> eventIds)
    {
        var ids = eventIds.ToList();
        if (ids.Count == 0)
            return [];

        return await _db.EventRegistrations
            .Where(r => ids.Contains(r.EventId))
            .GroupBy(r => r.EventId)
            .Select(g => new { EventId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.EventId, x => x.Count);
    }
}
