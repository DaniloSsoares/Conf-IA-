import { ReportCategoryItem } from "../types/report";

// nivelRisco precisa bater com o CASE do trigger sincronizar_alerta_colaborativo (A.10):
// se mudar aqui, mude lá também, senão o reporte e o alerta dele mostram riscos diferentes

export const REPORT_CATEGORIES: ReportCategoryItem[] = [
  {
    id: "alagamento",
    label: "Flooding",
    icon: "water-outline",
    nivelRisco: "alto",
  },
  {
    id: "deslizamento",
    label: "Landslide",
    icon: "triangle-outline",
    nivelRisco: "alto",
  },
  {
    id: "bloqueio_via",
    label: "Blocked road",
    icon: "ban-outline",
    nivelRisco: "moderado",
  },
  {
    id: "fogo_em_mata",
    label: "Wildfire",
    icon: "flame-outline",
    nivelRisco: "alto",
  },
  {
    id: "queda_de_galho",
    label: "Fallen branch",
    icon: "leaf-outline",
    nivelRisco: "moderado",
  },
  {
    id: "falta_de_luz",
    label: "Power outage",
    icon: "flash-off-outline",
    nivelRisco: "baixo",
  },
  {
    id: "outro",
    label: "Other",
    icon: "ellipsis-horizontal",
    nivelRisco: "moderado",
    fullWidth: true,
  },
];
