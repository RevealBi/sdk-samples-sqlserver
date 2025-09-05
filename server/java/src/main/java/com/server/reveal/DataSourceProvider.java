package com.server.reveal;

import com.infragistics.reveal.sdk.api.IRVDataSourceProvider;
import com.infragistics.reveal.sdk.api.IRVUserContext;
import com.infragistics.reveal.sdk.api.model.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import java.util.HashMap;

@Component
public class DataSourceProvider implements IRVDataSourceProvider {
    
    
    public RVDataSourceItem changeDataSourceItem(IRVUserContext userContext, String dashboardsID, RVDataSourceItem dataSourceItem) {
        
        // ****
        // Every request for data passes thru changeDataSourceItem
        // You can set query properties based on the incoming requests
        // for example, you can check:
        // - dsi.getId()
        // - dsi.getTable()
        // - dsi.getProcedure()
        // - dsi.getTitle()
        // and take a specific action on the dsi as this request is processed
        // ****
        
        if (!(dataSourceItem instanceof RVAzureSqlDataSourceItem)) {
            return dataSourceItem;
        }

        RVAzureSqlDataSourceItem azureDsi = (RVAzureSqlDataSourceItem) dataSourceItem;

        // Ensure data source is updated
        changeDataSource(userContext, dataSourceItem.getDataSource());

        // Get the UserContext properties
        String customerId = userContext.getUserId();
        String orderId = userContext.getProperties().get("OrderId") != null ? 
            userContext.getProperties().get("OrderId").toString() : null;
        boolean isAdmin = "Admin".equals(userContext.getProperties().get("Role"));

        // Get filterTables from userContext properties
        String[] filterTables = userContext.getProperties().get("FilterTables") instanceof String[] ? 
            (String[]) userContext.getProperties().get("FilterTables") : new String[0];

        // Execute query based on the incoming client request
        switch (azureDsi.getId()) {
            // Example of how to use a stored procedure
            case "TenMostExpensiveProducts":
                azureDsi.setProcedure("Ten Most Expensive Products");
                break;

            // Example of how to use a stored procedure with a parameter
            case "CustOrderHist":
            case "CustOrdersOrders":
                azureDsi.setProcedure(azureDsi.getId());
                HashMap<String, Object> procedureParameters = new HashMap<>();
                procedureParameters.put("@CustomerID", customerId);
                azureDsi.setProcedureParameters(procedureParameters);
                break;

            // Example of an ad-hoc-query
            case "CustomerOrders":
                String customQuery = "SELECT * FROM Orders WHERE OrderId = '" + orderId + "'";
                azureDsi.setCustomQuery(customQuery);
                break;

            default:
                // Check for general table access logic
                if (java.util.Arrays.asList(filterTables).contains(azureDsi.getTable())) {
                    if (isAdmin) {
                        azureDsi.setCustomQuery("SELECT * FROM [" + azureDsi.getTable() + "]");
                    } else {
                        azureDsi.setCustomQuery("SELECT * FROM [" + azureDsi.getTable() + "] WHERE customerId = '" + customerId + "'");
                    }
                }
                break;
        }
        
        return dataSourceItem;
    }

    public RVDashboardDataSource changeDataSource(IRVUserContext userContext, RVDashboardDataSource dataSource) {
        if (dataSource instanceof RVAzureSqlDataSource) {
            RVAzureSqlDataSource azureDataSource = (RVAzureSqlDataSource) dataSource;

            // System.out.println((String) userContext.getProperties().get("Host"));

            azureDataSource.setHost((String) userContext.getProperties().get("Host"));
            azureDataSource.setDatabase((String) userContext.getProperties().get("Database"));
        }
        return dataSource;
    }
}