// Foto escolhida pelo usuário, pronta para upload (base64) e para preview (uri)
export interface SelectedPhoto {
  uri: string;
  base64?: string;
  ext: string;
}
