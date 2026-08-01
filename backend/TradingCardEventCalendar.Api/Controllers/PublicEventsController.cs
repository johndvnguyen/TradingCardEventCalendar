using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TradingCardEventCalendar.Api.Data;
using TradingCardEventCalendar.Api.Dto;
using TradingCardEventCalendar.Api.Services;

namespace TradingCardEventCalendar.Api.Controllers;

[ApiController]
[Route("api/events/public")]
public class PublicEventsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly RegistrationService _registrationService;

    public PublicEventsController(AppDbContext db, RegistrationService registrationService)
    {
        _db = db;
        _registrationService = registrationService;
    }

    [HttpGet("{token:guid}")]
    public async Task<ActionResult<EventPublicDto>> GetByToken(Guid token)
    {
        var evt = await _db.Events
            .FirstOrDefaultAsync(e => e.RegistrationToken == token);

        if (evt is null)
            return NotFound(new ErrorResponse("Event not found."));

        var count = await _db.EventRegistrations.CountAsync(r => r.EventId == evt.Id);
        return RegistrationService.ToPublicDto(evt, count, GetBaseUrl());
    }

    [HttpPost("{token:guid}/register")]
    public async Task<ActionResult<RegisterResponse>> Register(Guid token, RegisterRequest request)
    {
        var (success, errorMessage, response) =
            await _registrationService.RegisterAsync(token, request.Name);

        if (!success)
        {
            var isFull = errorMessage == "This event is full. Registration is closed.";
            return isFull
                ? Conflict(new ErrorResponse(errorMessage!))
                : BadRequest(new ErrorResponse(errorMessage!));
        }

        return Ok(response);
    }

    private string GetBaseUrl() =>
        $"{Request.Scheme}://{Request.Host}";
}
