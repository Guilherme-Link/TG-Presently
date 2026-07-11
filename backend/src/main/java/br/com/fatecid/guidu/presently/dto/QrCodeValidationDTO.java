package br.com.fatecid.guidu.presently.dto;

import java.time.LocalDateTime;

public class QrCodeValidationDTO {

    private long eventId;

    private long userId;

    private String validationCode;
    
    private LocalDateTime validationTimestamp;

    // TODO (Gui): Adicionar campos de biometria e de geolocalização

    public QrCodeValidationDTO() {
    }

    public QrCodeValidationDTO(
                        int eventId,
                        String validationCode,
                        LocalDateTime validationTimestamp
                    ) {

        this.eventId = eventId;
        this.validationCode = validationCode;
        }

    public long getEventId() {
        return eventId;
    }

    public void setEventId(long eventId) {
        this.eventId = eventId;
    }

    public long getUserId() {
        return userId;
    }

    public void setUserId(long UserId) {
        this.userId = UserId;
    }

    public String getValidationCode() {
        return validationCode;
    }

    public void setValidationCode(String validationCode) {
        this.validationCode = validationCode;
    }

    public LocalDateTime getValidationTimestamp() {
        return validationTimestamp;
    }

    public void setValidationTimestamp(LocalDateTime validationTimestamp) {
        this.validationTimestamp = validationTimestamp;
    }

}