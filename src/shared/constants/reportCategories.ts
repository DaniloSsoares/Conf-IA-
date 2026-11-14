import { ReportCategoryItem } from "../types/report";

export const REPORT_CATEGORIES: ReportCategoryItem[] = [
  {
    id: "alagamento",
    label: "Flooding",
    icon: "water-outline",
  },
  {
    id: "deslizamento",
    label: "Landslide",
    icon: "triangle-outline",
  },
  {
    id: "bloqueio_via",
    label: "Blocked road",
    icon: "ban-outline",
  },
  {
    id: "fogo_em_mata",
    label: "Wildfire",
    icon: "flame-outline",
  },
  {
    id: "queda_de_galho",
    label: "Fallen branch",
    icon: "leaf-outline",
  },
  {
    id: "falta_de_luz",
    label: "Power outage",
    icon: "flash-off-outline",
  },
  {
    id: "outro",
    label: "Other",
    icon: "ellipsis-horizontal",
    fullWidth: true,
  },
];
