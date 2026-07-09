package br.com.fatecid.guidu.presently.dto;

public class QrCodeValidationDTO {

    private int eventId;
    private String validationCode;
    // TODO (Gui): Adicionar campos de biometria e de geolocalização

    public QrCodeValidationDTO() {
    }

    public QrCodeValidationDTO(
                        int eventId,
                        String validationCode
                    ) {

        this.eventId = eventId;
        this.validationCode = validationCode;
        }

    public int getEventId() {
        return eventId;
    }

    public void setEventId(int eventId) {
        this.eventId = eventId;
    }

    public String getValidationCode() {
        return validationCode;
    }

    public void setValidationCode(String validationCode) {
        this.validationCode = validationCode;
    }

}