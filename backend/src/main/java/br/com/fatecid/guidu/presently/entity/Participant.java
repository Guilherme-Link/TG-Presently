package br.com.fatecid.guidu.presently.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.Column;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "participants")
public class Participant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(nullable = false)
    private boolean canBeResponsible;

    // Relacionamento entre o participante e o usuário do sistema correspondente
    @OneToOne(mappedBy = "participant")
    private User user;

    // Relacionamento para retornar os eventos pelo qual o participante é responsável
    @OneToMany(mappedBy = "responsible")
    private List<Event> responsibleEvents = new ArrayList<>();

    // Relacionamento para retornar os eventos dos quais participa
    @ManyToMany(mappedBy = "participants")
    private Set<Event> participatingEvents = new HashSet<>();

    public Participant() {
    }

    public Participant(String name, User user) {
        this.name = name;
        this.user = user;
    }

    public boolean isActive(){
        if (user != null) return true;
        else return false;
    }

    // Getters e Setters

    public User getUser(){
        return user;
    }

    public void setUser(User user){
        this.user = user;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public boolean isCanBeResponsible() {
        return canBeResponsible;
    }

    public void setCanBeResponsible(boolean canBeResponsible) {
        this.canBeResponsible = canBeResponsible;
    }

    // A listagem de eventos como responsável e participante por enquanto são somente leitura

    public List<Event> getResponsibleEvents() {
        return responsibleEvents;
    }

    public Set<Event> getParticipatingEvents() {
        return participatingEvents;
    }

}