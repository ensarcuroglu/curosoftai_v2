using Microsoft.AspNetCore.Mvc;

namespace curosoftai_v2.Controllers
{
    public class ProjectController : Controller
    {
        public IActionResult Index()
        {
            ViewData["BodyClass"] = "projects-page";
            return View();
        }
    }
}
