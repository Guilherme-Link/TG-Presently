package br.com.fatecid.guidu.presently.controller;

import java.time.Instant;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.webauthn.api.CredentialRecord;
import org.springframework.security.web.webauthn.api.PublicKeyCredentialUserEntity;
import org.springframework.security.web.webauthn.management.PublicKeyCredentialUserEntityRepository;
import org.springframework.security.web.webauthn.management.UserCredentialRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/security/v1/webauthn")
public class WebAuthnCredentialController {

    private final PublicKeyCredentialUserEntityRepository userEntityRepository;
    private final UserCredentialRepository credentialRepository;

    public WebAuthnCredentialController(
            PublicKeyCredentialUserEntityRepository userEntityRepository,
            UserCredentialRepository credentialRepository) {
        this.userEntityRepository = userEntityRepository;
        this.credentialRepository = credentialRepository;
    }

    @GetMapping("/credentials")
    public ResponseEntity<List<CredentialSummary>> credentials(Authentication authentication) {
        PublicKeyCredentialUserEntity userEntity =
                userEntityRepository.findByUsername(authentication.getName());
        if (userEntity == null) {
            return ResponseEntity.ok(List.of());
        }

        List<CredentialSummary> credentials = credentialRepository.findByUserId(userEntity.getId())
                .stream()
                .map(WebAuthnCredentialController::toSummary)
                .toList();
        return ResponseEntity.ok(credentials);
    }

    private static CredentialSummary toSummary(CredentialRecord credential) {
        return new CredentialSummary(
                credential.getCredentialId().toBase64UrlString(),
                credential.getLabel(),
                credential.getCreated(),
                credential.getLastUsed()
        );
    }

    public record CredentialSummary(String id, String label, Instant created, Instant lastUsed) {}
}
