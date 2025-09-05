package com.server.reveal;

import com.infragistics.reveal.sdk.api.IRVAuthenticationProvider;
import com.infragistics.reveal.sdk.api.IRVDataSourceCredential;
import com.infragistics.reveal.sdk.api.IRVUserContext;
import com.infragistics.reveal.sdk.api.RVUsernamePasswordDataSourceCredential;
import com.infragistics.reveal.sdk.api.model.RVDashboardDataSource;
import com.infragistics.reveal.sdk.api.model.RVSqlServerDataSource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class AuthenticationProvider implements IRVAuthenticationProvider {
    
    @Value("${SQL_SERVER_USERNAME}")
    private String sqlServerUsername;
    
    @Value("${SQL_SERVER_PASSWORD}")
    private String sqlServerPassword;
    
    @Override
    public IRVDataSourceCredential resolveCredentials(IRVUserContext userContext, RVDashboardDataSource dataSource) {
        if (dataSource instanceof RVSqlServerDataSource) {
            return new RVUsernamePasswordDataSourceCredential(sqlServerUsername, sqlServerPassword);
        }
        return null;
    }
}
