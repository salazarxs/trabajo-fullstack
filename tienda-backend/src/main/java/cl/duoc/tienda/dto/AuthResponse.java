package cl.duoc.tienda.dto;

// lo que se devuelve al frontend cuando el login sale bien
public class AuthResponse {

    private String token;
    private String refreshToken;
    private Long id;
    private String nombre;
    private String email;
    private String rol;

    public AuthResponse(String token, String refreshToken, Long id, String nombre, String email, String rol) {
        this.token = token;
        this.refreshToken = refreshToken;
        this.id = id;
        this.nombre = nombre;
        this.email = email;
        this.rol = rol;
    }

    public String getToken() { return token; }
    public String getRefreshToken() { return refreshToken; }
    public Long getId() { return id; }
    public String getNombre() { return nombre; }
    public String getEmail() { return email; }
    public String getRol() { return rol; }
}
