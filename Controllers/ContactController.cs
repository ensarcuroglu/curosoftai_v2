using Microsoft.AspNetCore.Mvc;

namespace curosoftai_v2.Controllers
{
    public class ContactController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
