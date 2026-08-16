import { ReportCategoryItem } from "../types/report";

export const REPORT_CATEGORIES: ReportCategoryItem[] = [
  {
    id: "alagamento",
    label: "Alagamento",
    icon: "water-outline",
  },
  {
    id: "deslizamento",
    label: "Deslizamento",
    icon: "triangle-outline",
  },
  {
    id: "via_bloqueada",
    label: "Via bloqueada",
    icon: "ban-outline",
  },
  {
    id: "fogo_em_mata",
    label: "Fogo em mata",
    icon: "flame-outline",
  },
  {
    id: "queda_de_galho",
    label: "Queda de galho",
    icon: "leaf-outline",
  },
  {
    id: "falta_de_luz",
    label: "Falta de luz",
    icon: "flash-off-outline",
  },
  {
    id: "outro",
    label: "Outro",
    icon: "ellipsis-horizontal",
    fullWidth: true,
  },
];
