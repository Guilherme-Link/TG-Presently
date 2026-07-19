package br.com.fatecid.guidu.presently.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;

import br.com.fatecid.guidu.presently.dto.QrCodeRenderingDTO;
import br.com.fatecid.guidu.presently.dto.QrCodeValidationDTO;
import br.com.fatecid.guidu.presently.entity.Event;
import jakarta.persistence.EntityNotFoundException;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.Base64;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

@Service
public class QrCodeService {

    // Recebe a configuração de tempo de validade do código das application.properties
    @Value("${presently.validationcode.validfor}")
    private int codeValidForSeconds;

    private final EventService eventService;

    public QrCodeService(EventService eventService) {
        this.eventService = eventService;
    }

    public String generateValidationCode(long eventId, LocalDateTime timestamp){

        
        // Cálculo do tempo de validade do QR code 
        long counter = timestamp.toEpochSecond(null) / codeValidForSeconds;
        
        String code = new String();

        try {

            // Cálculo do código de validação com base na chave secreta do evento
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec key = new SecretKeySpec(
                eventService.getSecretKeyById(eventId).getBytes(StandardCharsets.UTF_8),
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
        String text = generateValidationCode(eventId, LocalDateTime.now());

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

    public boolean validateCode(QrCodeValidationDTO validationDTO){

        // TODO (Gui): Adicionar as outras validações; Também adicionar registro no banco

        Event event = new Event();

        // Primeira validação: Verifica se o id de evento realmente corresponde a um evento cadastrado
        try{
            event = eventService.findById(validationDTO.getEventId());
        }
        catch(EntityNotFoundException e){
            return false;
        }

        // Segunda validação: Verifica se o evento está ativo
        if(!event.isActive(validationDTO.getValidationTimestamp())){
            return false;
        }

        // Terceira validação: Verifica se o código de evento ainda é válido
        if (!generateValidationCode(event.getId(), validationDTO.getValidationTimestamp()).equals(validationDTO.getValidationCode())){
            return false;
        }
        
        return true;
    }
}   