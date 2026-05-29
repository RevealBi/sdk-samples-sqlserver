# Reveal BI Java Spring Boot SQL Server Sample

This sample uses the new Reveal BI Java SDK 2.0 through the `io.revealbi:reveal-sdk-servlet` artifact. It replaces the older Jersey registration model (`com.infragistics.reveal.sdk` 1.x) with a Spring Boot servlet registration for `RevealEngineServlet`.

## Run

Optional — create `src/main/resources/application.properties` from the `application.properties.example` file and set your SQL Server connection values. The same values can also be supplied via environment variables (`SQL_SERVER_HOST`, `SQL_SERVER_DATABASE`, `SQL_SERVER_USERNAME`, `SQL_SERVER_PASSWORD`, `SQL_SERVER_SCHEMA`).

**Windows (PowerShell):**
```powershell
.\mvnw.cmd spring-boot:run "-Dspring-boot.run.arguments=--server.port=5111"
```

**macOS/Linux:**
```bash
./mvnw spring-boot:run -Dspring-boot.run.arguments=--server.port=5111
```

The server listens on `http://localhost:5111`.

## Endpoints

| Path | Served by |
|------|-----------|
| `/reveal-api/*` | `RevealEngineServlet` (Reveal SDK 2.0 HTTP API) |
| `/dashboards/names` | `DomController` (Spring MVC) — list dashboards in the `dashboards` folder |
| `/dashboards/visualizations` | `DomController` (Spring MVC) — list visualizations from each dashboard |
| `/images/**` | Spring MVC static resources |

## Client configuration

Because the Reveal API is mounted at `/reveal-api/*` (so it can coexist with `/dashboards/*` and `/images/**` served by Spring MVC), the client's base URL must include that prefix:

```js
$.ig.RevealSdkSettings.setBaseUrl("http://localhost:5111/reveal-api/");
```

The HTML files under `../../client/` have already been updated to use that base URL. If you switch to a different server sample (Node.js, ASP.NET, Blazor) that mounts Reveal at `/`, revert the base URL back to `"http://localhost:5111/"`.

## What changed when migrating from SDK 1.x

- `pom.xml`: replaced `com.infragistics.reveal.sdk:reveal-sdk` 1.8.0 with `io.revealbi:reveal-sdk-servlet` 2.0.0. Removed `spring-boot-starter-jersey` and the `spring-boot-starter-tomcat` provided dependency; added the `release-stage` repository.
- `RevealApplication.java`: now registers a `RevealEngineServlet` via `ServletRegistrationBean` using `RevealServerBuilder` to wire the providers.
- `RevealJerseyConfig.java`: **removed** — Jersey is no longer used.
- `CorsFilter.java`: replaced with `PermissiveCorsFilter.java`, a `jakarta.servlet.Filter` (the Jersey `ContainerRequestFilter`/`ContainerResponseFilter` model no longer applies).
- `UserContextProvider.java`: `RVContainerRequestAwareUserContextProvider` was dropped in 2.0; this class now implements `io.revealbi.servlet.IRVServletUserContextProvider` and reads the user context directly from `HttpServletRequest`.
- `AuthenticationProvider`, `DataSourceProvider`, `DashboardProvider`, `ObjectFilter`: switched their imports from `com.infragistics.reveal.sdk.*` to the new `io.revealbi.core.*` / `io.revealbi.core.data.*` packages. `IRVObjectFilter` no longer has a `filter(IRVUserContext, RVDashboardDataSource)` overload, so that method was removed.
- `DomController.java`: converted from JAX-RS (`@Path`, `@GET`, `@Produces`) to Spring MVC (`@RestController`, `@RequestMapping`, `@GetMapping`).
- Java 17 is required (it already was for Spring Boot 3.x).
