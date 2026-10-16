package br.com.fatecid.guidu.presently.service;

import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Base64;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import br.com.fatecid.guidu.presently.dto.QrCodeValidationDTO;
import br.com.fatecid.guidu.presently.entity.Event;
import br.com.fatecid.guidu.presently.entity.EventOccurrence;
import jakarta.persistence.EntityNotFoundException;

@Service
public class ValidationCodeService {

    private static final ZoneId APP_TIME_ZONE = ZoneId.of("America/Sao_Paulo");

    // Recebe a configuração de tempo de validade do código das application.properties
    @Value("${presently.validationcode.validfor}")
    private int codeValidForSeconds;

    private final EventService eventService;
    private final EventOccurrenceService occurrenceService;
    private final AmbientService ambientService;

    public ValidationCodeService(
            EventService eventService, 
            EventOccurrenceService occurrenceService, 
            AmbientService ambientService
    ) {
        this.eventService = eventService;
        this.occurrenceService = occurrenceService;
        this.ambientService = ambientService;
    }

    public int getCodeValidFor(){
        return codeValidForSeconds;
    }

    public String generateValidationCode(long eventId, LocalDateTime timestamp){

        
        // Cálculo do tempo de validade do QR code 
        long counter = timestamp.atZone(APP_TIME_ZONE).toEpochSecond() / codeValidForSeconds;
        
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

    public boolean validateCode(QrCodeValidationDTO validationDTO){

        // TODO (Gui): Adicionar as outras validações; Também adicionar registro no banco

        LocalDateTime validationTimestamp = validationDTO.getValidationTimestamp();
        if (validationTimestamp == null) {
            validationTimestamp = LocalDateTime.now(APP_TIME_ZONE);
        }

        Event event = new Event();

        // Primeira validação: Verifica se o id de evento realmente corresponde a um evento cadastrado
        try{
            event = eventService.findById(validationDTO.getEventId());
        }
        catch(EntityNotFoundException e){
            return false;
        }

        // Segunda validação: Verifica se o evento está ativo
        if(!event.isActive(validationTimestamp)){
            return false;
        }

        // Terceira validação: Verifica se o código de evento ainda é válido
        if (!generateValidationCode(event.getId(), validationTimestamp).equals(validationDTO.getValidationCode())){
            return false;
        }

        // Quarta validação: Verifica se o usuário está dentro da área permitida pelo geofencing
        //                      - Se a área do ambiente for null, pula a validação 
        if (
            event.getAmbient().getArea() != null &&
            !ambientService.validateInsideAmbient(
                event.getAmbient().getId(), 
                validationDTO.getUserLatitude(), 
                validationDTO.getUserLongitude()
        )){
            return false;
        }

        // Objeto de ocorrência de evento para armazenar histórico
        EventOccurrence occurrence = occurrenceService.getOrCreateOccurrence(
            event, 
            validationTimestamp.toLocalDate()
        );

        // Verifica se a ocorrência está aberta
        if (occurrence.isClosed()){
            return false;
        }
        
        // Registra a presença do usuário e o timestamp de chegada no registro da instância do evento
        occurrenceService.registerPresence(
            occurrence.getId(), 
            validationDTO.getParticipantId(),
            validationTimestamp
        );

        return true;
    }
    
}
