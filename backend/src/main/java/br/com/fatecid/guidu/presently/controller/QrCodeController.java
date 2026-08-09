package br.com.fatecid.guidu.presently.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.fatecid.guidu.presently.dto.QrCodeRenderingDTO;
import br.com.fatecid.guidu.presently.dto.QrCodeValidationDTO;
import br.com.fatecid.guidu.presently.service.QrCodeService;
import br.com.fatecid.guidu.presently.service.ValidationCodeService;

import java.io.IOException;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/api/v1/qrcode")
public class QrCodeController {
    
    private final QrCodeService qrCodeService;
    private final ValidationCodeService validationService;

    public QrCodeController(QrCodeService qrCodeService, ValidationCodeService validationService) {
        this.qrCodeService = qrCodeService;
        this.validationService = validationService;
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
    public HttpStatus register(@RequestBody QrCodeValidationDTO validationDTO) {

        if(validationService.validateCode(validationDTO)){
            return HttpStatus.OK;
        }
        else{
            return HttpStatus.PRECONDITION_FAILED;
        }
    
    }

}   