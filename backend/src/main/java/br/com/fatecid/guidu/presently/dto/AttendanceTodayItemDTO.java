package br.com.fatecid.guidu.presently.dto;

public class AttendanceTodayItemDTO {

    private Long eventId;
    private String title;
    private String time;
    private String room;
    private String professor;
    private String status;
    private String detail;
    private String checkInTime;

    public AttendanceTodayItemDTO() {
    }

    public AttendanceTodayItemDTO(
            Long eventId,
            String title,
            String time,
            String room,
            String professor,
            String status,
            String detail,
            String checkInTime) {
        this.eventId = eventId;
        this.title = title;
        this.time = time;
        this.room = room;
        this.professor = professor;
        this.status = status;
        this.detail = detail;
        this.checkInTime = checkInTime;
    }

    public Long getEventId() {
        return eventId;
    }

    public void setEventId(Long eventId) {
        this.eventId = eventId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getTime() {
        return time;
    }

    public void setTime(String time) {
        this.time = time;
    }

    public String getRoom() {
        return room;
    }

    public void setRoom(String room) {
        this.room = room;
    }

    public String getProfessor() {
        return professor;
    }

    public void setProfessor(String professor) {
        this.professor = professor;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getDetail() {
        return detail;
    }

    public void setDetail(String detail) {
        this.detail = detail;
    }

    public String getCheckInTime() {
        return checkInTime;
    }

    public void setCheckInTime(String checkInTime) {
        this.checkInTime = checkInTime;
    }
}
