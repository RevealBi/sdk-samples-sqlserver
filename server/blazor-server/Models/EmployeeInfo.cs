namespace RevealBlazorServer.Models;

public class EmployeeInfo
{
    public Employee Employee { get; set; } = new();
    public string FullName { get; set; }
}
