namespace RevealBlazorServer.Models;

public class VisualizationChartInfo
{
    public string DashboardFileName { get; set; }
    public string DashboardTitle { get; set; }
    public string VizId { get; set; }
    public string VizTitle { get; set; }
    public string VizChartType { get; set; }
    public string Id { get; set; } = Guid.NewGuid().ToString(); 
}

public class VizInfo
{
    public string VizId { get; set; }
    public string DashboardTitle { get; set; }
    public string VizName { get; set; }
    public string DashboardName { get; set; }
    public bool Selected { get; set; } = false; 
}