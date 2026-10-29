package br.com.fatecid.guidu.presently.controller;

import br.com.fatecid.guidu.presently.service.TerminalService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.fatecid.guidu.presently.dto.QrCodeRenderingDTO;
import br.com.fatecid.guidu.presently.dto.QrCodeValidationDTO;
import br.com.fatecid.guidu.presently.dto.TerminalCodeResponseDTO;
import br.com.fatecid.guidu.presently.config.MfaSessionFilter;
import br.com.fatecid.guidu.presently.entity.Terminal;
import br.com.fatecid.guidu.presently.service.QrCodeService;
import br.com.fatecid.guidu.presently.service.ValidationCodeService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.http.HttpServletRequest;

import java.io.IOException;
import java.util.Map;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/api/v1/qrcode")
public class QrCodeController {
    
    private final TerminalService terminalService;
    private final QrCodeService qrCodeService;
    private final ValidationCodeService validationService;

    public QrCodeController(QrCodeService qrCodeService, ValidationCodeService validationService, TerminalService terminalService) {
        this.qrCodeService = qrCodeService;
        this.validationService = validationService;
        this.terminalService = terminalService;
    }

    // Devolve o QR code de um evento pelo ID
    @GetMapping("/{eventId}")
    public ResponseEntity<QrCodeRenderingDTO> generateQRCode(@PathVariable Long eventId) throws IOException {
        try {
            QrCodeRenderingDTO qrCode = qrCodeService.generateQRCode(eventId, 300, 300);
            return ResponseEntity.ok(qrCode);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Valida uma leitura de código qr
    @PostMapping("/validate")
    public ResponseEntity<?> register(
            @RequestBody QrCodeValidationDTO validationDTO,
            Authentication authentication,
            HttpServletRequest request) {
        boolean passkeyConfirmed = authentication != null && authentication.getAuthorities().stream()
                .anyMatch(authority -> "FACTOR_WEBAUTHN".equals(authority.getAuthority()));
        var session = request.getSession(false);
        Object verifiedAtValue = session == null
                ? null
                : session.getAttribute(MfaSessionFilter.ATTENDANCE_PASSKEY_VERIFIED_AT);
        if (session != null) {
            session.removeAttribute(MfaSessionFilter.ATTENDANCE_PASSKEY_VERIFIED_AT);
        }
        boolean recentlyVerified = verifiedAtValue instanceof Long verifiedAt
                && System.currentTimeMillis() - verifiedAt <= 60_000;
        if (!passkeyConfirmed || !recentlyVerified) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        String validationError = validationService.validateCode(validationDTO);
        if (validationError == null) {
            return ResponseEntity.ok().build();
        }

        return ResponseEntity.status(HttpStatus.PRECONDITION_FAILED)
                .body(Map.of("message", validationError));
    }

    // Devolve a string de base para um QR code pelo ID de terminal
    @GetMapping("/terminal")
    public ResponseEntity<TerminalCodeResponseDTO> generateQRString(
        @RequestHeader("X-Terminal-Id") String terminalId
    ) throws IOException {

        try {

            Terminal terminal = terminalService.findByTerminalId(terminalId);
            if (!terminal.isApproved()) 
                return ResponseEntity.status(HttpStatus.ACCEPTED).body(null);

        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }

        try {
            TerminalCodeResponseDTO qrCode = qrCodeService.generateQRString(terminalId);
            return ResponseEntity.ok(qrCode);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

}   
