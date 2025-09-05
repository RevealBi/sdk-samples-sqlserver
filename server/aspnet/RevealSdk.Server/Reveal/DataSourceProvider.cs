﻿using Reveal.Sdk;
using Reveal.Sdk.Data;
using Reveal.Sdk.Data.Microsoft.SqlServer;

namespace RevealSdk.Server.Reveal
{
    internal class DataSourceProvider : IRVDataSourceProvider
    {
        public Task<RVDashboardDataSource> ChangeDataSourceAsync(IRVUserContext userContext, RVDashboardDataSource dataSource)
        {
            if (dataSource is RVSqlServerDataSource SqlDs)
            {
                SqlDs.Host = (string)userContext.Properties["Host"];
                SqlDs.Database = (string)userContext.Properties["Database"];
            }
            return Task.FromResult(dataSource);
        }

        public Task<RVDataSourceItem>? ChangeDataSourceItemAsync(IRVUserContext userContext, string dashboardId, RVDataSourceItem dataSourceItem)
        {
            // ****
            // Every request for data passes thru changeDataSourceItem
            // You can set query properties based on the incoming requests
            // for example, you can check:
            // - dsi.id
            // - dsi.table
            // - dsi.procedure
            // - dsi.title
            // and take a specific action on the dsi as this request is processed
            // ****

            if (dataSourceItem is not RVSqlServerDataSourceItem sqlDsi) return Task.FromResult(dataSourceItem);

            // Ensure data source is updated
            ChangeDataSourceAsync(userContext, sqlDsi.DataSource);

            // Get the UserContext properties
            string customerId = userContext.UserId;
            string? orderId = userContext.Properties["OrderId"]?.ToString();
            bool isAdmin = userContext.Properties["Role"]?.ToString() == "Admin";

            // Get filterTables from userContext properties
            var filterTables = userContext.Properties["FilterTables"] as string[] ?? Array.Empty<string>();

            // Execute query based on the incoming client request
            switch (sqlDsi.Id)
            {
                // Example of how to use a stored procedure 
                case "TenMostExpensiveProducts":
                    sqlDsi.Procedure = "Ten Most Expensive Products";
                    break;

                // Example of how to use a stored procedure with a parameter
                case "CustOrderHist":
                case "CustOrdersOrders":
                    sqlDsi.Procedure = sqlDsi.Id;
                    sqlDsi.ProcedureParameters = new Dictionary<string, object> { { "@CustomerID", customerId } };
                    break;


                // Example of an ad-hoc-query
                case "CustomerOrders":
                    string customQuery = $"SELECT * FROM Orders WHERE OrderId = '{orderId}'";
                    sqlDsi.CustomQuery = customQuery;
                    break;

                default:
                    // Check for general table access logic
                    if (filterTables.Contains(sqlDsi.Table))
                    {
                        if (isAdmin)
                        {
                            sqlDsi.CustomQuery = $"SELECT * FROM [{sqlDsi.Table}]";
                        }
                        else
                        {
                            sqlDsi.CustomQuery = $"SELECT * FROM [{sqlDsi.Table}] WHERE customerId = '{customerId}'";
                        }
                    }
                break; 
            }
            return Task.FromResult(dataSourceItem);
        }
    }
}