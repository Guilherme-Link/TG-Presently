package br.com.fatecid.guidu.presently.service;

import br.com.fatecid.guidu.presently.dto.ParticipantListDTO;
import br.com.fatecid.guidu.presently.entity.Participant;
import br.com.fatecid.guidu.presently.entity.ParticipantList;
import br.com.fatecid.guidu.presently.repository.ParticipantListRepository;
import br.com.fatecid.guidu.presently.repository.ParticipantRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;

@Service
public class ParticipantListService {

    private final ParticipantListRepository participantListRepository;
    private final ParticipantRepository participantRepository;

    public ParticipantListService(
            ParticipantListRepository participantListRepository,
            ParticipantRepository participantRepository
    ) {
        this.participantListRepository = participantListRepository;
        this.participantRepository = participantRepository;
    }

    @Transactional
    public ParticipantListDTO create(ParticipantListDTO request) {

        Set<Participant> participants =
                participantRepository.findAllById(request.participantIds())
                        .stream()
                        .collect(java.util.stream.Collectors.toSet());

        if (participants.size() != request.participantIds().size()) {
            throw new IllegalArgumentException(
                    "Um ou mais participantes não foram encontrados."
            );
        }

        ParticipantList participantList = new ParticipantList();

        participantList.setName(request.name());
        participantList.setParticipants(participants);

        ParticipantList saved = participantListRepository.save(participantList);

        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<ParticipantListDTO> findAll() {

        return participantListRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ParticipantListDTO findById(Long id) {

        ParticipantList participantList = participantListRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Lista de participantes não encontrada.")
                );

        return toResponse(participantList);
    }

    @Transactional
    public ParticipantListDTO update(
            Long id,
            ParticipantListDTO request
    ) {

        ParticipantList participantList = participantListRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Lista de participantes não encontrada.")
                );

        Set<Participant> participants =
                participantRepository.findAllById(request.participantIds())
                        .stream()
                        .collect(java.util.stream.Collectors.toSet());

        if (participants.size() != request.participantIds().size()) {
            throw new IllegalArgumentException(
                    "Um ou mais participantes não foram encontrados."
            );
        }

        participantList.setName(request.name());
        participantList.setParticipants(participants);

        ParticipantList updated =
                participantListRepository.save(participantList);

        return toResponse(updated);
    }

    @Transactional
    public void delete(Long id) {

        if (!participantListRepository.existsById(id)) {
            throw new RuntimeException(
                    "Lista de participantes não encontrada."
            );
        }

        participantListRepository.deleteById(id);
    }

    private ParticipantListDTO toResponse(
            ParticipantList participantList
    ) {

        Set<Long> participantIds = participantList.getParticipants()
                .stream()
                .map(Participant::getId)
                .collect(java.util.stream.Collectors.toSet());

        return new ParticipantListDTO(
                participantList.getId(),
                participantList.getName(),
                participantIds
        );
    }
}