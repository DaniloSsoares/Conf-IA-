import { ReportCategoryItem } from "../types/report";

// nivelRisco precisa bater com o CASE do trigger sincronizar_alerta_colaborativo (A.10):
// se mudar aqui, mude lá também, senão o reporte e o alerta dele mostram riscos diferentes

export const REPORT_CATEGORIES: ReportCategoryItem[] = [
  {
    id: "alagamento",
    label: "Alagamento",
    icon: "water-outline",
    nivelRisco: "alto",
    validadeHoras: 8
  },
  {
    id: "deslizamento",
    label: "Deslizamento",
    icon: "triangle-outline",
    nivelRisco: "alto",
    validadeHoras: 24
  },
  {
    id: "bloqueio_via",
    label: "Via bloqueada",
    icon: "ban-outline",
    nivelRisco: "moderado",
    validadeHoras: 4
  },
  {
    id: "fogo_em_mata",
    label: "Fogo em mata",
    icon: "flame-outline",
    nivelRisco: "alto",
    validadeHoras: 12
  },
  {
    id: "queda_de_galho",
    label: "Queda de galho",
    icon: "leaf-outline",
    nivelRisco: "moderado",
    validadeHoras: 12
  },
  {
    id: "falta_de_luz",
    label: "Falta de luz",
    icon: "flash-off-outline",
    nivelRisco: "baixo",
    validadeHoras: 12
  },
  {
    id: "outro",
    label: "Outro",
    icon: "ellipsis-horizontal",
    nivelRisco: "moderado",
    fullWidth: true,
    validadeHoras: 6
  },
];
