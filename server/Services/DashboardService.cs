using System.Text.Json;
using Reveal.Sdk;
using Reveal.Sdk.Dom;
using RevealBlazorServer.Models;

public class DashboardService
{
    private readonly string _dashboardPath;
    private readonly string _dataPath;

    public DashboardService(IWebHostEnvironment env)
    {
        _dashboardPath = Path.Combine(env.ContentRootPath, "Dashboards");
        _dataPath = Path.Combine(env.ContentRootPath, "Data");
    }

    public async Task<List<DashboardNames>> GetDashboardNamesAsync()
    {
        try
        {
            var files = Directory.GetFiles(_dashboardPath);
            var fileNames = new List<DashboardNames>();

            foreach (var file in files)
            {
                try
                {
                    var dashboard = new DashboardNames
                    {
                        DashboardFileName = Path.GetFileNameWithoutExtension(file),
                        DashboardTitle = RdashDocument.Load(file).Title
                    };
                    fileNames.Add(dashboard);
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error Reading FileData {file}: {ex.Message}");
                }
            }

            return fileNames;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error Reading Directory: {ex.Message}");
            return new List<DashboardNames>();
        }
    }

    public async Task<List<DashboardNamesWithThumbnail>> GetDashboardNamesWithThumbnailsAsync()
    {
        var dashboardNames = new List<DashboardNamesWithThumbnail>();

        string folderPath = Path.Combine(Directory.GetCurrentDirectory(), "Dashboards");
        var files = Directory.GetFiles(folderPath, "*.rdash"); 

        var tasks = files.Select(async file =>
        {
            try
            {
                var dashboard = new Dashboard(file);
                var thumbnailInfo = await dashboard.GetInfoAsync(Path.GetFileNameWithoutExtension(file).ToString());
                var info = await dashboard.GetInfoAsync(Path.GetFileNameWithoutExtension(file));

                return new DashboardNamesWithThumbnail
                {
                    DashboardFilename = Path.GetFileNameWithoutExtension(file),
                    DashboardTitle = RdashDocument.Load(file).Title,
                    ThumbnailInfo = info.Info
                };
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error Reading FileData {file}: {ex.Message}");
                return null;
            }
        });

        var results = await Task.WhenAll(tasks);
        dashboardNames = results.Where(result => result != null).ToList();

        return dashboardNames;
    }

    public List<VisualizationChartInfo> GetVisualizationChartInfos()
    {
        try
        {
            var allVisualizationChartInfos = new List<VisualizationChartInfo>();
            var dashboardFiles = Directory.GetFiles(_dashboardPath, "*.rdash");

            foreach (var filePath in dashboardFiles)
            {
                try
                {
                    var document = RdashDocument.Load(filePath);
                    foreach (var viz in document.Visualizations)
                    {
                        try
                        {
                            var chartInfo = new VisualizationChartInfo
                            {
                                DashboardFileName = Path.GetFileNameWithoutExtension(filePath),
                                DashboardTitle = document.Title,
                                VizId = viz.Id,
                                VizTitle = viz.Title,
                                VizChartType = viz.ChartType.ToString(),
                            };
                            allVisualizationChartInfos.Add(chartInfo);
                        }
                        catch (Exception vizEx)
                        {
                            Console.WriteLine($"Error processing visualization {viz.Id} in file {filePath}: {vizEx.Message}");
                        }
                    }
                }
                catch (Exception fileEx)
                {
                    Console.WriteLine($"Error processing file {filePath}: {fileEx.Message}");
                }
            }

            return allVisualizationChartInfos;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Visualization extraction error: {ex.Message}");
            throw;
        }
    }

    public async Task<object?> GetDashboardThumbnailInfoAsync(string dashboardName)
    {
        try
        {
            var path = Path.Combine(_dashboardPath, $"{dashboardName}.rdash");

            if (!File.Exists(path))
                return null;

            var dashboard = new Dashboard(path);
            var info = await dashboard.GetInfoAsync(Path.GetFileNameWithoutExtension(path));

            return info;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error loading thumbnail for dashboard '{dashboardName}': {ex.Message}");
            return null;
        }
    }

    public async Task<List<EmployeeInfo>> GetEmployeesAsync()
    {
        try
        {
            var filePath = Path.Combine(_dataPath, "Employees.json");
            if (!File.Exists(filePath))
            {
                Console.WriteLine($"Employees.json not found at {filePath}");
                return new List<EmployeeInfo>();
            }

            using var stream = File.OpenRead(filePath);
            var employees = await JsonSerializer.DeserializeAsync<List<EmployeeInfo>>(stream, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            return employees ?? new List<EmployeeInfo>();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error reading Employees.json: {ex.Message}");
            return new List<EmployeeInfo>();
        }
    }
}