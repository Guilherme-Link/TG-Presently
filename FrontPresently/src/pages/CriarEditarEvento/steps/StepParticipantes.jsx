import Button from "../../../components/Button/Button";
import { MdAdd } from "react-icons/md";

function StepParticipantes({ onOpenParticipants, onOpenParticipantLists }) {
  return (
    <div className="evt-step">
      <p className="evt-step__description">
        Adicione participantes individuais ou aplique uma lista. O participante escolhido como
        responsável não aparece nessa seleção.
      </p>

      <div className="evt-step__actions-row">
        <Button variant="outline" onClick={onOpenParticipants}>
          <MdAdd size={16} />
          adicionar participantes
        </Button>

        <Button variant="outline" onClick={onOpenParticipantLists}>
          <MdAdd size={16} />
          adicionar lista de participantes
        </Button>
      </div>
    </div>
  );
}

export default StepParticipantes;
