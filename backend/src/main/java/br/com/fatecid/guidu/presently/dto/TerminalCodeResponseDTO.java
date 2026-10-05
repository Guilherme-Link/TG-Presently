package br.com.fatecid.guidu.presently.dto;

public record TerminalCodeResponseDTO(
    String code,
    int waitSeconds
) {
}