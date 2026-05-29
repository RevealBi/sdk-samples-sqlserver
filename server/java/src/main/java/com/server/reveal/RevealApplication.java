package com.server.reveal;

import io.revealbi.core.RevealServerBuilder;
import io.revealbi.servlet.RevealEngineServlet;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.web.servlet.ServletRegistrationBean;
import org.springframework.boot.web.servlet.support.SpringBootServletInitializer;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class RevealApplication extends SpringBootServletInitializer {

    public static void main(String[] args) {
        SpringApplication.run(RevealApplication.class, args);
    }

    @Override
    protected SpringApplicationBuilder configure(SpringApplicationBuilder application) {
        return application.sources(RevealApplication.class);
    }

    @Bean
    ServletRegistrationBean<RevealEngineServlet> revealServlet(AuthenticationProvider authenticationProvider,
                                                               DataSourceProvider dataSourceProvider,
                                                               DashboardProvider dashboardProvider,
                                                               ObjectFilter objectFilter,
                                                               UserContextProvider userContextProvider) {
        RevealEngineServlet revealEngineServlet = new RevealEngineServlet(
            new RevealServerBuilder()
                .setAuthenticationProvider(authenticationProvider)
                .setDataSourceProvider(dataSourceProvider)
                .setDashboardProvider(dashboardProvider)
                .setObjectFilter(objectFilter)
                .build(),
            userContextProvider
        );

        ServletRegistrationBean<RevealEngineServlet> registration =
            new ServletRegistrationBean<>(revealEngineServlet, "/reveal-api/*");
        registration.setAsyncSupported(true);
        registration.setLoadOnStartup(1);
        return registration;
    }
}
