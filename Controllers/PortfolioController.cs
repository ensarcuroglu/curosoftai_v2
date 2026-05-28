using Microsoft.AspNetCore.Mvc;

namespace curosoftai_v2.Controllers
{
    public class PortfolioController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
