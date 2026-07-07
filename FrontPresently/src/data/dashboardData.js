export const statistics = [
  {
    id: "faltas-totais",
    title: "Faltas totais",
    value: 24,
    description: "5 disciplinas",
    valueColor: "var(--color-primary)",
  },
  {
    id: "frequencia-media",
    title: "Frequência média",
    value: "87%",
    description: "acima do mínimo",
    valueColor: "var(--color-success)",
  },
  {
    id: "aulas-hoje",
    title: "Aulas hoje",
    value: 4,
    description: "A partir das 19:00",
    valueColor: "var(--color-text)",
  },
  {
    id: "presencas-confirmadas",
    title: "Presenças confirmadas",
    value: 24,
    description: "Neste semestre",
    valueColor: "var(--color-primary)",
  },
];

export const classes = [
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
    subject: "Engenharia de Software II",
    room: "Sala 01",
    professor: "Prof. Guilherme",
  },
  {
    id: 3,
    time: "20:50",
    subject: "Engenharia de Software II",
    room: "Sala 01",
    professor: "Prof. Guilherme",
  },
  {
    id: 4,
    time: "21:40",
    subject: "Engenharia de Software II",
    room: "Sala 01",
    professor: "Prof. Guilherme",
  },
];

export const shortcuts = [
  {
    id: "relatorio-faltas",
    label: "Relatório de faltas",
    icon: "report",
  },
  {
    id: "grade-aulas",
    label: "Grade de aulas",
    icon: "calendar",
  },
];

export const sidebarNavAluno = [
  { id: "dashboard", label: "Dashboard", icon: "dashboard", path: "/dashboard" },
  { id: "presenca", label: "Marcar presença", icon: "check", path: "/presenca" },
  { id: "relatorio", label: "Relatório de faltas", icon: "report", path: "/relatorio" },
  { id: "grade", label: "Grade de aulas", icon: "calendar", path: "/grade" },
];

export const sidebarNavConta = [
  { id: "perfil", label: "Perfil", icon: "user", path: "/perfil" },
  { id: "sair", label: "Sair", icon: "logout", path: "/logout" },
];

export const bottomNavItems = [
  { id: "dashboard", label: "Dashboard", icon: "home", path: "/dashboard" },
  { id: "scan", label: "Scan", icon: "qrcode", path: "/scan" },
  { id: "perfil", label: "Perfil", icon: "user", path: "/perfil" },
];

export const heatmapDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export const heatmapMatrix = [
  [0, 1, 2, 4, 1, 0, 0],
  [1, 2, 3, 2, 4, 1, 0],
  [0, 3, 4, 2, 1, 0, 0],
  [2, 1, 0, 3, 2, 1, 0],
  [1, 0, 2, 4, 3, 2, 0],
];

export const heatmapTitle = "Heatmap de faltas · Junho 2025";
