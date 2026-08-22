import FormField from "../../../components/FormField/FormField";

function StepDadosIniciais({
  values,
  errors,
  setField,
  ambients,
  loadingAmbients,
}) {
  return (
    <div className="evt-step">
      <FormField
        label="Nome do evento"
        required
        value={values.name}
        error={errors.name}
        onChange={(e) => setField("name", e.target.value)}
      />

      <FormField
        label="Descricao"
        as="textarea"
        value={values.description}
        onChange={(e) => setField("description", e.target.value)}
      />

      <div className="evt-step__row">
        <FormField
          label="Responsavel"
          required
          placeholder="Informe o responsável"
          helperText="Digite o nome do responsável pelo evento."
          value={values.responsible}
          error={errors.responsible}
          onChange={(e) => setField("responsible", e.target.value)}
        />

        <FormField
          label="Local do evento"
          as="select"
          required
          options={ambients}
          value={values.location}
          error={errors.location}
          disabled={loadingAmbients}
          placeholder={loadingAmbients ? "Carregando salas..." : "Selecione uma sala"}
          onChange={(e) => setField("location", e.target.value)}
        />
      </div>
    </div>
  );
}

export default StepDadosIniciais;
