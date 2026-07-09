package br.com.fatecid.guidu.presently.dto;

public class QrCodeRenderingDTO {

    private byte[] imageData;
    private int width;
    private int height;
    private long generationTime;
    private long expirationTime;

    public QrCodeRenderingDTO() {
    }

    public QrCodeRenderingDTO(
                        byte[] imageData, 
                        int width, 
                        int height,
                        long generationTime,
                        long expirationTime
                    ) {

        this.imageData = imageData;
        this.width = width;
        this.height = height;
        this.generationTime = generationTime;
        this.expirationTime = expirationTime;
    }

    public byte[] getImageData() {
        return imageData;
    }

    public void setImageData(byte[] imageData) {
        this.imageData = imageData;
    }

    public int getWidth() {
        return width;
    }

    public void setWidth(int width) {
        this.width = width;
    }

    public int getHeight() {
        return height;
    }

    public void setHeight(int height) {
        this.height = height;
    }

    public long getGenerationTime() {
        return generationTime;
    }

    public void setGenerationTime(long generationTime) {
        this.generationTime = generationTime;
    }

    public long getExpirationTime() {
        return expirationTime;
    }

    public void setExpirationTime(long expirationTime) {
        this.expirationTime = expirationTime;
    }

}