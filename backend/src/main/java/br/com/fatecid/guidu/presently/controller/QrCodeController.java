package br.com.fatecid.guidu.presently.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.fatecid.guidu.presently.dto.QrCodeRenderingDTO;
import br.com.fatecid.guidu.presently.service.QrCodeService;

import java.io.IOException;

@RestController
@RequestMapping("/api/v1/qrcode")
public class QrCodeController {
    
    private final QrCodeService qrCodeService;

    public QrCodeController(QrCodeService qrCodeService) {
        this.qrCodeService = qrCodeService;
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
}   