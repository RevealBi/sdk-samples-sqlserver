# Reveal BI Java Spring Boot SQL Server Sample

Spring Boot 3 server using the new Reveal BI Java SDK 2.0 (`io.revealbi:reveal-sdk-servlet`). The server mounts the Reveal API at `/reveal-api/*` (the wiki's standard pattern), serves the JavaScript client from the sibling `client/` folder at the root path, and exposes two helper endpoints from `DomController`.

## Run

Set your SQL Server credentials in `src/main/resources/application.properties` (copy from `application.properties.example`) or as environment variables (`SQL_SERVER_HOST`, `SQL_SERVER_DATABASE`, `SQL_SERVER_USERNAME`, `SQL_SERVER_PASSWORD`, `SQL_SERVER_SCHEMA`).

**Windows (PowerShell):**
```powershell
.\mvnw.cmd spring-boot:run "-Dspring-boot.run.arguments=--server.port=5111"
```

**macOS/Linux:**
```bash
./mvnw spring-boot:run -Dspring-boot.run.arguments=--server.port=5111
```

Then open `http://localhost:5111/load-dashboard.html` (or `index.html`, `index-ds.html`, `index-dsi.html`) in a browser.

## Routing

| Request | Handled by |
|---------|-----------|
| `/reveal-api/*` | `RevealEngineServlet` (Reveal SDK 2.0) |
| `GET /dashboards/names`, `GET /dashboards/visualizations` | `DomController` (Spring MVC) |
| `GET /`, `GET /index.html`, `GET /styles/common.css`, ... | Static files from `../../client/` via Spring's resource handler |

This works because the servlet container routes `/reveal-api/*` to the Reveal servlet (path mapping) and everything else falls through to Spring's `DispatcherServlet` (default mapping `/`), which handles the controllers and resources.

The JavaScript client matches this layout by calling `RevealSdkSettings.setBaseUrl("http://localhost:5111/reveal-api/")` so its `${baseUrl}/dashboards/{id}/...` requests reach the Reveal servlet.

## Files

- `RevealApplication.java` — Spring Boot entry point. Registers `RevealEngineServlet` at `/reveal-api/*` with `setAsyncSupported(true)`.
- `WebConfig.java` — points Spring's resource handler at `../../client/` (so static files in that folder are served at the root) and maps `/` to `forward:/index.html`.
- `UserContextProvider.java` — implements `io.revealbi.servlet.IRVServletUserContextProvider`, reads request headers and SQL Server settings to build an `RVUserContext`.
- `AuthenticationProvider.java`, `DataSourceProvider.java`, `DashboardProvider.java`, `ObjectFilter.java` — the SDK providers used by `RevealServerBuilder`.
- `PermissiveCorsFilter.java` — `jakarta.servlet.Filter` adding permissive CORS headers.
- `DomController.java` + `VisualizationChartInfo.java` — Spring MVC controller exposing `/dashboards/names` and `/dashboards/visualizations`.

## Migration from SDK 1.x

This sample was migrated from `com.infragistics.reveal.sdk:reveal-sdk` 1.8.0. See `JAVA-SDK-2.0-MIGRATION-GUIDE.md` at the root of the `Reveal` repo for per-file rationale.

Summary of changes from the 1.x layout:

- `pom.xml`: replaced `com.infragistics.reveal.sdk:reveal-sdk` 1.8.0 with `io.revealbi:reveal-sdk-servlet` 2.0.0. Removed `spring-boot-starter-jersey` and the provided `spring-boot-starter-tomcat`. Added the `release-stage` Maven repo.
- Deleted `RevealJerseyConfig.java` (Jersey is gone) and the Jersey-based `CorsFilter.java`.
- `RevealApplication.java` now registers `RevealEngineServlet` via `ServletRegistrationBean`, with the engine wired through `RevealServerBuilder`.
- `UserContextProvider`: `RVContainerRequestAwareUserContextProvider` was dropped in 2.0; the class now implements `IRVServletUserContextProvider` and reads from `HttpServletRequest` directly.
- All `com.infragistics.reveal.sdk.*` imports moved to `io.revealbi.core.*` / `io.revealbi.core.data.*`. The `IRVObjectFilter` overload that took an `RVDashboardDataSource` is gone.
- `DomController`: converted from JAX-RS (`@Path`/`@GET`/`@Produces`) to Spring MVC (`@RestController`/`@RequestMapping`/`@GetMapping`).
- `WebConfig`: previously pointed at bundled chart-type PNGs under `classpath:/static/images/`; now points at `../../client/` so the JS app is served from the same port.
- Java 17+ is required (it already was for Spring Boot 3.x).
