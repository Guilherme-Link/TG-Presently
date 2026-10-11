package br.com.fatecid.guidu.presently.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Table;

import jakarta.persistence.Column;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

//Entidade que representa os ambientes a serem validados (As "salas de aula")
@Entity
@Table(name = "terminals")
public class Terminal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String terminalId;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(nullable = false)
    private boolean approved;

    // Relacionamento para vincular o ambiente onde esse terminal está
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ambient_id")
    private Ambient ambient;

    public Terminal() {
    }

    public Terminal(String terminalId, String name, Ambient ambient) {
        this.terminalId = terminalId;
        this.name = name;
        this.approved = false;
        this.ambient = ambient;
    }

    // Getters e Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTerminalId() {
        return terminalId;
    }

    public void setTerminalId(String terminalId) {
        this.terminalId = terminalId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public boolean isApproved() {
        return approved;
    }

    public void setApproved(boolean approved) {
        this.approved = approved;
    }

    public Ambient getAmbient() {
        return ambient;
    }

    public void setAmbient(Ambient ambient) {
        this.ambient = ambient;
    }

}