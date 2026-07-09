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
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.Base64;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

@Service
public class QrCodeService {

    // TODO (Gui): Externalizar configuração de tempo de validade do código
    private int codeValidForSeconds = 60;
    private final EventService eventService;

    public QrCodeService(EventService eventService) {
        this.eventService = eventService;
    }

    public String generateValidationCode(long id){

        
        // Cálculo do tempo de validade do QR code 
        long counter = Instant.now().getEpochSecond() / codeValidForSeconds;
        
        String code = new String();

        try {

            // Cálculo do código de validação com base na chave secreta do evento
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec key = new SecretKeySpec(
                eventService.getSecretKeyById(id).getBytes(StandardCharsets.UTF_8),
                "HmacSHA256"
            );
            mac.init(key);

            byte[] hash = mac.doFinal(
                String.valueOf(counter).getBytes(StandardCharsets.UTF_8)
            );

            code = Base64.getEncoder().encodeToString(hash);
            
        } catch (NoSuchAlgorithmException e) {
            // Erro de algoritmo inválido
            e.printStackTrace();
        } catch (InvalidKeyException e) {
            // Erro de chave inválida
            e.printStackTrace();
        }

        return code;
    }

    public QrCodeRenderingDTO generateQRCode(long eventId, int width, int height) throws WriterException, IOException {
        
        // Gera a String base que será transformada em QRcode
        String text = generateValidationCode(eventId);

        // Codifica a String para código QR
        QRCodeWriter qrCodeWriter = new QRCodeWriter();
        BitMatrix bitMatrix = qrCodeWriter.encode(text, BarcodeFormat.QR_CODE, width, height);
        
        // Salva o output como imagem e transforma em array de bytes
        ByteArrayOutputStream pngOutputStream = new ByteArrayOutputStream();
        MatrixToImageWriter.writeToStream(bitMatrix, "PNG", pngOutputStream);

        // Momento de geração do código
        long now = Instant.now().getEpochSecond();

        // Cria o DTO para retorno ao usuário
        QrCodeRenderingDTO RenderingDTO = new QrCodeRenderingDTO(
            pngOutputStream.toByteArray(),
            width,
            height,
            now,
            (now + codeValidForSeconds)
        );

        return RenderingDTO;
    }
}   