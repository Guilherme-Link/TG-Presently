import { heatmapDays, heatmapMatrix, heatmapTitle } from "./dashboardData";

export const adminStats = [
  {
    id: "alunos",
    title: "Total de alunos",
    value: "342",
    description: "16 turmas ativas",
    tone: "neutral",
  },
  {
    id: "faltas",
    title: "Faltas hoje",
    value: "47",
    description: "vs. 38 ontem",
    tone: "danger",
  },
  {
    id: "frequencia",
    title: "Frequência média",
    value: "84%",
    description: "acima do mínimo",
    tone: "success",
  },
  {
    id: "risco",
    title: "Alunos em risco",
    value: "12",
    description: "acima de 50% das faltas",
    tone: "danger",
  },
];

export const adminSidebarSections = [
  {
    title: "Gestão",
    items: [
      {
        id: "painel-geral-link",
        label: "Dashboard",
        icon: "dashboard",
        to: "dashboardAdmin",
      },
      {
        id: "historico-eventos-link",
        label: "Histórico de eventos",
        icon: "report",
        to: "/relatorio",
      },
      {
        id: "tendencias-link",
        label: "Tendências",
        icon: "trending",
        to: "#tendencias",
      },
      { id: "salas-link", label: "Salas", icon: "rooms", to: "salas" },
      { id: "terminais-link", label: "Terminais / Quiosques", icon: "devices", to: "terminais" },
      { id: "eventos-link", label: "Eventos", icon: "calendar", to: "eventos" },
      {
        id: "usuarios-link",
        label: "Usuarios",
        icon: "users",
        to: "usuarios",
      },
    ],
  },
  {
    title: "Sistema",
    items: [
      {
        id: "configuracoes-link",
        label: "Configurações",
        icon: "settings",
        to: "#configuracoes",
      },
      { id: "sair-link", label: "Sair", icon: "logout", to: "/login" },
    ],
  },
];

export const adminTrendCards = [
  {
    id: "maior-pico",
    title: "Maior pico",
    value: "2ª feira",
    description: "18% acima da média semanal",
    tone: "danger",
  },
  {
    id: "turma-estavel",
    title: "Turma mais estável",
    value: "ADS 3A",
    description: "Frequência constante há 6 semanas",
    tone: "success",
  },
  {
    id: "alertas",
    title: "Alertas ativos",
    value: "08",
    description: "Coordenação e professores notificados",
    tone: "warning",
  },
];

export const adminAbsenceHighlights = [
  {
    id: 1,
    name: "Programação Orientada a Objetos",
    value: 23,
  },
  {
    id: 2,
    name: "Interação Humano Computador",
    value: 18,
  },
  {
    id: 3,
    name: "Algoritmos",
    value: 15,
  },
  {
    id: 4,
    name: "Engenharia de Software II",
    value: 8,
  },
];

export const adminRoomStatus = [
  {
    id: "sala-01",
    room: "Sala 01",
    occupancy: "87%",
    nextClass: "POO • 19:00",
    status: "Alta ocupação",
  },
  {
    id: "sala-02",
    room: "Sala 02",
    occupancy: "62%",
    nextClass: "IHC • 19:50",
    status: "Disponível em 1 turno",
  },
  {
    id: "laboratorio",
    room: "Lab. Web",
    occupancy: "94%",
    nextClass: "Web • 20:50",
    status: "Quase cheio",
  },
];

export const adminSchedule = [
  {
    id: 1,
    time: "19:00",
    subject: "Engenharia de Software II",
    room: "Sala 01",
    professor: "Prof. Guilherme",
  },
  {
    id: 2,
    time: "19:50",
    subject: "Interação Humano Computador",
    room: "Sala 02",
    professor: "Prof. Marina",
  },
  {
    id: 3,
    time: "20:50",
    subject: "Algoritmos",
    room: "Lab. Web",
    professor: "Prof. Augusto",
  },
  {
    id: 4,
    time: "21:40",
    subject: "Desenvolvimento Web",
    room: "Lab. Web",
    professor: "Prof. Augusto",
  },
];

export const adminUsers = [
  {
    id: 1,
    name: "Camila Souza",
    role: "Coordenadora",
    status: "Online",
  },
  {
    id: 2,
    name: "Roberto Lima",
    role: "Professor",
    status: "Sincronizando",
  },
  {
    id: 3,
    name: "Beatriz Alves",
    role: "Secretaria",
    status: "Atualizado",
  },
];

export const adminSettings = [
  {
    id: "alertas",
    label: "Alertas automáticos",
    description: "Notificar quando a turma ultrapassar o limite de faltas.",
    enabled: true,
  },
  {
    id: "qr",
    label: "QR Code por aula",
    description: "Permitir geração automática de códigos por disciplina.",
    enabled: true,
  },
  {
    id: "relatorios",
    label: "Relatórios semanais",
    description: "Enviar resumo consolidado por e-mail.",
    enabled: false,
  },
];

export { heatmapDays, heatmapMatrix, heatmapTitle as adminHeatmapTitle };
