package br.com.fatecid.guidu.presently.repository;

import br.com.fatecid.guidu.presently.entity.ParticipantList;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ParticipantListRepository extends JpaRepository<ParticipantList, Long> {
}