using Microsoft.AspNetCore.Mvc;

namespace TinyHouse.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReservationsController : ControllerBase
    {
        [HttpGet]
        public IActionResult GetReservations()
        {
            var reservations = new[] { "Tiny House 1", "Tiny House 2" }; // Örnek veri
            return Ok(reservations);  // Bu satır doğru veri döndürüyor.
        }
    }
}