package br.com.fatecid.guidu.presently.dto;

import org.locationtech.jts.geom.Polygon;

import br.com.fatecid.guidu.presently.entity.Ambient;
import br.com.fatecid.guidu.presently.mapper.GeoJsonMapper;

public class AmbientDTO {

    private Long id;
    private String name;
    private String description;
    private GeoJsonPolygonDTO area;

    public AmbientDTO() {
    }

    public AmbientDTO(Ambient ambient) {
        this.id = ambient.getId();
        this.name = ambient.getName();
        this.description = ambient.getDescription();
        this.area = GeoJsonMapper.fromPolygon(ambient.getArea());
    }

    public AmbientDTO(Long id, String name, String description, Polygon area) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.area = GeoJsonMapper.fromPolygon(area);
    }

    // Getters e setters
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

    public Polygon getArea() {
        return GeoJsonMapper.toPolygon(area);
    }

    public void setArea(Polygon area) {
        this.area = GeoJsonMapper.fromPolygon(area);
    }
}