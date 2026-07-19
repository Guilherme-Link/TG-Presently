package br.com.fatecid.guidu.presently.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import br.com.fatecid.guidu.presently.entity.EventOccurrence;

public interface EventOccurrenceRepository extends JpaRepository<EventOccurrence, Long> {

}