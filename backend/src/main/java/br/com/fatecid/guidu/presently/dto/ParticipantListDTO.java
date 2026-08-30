package br.com.fatecid.guidu.presently.dto;

import java.util.Set;

public record ParticipantListDTO(
    Long id,
    String name,
    Set<Long> participantIds
) {
}