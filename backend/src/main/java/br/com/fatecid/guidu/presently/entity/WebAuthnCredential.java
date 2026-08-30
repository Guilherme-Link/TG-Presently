package br.com.fatecid.guidu.presently.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "webauthn_credentials",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_webauthn_credential_id", columnNames = "credential_id")
    }
)
public class WebAuthnCredential {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ID da credencial WebAuthn.
    // Deve ser armazenado como bytes ou Base64/Base64URL.
    @Column(name = "credential_id", nullable = false, unique = true, length = 512)
    private String credentialId;

    // Chave pública usada para verificar as assinaturas WebAuthn.
    // O tipo de variável depende da biblioteca que vai ser usada
    // TODO (Gui): Verificar a biblioteca
    @Lob
    @Column(name = "public_key", nullable = false)
    private String publicKey;

    // Contador enviado pelo autenticador.
    // É importante para detectar certos tipos de clonagem/reprodução da credencial.
    @Column(name = "sign_count", nullable = false)
    private Long signCount = 0L;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @OneToOne(mappedBy = "webauthnCredential")
    private User user;

    public WebAuthnCredential() {
        this.createdAt = LocalDateTime.now();
    }


    //Getters e Setters

    public Long getId() {
        return id;
    }

    public String getCredentialId() {
        return credentialId;
    }

    public void setCredentialId(String credentialId) {
        this.credentialId = credentialId;
    }

    public String getPublicKey() {
        return publicKey;
    }

    public void setPublicKey(String publicKey) {
        this.publicKey = publicKey;
    }

    public Long getSignCount() {
        return signCount;
    }

    public void setSignCount(Long signCount) {
        this.signCount = signCount;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }
}
