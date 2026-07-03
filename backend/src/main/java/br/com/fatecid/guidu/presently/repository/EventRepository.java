package br.com.fatecid.guidu.presently.repository;

import br.com.fatecid.guidu.presently.entity.Event;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EventRepository extends JpaRepository<Event, Long> {
}