package com.server.reveal;

import io.revealbi.core.IRVUserContext;
import io.revealbi.core.data.IRVAuthenticationProvider;
import io.revealbi.core.data.IRVDataSourceCredential;
import io.revealbi.core.data.RVDashboardDataSource;
import io.revealbi.core.data.RVSqlServerDataSource;
import io.revealbi.core.data.RVUsernamePasswordDataSourceCredential;
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
