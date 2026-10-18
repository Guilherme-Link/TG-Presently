package br.com.fatecid.guidu.presently.dto;

import br.com.fatecid.guidu.presently.entity.Terminal;

public record TerminalDTO(
    Long id,
    String terminalId,
    String name,
    boolean approved,
    Long ambientId
) {

    public TerminalDTO(Terminal terminal){
        this(
            terminal.getId(),
            terminal.getTerminalId(),
            terminal.getName(),
            terminal.isApproved(),
            (
                terminal.getAmbient() == null 
                ? null
                : terminal.getAmbient().getId()
            )
        );
    }

}