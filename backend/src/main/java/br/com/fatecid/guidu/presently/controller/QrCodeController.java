package br.com.fatecid.guidu.presently.controller;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import br.com.fatecid.guidu.presently.service.QrCodeService;

import java.io.IOException;

@RestController
@RequestMapping("/api/v1/qrcode")
public class QrCodeController {
    
    private final QrCodeService qrCodeService;

    public QrCodeController(QrCodeService qrCodeService) {
        this.qrCodeService = qrCodeService;
    }

    // Returns the image directly as a PNG byte array
    @GetMapping(value = "/qr-code", produces = MediaType.IMAGE_PNG_VALUE)
    public ResponseEntity<byte[]> generateQRCode(@RequestParam String text) throws IOException {
        try {
            byte[] qrCode = qrCodeService.generateQRCode(text, 300, 300);
            return ResponseEntity.ok(qrCode);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Returns the image as a Base64 string
    @GetMapping("/qr-code/base64")
    public ResponseEntity<String> generateQRCodeAsBase64(@RequestParam String text) throws Exception {
        String base64QrCode = qrCodeService.generateQRCodeAsBase64(text, 300, 300);
        return ResponseEntity.ok(base64QrCode);
    }
}   