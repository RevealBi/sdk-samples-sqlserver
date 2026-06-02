using Microsoft.Extensions.Options;
using Reveal.Sdk;
using RevealSdk.Server.Configuration;

namespace RevealSdk.Server.Reveal
{
    public class UserContextProvider : IRVUserContextProvider
    {
        private readonly SqlServerOptions _sqlOptions;

        public UserContextProvider(IOptions<SqlServerOptions> sqlOptions)
        {
            _sqlOptions = sqlOptions.Value;
        }

        IRVUserContext IRVUserContextProvider.GetUserContext(HttpContext aspnetContext)
        {

            // Retrieve the values from the request headers
            string userId = aspnetContext.Request.Headers["x-header-customerId"].FirstOrDefault();
            string orderId = aspnetContext.Request.Headers["x-header-orderId"].FirstOrDefault();
            string employeeId = aspnetContext.Request.Headers["x-header-employeeId"].FirstOrDefault();
            //string tenantId = aspnetContext.Request.Headers["x-header-tenantId"].FirstOrDefault();

            // Initialize role to "User"
            string role = "User";

            // Check the userId and set role to "Admin" if conditions are met
            if (userId == "AROUT" || userId == "BLONP" || userId == null)
            {
                role = "Admin";
            }

            var props = new Dictionary<string, object>() {
                    { "OrderId", orderId },
                    { "EmployeeId", employeeId },
                    { "Role", role },
                    { "Host", _sqlOptions.Host },
                    { "Database", _sqlOptions.Database },
                    { "Username", _sqlOptions.Username },
                    { "Password", _sqlOptions.Password },
                    { "Schema", _sqlOptions.Schema } };

            Console.WriteLine("UserContextProvider: " + userId + " " + orderId + " " + employeeId);
            
            return new RVUserContext(userId, props);
        }
    }
}
