namespace RevealBlazorServer.Models;

public class DashboardNames
{
    public string DashboardFileName { get; set; }
    public string DashboardTitle { get; set; }
}


public class DashboardNamesWithThumbnail
{
    public string Id { get; set; } = Guid.NewGuid().ToString(); 
    public string DashboardFilename { get; set; }
    public string DashboardTitle { get; set; }
    public IDictionary<string, object> ThumbnailInfo { get; set; }
}