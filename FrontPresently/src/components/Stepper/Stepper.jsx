import { MdCheck } from "react-icons/md";
import "./Stepper.css";

const STEP_LABELS = [
  { number: 1, title: "Dados iniciais" },
  { number: 2, title: "Configuracoes" },
  { number: 3, title: "Participantes" },
];

function Stepper({ currentStep }) {
  return (
    <div className="evt-stepper">
      <div className="evt-stepper__dots">
        {STEP_LABELS.map((step, index) => {
          const isDone = step.number < currentStep;
          const isActive = step.number === currentStep;

          return (
            <div className="evt-stepper__dot-wrap" key={step.number}>
              <span
                className={`evt-stepper__dot ${isActive ? "evt-stepper__dot--active" : ""} ${
                  isDone ? "evt-stepper__dot--done" : ""
                }`}
              >
                {isDone ? <MdCheck size={14} /> : step.number}
              </span>
              {index < STEP_LABELS.length - 1 && (
                <span className={`evt-stepper__line ${isDone ? "evt-stepper__line--done" : ""}`} />
              )}
            </div>
          );
        })}
      </div>

      <span className="evt-stepper__label">
        {currentStep} &bull; {STEP_LABELS[currentStep - 1].title}
      </span>
    </div>
  );
}

export default Stepper;
