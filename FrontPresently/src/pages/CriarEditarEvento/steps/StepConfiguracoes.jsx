import FormField from "../../../components/FormField/FormField";
import { DEFAULT_INTERVAL_DAYS, EVENT_TYPE_OPTIONS } from "../../../data/eventsData";

function StepConfiguracoes({ values, errors, setField }) {
  return (
    <div className="evt-step">
      <div className="evt-step__row">
        <FormField
          label="Tipo do evento"
          as="select"
          required
          options={EVENT_TYPE_OPTIONS}
          value={values.eventType}
          error={errors.eventType}
          onChange={(e) => setField("eventType", e.target.value)}
        />
      </div>

      <div className="evt-step__row">
        <FormField
          label="Data inicial"
          mask="date"
          required
          value={values.startDate}
          error={errors.startDate}
          placeholder="dd/mm/aaaa"
          onChange={(e) => setField("startDate", e.target.value)}
        />

        <FormField
          label="Data final"
          mask="date"
          required
          value={values.endDate}
          error={errors.endDate}
          placeholder="dd/mm/aaaa"
          onChange={(e) => setField("endDate", e.target.value)}
        />
      </div>

      <div className="evt-step__row">
        <FormField
          label="Hora inicio"
          mask="time"
          value={values.startTime}
          placeholder="hh:mm"
          error={errors.startTime}
          onChange={(e) => setField("startTime", e.target.value)}
        />

        <FormField
          label="Hora fim"
          mask="time"
          value={values.endTime}
          placeholder="hh:mm"
          error={errors.endTime}
          onChange={(e) => setField("endTime", e.target.value)}
        />
      </div>

      {values.eventType === "RECURRING" && (
        <div className="evt-step__row">
          <FormField
            label="Intervalo da recorrência (dias)"
            mask="number"
            required
            value={values.intervalDays}
            error={errors.intervalDays}
            placeholder={DEFAULT_INTERVAL_DAYS}
            onChange={(e) => setField("intervalDays", e.target.value)}
          />

          <div className="evt-step__hint">
            Os eventos recorrentes usam esse intervalo para repetir a ocorrência.
          </div>
        </div>
      )}
    </div>
  );
}

export default StepConfiguracoes;
