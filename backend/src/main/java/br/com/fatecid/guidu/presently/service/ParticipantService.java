package br.com.fatecid.guidu.presently.service;

import br.com.fatecid.guidu.presently.dto.ParticipantDTO;
import br.com.fatecid.guidu.presently.entity.Participant;
import br.com.fatecid.guidu.presently.repository.ParticipantRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ParticipantService {

    private final ParticipantRepository participantRepository;

    public ParticipantService(ParticipantRepository participantRepository) {
        this.participantRepository = participantRepository;
    }

    public List<ParticipantDTO> findAll() {
        return participantRepository.findAll()
                .stream()
                .map(this::toDTO)
                .toList();
    }

    public ParticipantDTO findById(Long id) {
        Participant participant = participantRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Participante não encontrado com o id: " + id)
                );

        return toDTO(participant);
    }

    public ParticipantDTO create(ParticipantDTO dto) {

        if (participantRepository.existsByName(dto.getName())) {
            throw new RuntimeException("Já existe um participante com esse nome");
        }

        Participant participant = new Participant();

        participant.setName(dto.getName());

        Participant savedParticipant = participantRepository.save(participant);

        return toDTO(savedParticipant);
    }

    public ParticipantDTO update(Long id, ParticipantDTO dto) {

        Participant participant = participantRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Participante não encontrado com o id: " + id)
                );

        if (!participant.getName().equals(dto.getName())
                && participantRepository.existsByName(dto.getName())) {

            throw new RuntimeException("Já existe um participante com esse nome");
        }

        participant.setName(dto.getName());

        Participant updatedParticipant = participantRepository.save(participant);

        return toDTO(updatedParticipant);
    }

    private ParticipantDTO toDTO(Participant participant) {
        return new ParticipantDTO(
                participant.getId(),
                participant.getName()
        );
    }
}