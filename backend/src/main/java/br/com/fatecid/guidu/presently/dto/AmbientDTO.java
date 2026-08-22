package br.com.fatecid.guidu.presently.dto;

import br.com.fatecid.guidu.presently.entity.Ambient;
import jakarta.validation.constraints.NotBlank;

public class AmbientDTO {

    private Long id;

    @NotBlank(message = "Informe o nome do ambiente.")
    private String name;

    @NotBlank(message = "Informe a descrição do ambiente.")
    private String description;

    public AmbientDTO() {
    }

    public AmbientDTO(Ambient ambient) {
        this.id = ambient.getId();
        this.name = ambient.getName();
        this.description = ambient.getDescription();
    }

    public AmbientDTO(Long id, String name, String description) {
        this.id = id;
        this.name = name;
        this.description = description;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
