package com.server.reveal;

import com.infragistics.reveal.sdk.api.IRVUserContext;
import com.infragistics.reveal.sdk.base.RVUserContext;
import com.infragistics.reveal.sdk.rest.RVContainerRequestAwareUserContextProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import java.util.HashMap;
import jakarta.ws.rs.container.ContainerRequestContext;

@Component
public class UserContextProvider extends RVContainerRequestAwareUserContextProvider {
    
    @Value("${SQL_SERVER_HOST:localhost}")
    private String sqlServerHost;
    
    @Value("${SQL_SERVER_DATABASE:Northwind}")
    private String sqlServerDatabase;
    
    @Value("${SQL_SERVER_USERNAME:sa}")
    private String sqlServerUsername;
    
    @Value("${SQL_SERVER_PASSWORD:password}")
    private String sqlServerPassword;
    
    @Value("${SQL_SERVER_SCHEMA:dbo}")
    private String sqlServerSchema;

    @Override
    protected IRVUserContext getUserContext(ContainerRequestContext requestContext) {
        String headerValue = requestContext.getHeaderString("x-header-one");
        String userId = null;
        String orderId = null;

        if (headerValue != null && !headerValue.isEmpty()) {
            String[] pairs = headerValue.split(",");
            for (String pair : pairs) {
                String[] kv = pair.split(":", 2);
                if (kv.length == 2) {
                    String key = kv[0].trim();
                    String value = kv[1].trim();
                    if (key.equalsIgnoreCase("userId")) {
                        userId = value;
                    } else if (key.equalsIgnoreCase("orderId")) {
                        orderId = value;
                    }
                }
            }
        }

        // default to User role
        String role = "User";

        // null is used here just for demo 
        if ("BLONP".equals(userId) || userId == null) {
            role = "Admin";
        }

        String[] filterTables = role.equals("Admin") 
            ? new String[0] 
            : new String[]{"Customers", "Orders"};

        var props = new HashMap<String, Object>();
        props.put("OrderId", orderId != null ? orderId : "");
        props.put("Role", role);
        props.put("Host", sqlServerHost);
        props.put("Database", sqlServerDatabase);
        props.put("Username", sqlServerUsername);
        props.put("Password", sqlServerPassword);
        props.put("Schema", sqlServerSchema);
        props.put("FilterTables", filterTables);

        return new RVUserContext(userId, props); 
    }
}