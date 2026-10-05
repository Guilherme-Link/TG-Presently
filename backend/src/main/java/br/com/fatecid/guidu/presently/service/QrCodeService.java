package br.com.fatecid.guidu.presently.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;

import br.com.fatecid.guidu.presently.dto.QrCodeRenderingDTO;
import br.com.fatecid.guidu.presently.dto.TerminalCodeResponseDTO;

import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.Instant;
import java.time.LocalDateTime;

@Service
public class QrCodeService {

    private final TerminalService terminalService;
    private final ValidationCodeService codeService;

    public QrCodeService(
        ValidationCodeService codeService,
        TerminalService terminalService
    ) {
        this.codeService = codeService;
        this.terminalService = terminalService;
    }

    public QrCodeRenderingDTO generateQRCode(long eventId, int width, int height) throws WriterException, IOException {
        
        // Gera a String base que será transformada em QRcode
        String text = codeService.generateValidationCode(eventId, LocalDateTime.now());

        // Codifica a String para código QR
        QRCodeWriter qrCodeWriter = new QRCodeWriter();
        BitMatrix bitMatrix = qrCodeWriter.encode(text, BarcodeFormat.QR_CODE, width, height);
        
        // Salva o output como imagem e transforma em array de bytes
        ByteArrayOutputStream pngOutputStream = new ByteArrayOutputStream();
        MatrixToImageWriter.writeToStream(bitMatrix, "PNG", pngOutputStream);

        // Momento de geração do código
        long now = Instant.now().getEpochSecond();

        // Cria o DTO para retorno ao usuário
        QrCodeRenderingDTO renderingDTO = new QrCodeRenderingDTO(
            pngOutputStream.toByteArray(),
            width,
            height,
            now,
            (now + codeService.getCodeValidFor())
        );

        return renderingDTO;
    }

    public TerminalCodeResponseDTO generateQRString(String terminalId) throws WriterException, IOException {

        // Gera a String base do código de validação
        String text = codeService.generateValidationCode(
            terminalService.findActiveEventId(terminalId), 
            LocalDateTime.now()
        );

        // Cria o DTO para retorno ao usuário
        TerminalCodeResponseDTO responseDTO = new TerminalCodeResponseDTO(
            text,
            codeService.getCodeValidFor()
        );

        return responseDTO;
    }
    
}   