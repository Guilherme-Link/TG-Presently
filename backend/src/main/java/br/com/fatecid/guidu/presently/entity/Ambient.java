package br.com.fatecid.guidu.presently.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;

import java.util.ArrayList;
import java.util.List;

import org.locationtech.jts.geom.Polygon;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;

//Entidade que representa os ambientes a serem validados (As "salas de aula")
@Entity
@Table(name = "ambients")
public class Ambient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(nullable = false, unique = true)
    private String description;

    // Coluna para armazenar a área do ambiente, usada para geofencing na validação dos códigos
    @Column(columnDefinition = "geometry(Polygon,4326)")
    private Polygon area;

    // Relacionamento para retornar os eventos cadastrados para o ambiente
    @OneToMany(mappedBy = "ambient", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Event> events = new ArrayList<>();

    public Ambient() {
    }

    public Ambient(String name, String description) {
        this.name = name;
        this.description = description;
    }

    // Getters e Setters
    public Long getId() {
        return id;
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
        return area;
    }

    public void setArea(Polygon area) {
        this.area = area;
    }

    public List<Event> getEvents(){
        return events;
    }
}