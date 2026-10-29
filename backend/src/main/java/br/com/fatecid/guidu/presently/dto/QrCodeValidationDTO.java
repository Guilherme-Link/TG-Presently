package br.com.fatecid.guidu.presently.dto;

import java.time.LocalDateTime;

public class QrCodeValidationDTO {

    private long eventId;

    private long participantId;

    private double userLatitude;

    private double userLongitude;

    private double userLocationAccuracyMeters;

    private String validationCode;
    
    private LocalDateTime validationTimestamp;

    // TODO (Gui): Adicionar campos de biometria

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

    public double getUserLatitude() {
        return userLatitude;
    }

    public void setUserLatitude(double UserLatitude) {
        this.userLatitude = UserLatitude;
    }

    public double getUserLongitude() {
        return userLongitude;
    }

    public void setUserLongitude(double UserLongitude) {
        this.userLongitude = UserLongitude;
    }

    public double getUserLocationAccuracyMeters() {
        return userLocationAccuracyMeters;
    }

    public void setUserLocationAccuracyMeters(double userLocationAccuracyMeters) {
        this.userLocationAccuracyMeters = userLocationAccuracyMeters;
    }

    public long getParticipantId() {
        return participantId;
    }

    public void setParticipantId(long ParticipantId) {
        this.participantId = ParticipantId;
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
