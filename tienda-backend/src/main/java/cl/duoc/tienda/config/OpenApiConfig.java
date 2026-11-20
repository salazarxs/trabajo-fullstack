package cl.duoc.tienda.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

// configuracion de Swagger, agrega el boton "Authorize" para poner el token JWT
@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI apiTienda() {
        return new OpenAPI()
                .info(new Info()
                        .title("API Tienda Online")
                        .version("1.0")
                        .description("API REST de la tienda online - DSY1104 Desarrollo Fullstack II"))
                .components(new Components()
                        .addSecuritySchemes("bearerAuth", new SecurityScheme()
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")))
                .addSecurityItem(new SecurityRequirement().addList("bearerAuth"));
    }
}
