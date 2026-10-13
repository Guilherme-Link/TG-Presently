package br.com.fatecid.guidu.presently.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;

import br.com.fatecid.guidu.presently.dto.QrCodeRenderingDTO;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;

@Service
public class QrCodeService {

    private final ValidationCodeService codeService;

    public QrCodeService(ValidationCodeService codeService) {
        this.codeService = codeService;
    }

    public QrCodeRenderingDTO generateQRCode(long eventId, int width, int height) throws WriterException, IOException {
        Instant generatedAt = Instant.now();
        long now = generatedAt.getEpochSecond();
        int validForSeconds = codeService.getCodeValidFor();

        // Gera a String base que será transformada em QRcode
        String text = codeService.generateValidationCode(
            eventId,
            LocalDateTime.ofInstant(generatedAt, ZoneId.systemDefault())
        );

        // Codifica a String para código QR
        QRCodeWriter qrCodeWriter = new QRCodeWriter();
        BitMatrix bitMatrix = qrCodeWriter.encode(text, BarcodeFormat.QR_CODE, width, height);
        
        // Salva o output como imagem e transforma em array de bytes
        ByteArrayOutputStream pngOutputStream = new ByteArrayOutputStream();
        MatrixToImageWriter.writeToStream(bitMatrix, "PNG", pngOutputStream);

        // Momento de geração do código
        long expirationTime = ((now / validForSeconds) + 1) * validForSeconds;

        // Cria o DTO para retorno ao usuário
        QrCodeRenderingDTO RenderingDTO = new QrCodeRenderingDTO(
            pngOutputStream.toByteArray(),
            width,
            height,
            now,
            expirationTime
        );

        return RenderingDTO;
    }

}
