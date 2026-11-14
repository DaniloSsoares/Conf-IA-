import { ReportCategoryItem } from "../types/report";

// nivelRisco precisa bater com o CASE do trigger sincronizar_alerta_colaborativo (A.10):
// se mudar aqui, mude lá também, senão o reporte e o alerta dele mostram riscos diferentes

export const REPORT_CATEGORIES: ReportCategoryItem[] = [
  {
    id: "alagamento",
    label: "Alagamento",
    icon: "water-outline",
    nivelRisco: "alto",
  },
  {
    id: "deslizamento",
    label: "Deslizamento",
    icon: "triangle-outline",
    nivelRisco: "alto",
  },
  {
    id: "bloqueio_via",
    label: "Via bloqueada",
    icon: "ban-outline",
    nivelRisco: "moderado",
  },
  {
    id: "fogo_em_mata",
    label: "Fogo em mata",
    icon: "flame-outline",
    nivelRisco: "alto",
  },
  {
    id: "queda_de_galho",
    label: "Queda de galho",
    icon: "leaf-outline",
    nivelRisco: "moderado",
  },
  {
    id: "falta_de_luz",
    label: "Falta de luz",
    icon: "flash-off-outline",
    nivelRisco: "baixo",
  },
  {
    id: "outro",
    label: "Outro",
    icon: "ellipsis-horizontal",
    nivelRisco: "moderado",
    fullWidth: true,
  },
];
