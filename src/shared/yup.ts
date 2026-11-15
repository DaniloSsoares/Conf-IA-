import * as yup from "yup";

export const loginSchema = yup.object({
  email: yup.string().email("Email inválido").required("Informe seu email"),
  password: yup
    .string()
    .min(6, "Senha deve ter pelo menos 6 caracteres")
    .required("Informe sua senha"),
});

export const registerSchema = yup.object({
  email: yup.string().email("Email inválido").required("Informe seu email"),
  password: yup
    .string()
    .min(6, "Senha deve ter pelo menos 6 caracteres")
    .required("Informe sua senha"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "As senhas não coincidem") // Valida se é igual ao password
    .required("Confirme sua senha"),
});

export const profileSchema = yup.object({
  name: yup.string().required("Informe seu nome"),
  cellphone: yup
    .string()
    .required("Informe seu telefone")
    .test(
      "telefone-br-valido",
      "Digite um telefone válido com DDD",
      (value) => {
        if (!value) return false;
        const digitos = value.replace(/\D/g, "");

        // Deve ter 10 (fixo) ou 11 (celular) dígitos
        if (digitos.length !== 10 && digitos.length !== 11) return false;

        // Bloqueia sequências repetidas como (11) 11111-1111
        if (/^(\d)\1+$/.test(digitos)) return false;

        // Valida DDD brasileiro (11 a 99, sem 0)
        const ddd = Number(digitos.slice(0, 2));
        if (ddd < 11 || ddd > 99 || digitos[0] === "0" || digitos[1] === "0")
          return false;

        // Celular (11 dígitos) precisa começar com 9 após o DDD
        if (digitos.length === 11 && digitos[2] !== "9") return false;

        // Fixo (10 dígitos) precisa começar entre 2 e 5 após o DDD
        if (digitos.length === 10 && !["2", "3", "4", "5"].includes(digitos[2]))
          return false;

        return true;
      },
    ),
  city: yup.string().required("Informe sua cidade"),
  state: yup.string().required("Informe seu estado"),
});

export const changePassSchema = yup.object({
  password: yup
    .string()
    .min(6, "Senha deve ter pelo menos 6 caracteres")
    .required("Informe sua senha"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "As senhas não coincidem")
    .required("Confirme sua senha"),
});

export const validateComent = yup.object({
  comentario: yup
    .string()
    .trim()
    .max(500, "O comentário pode ter no máximo 500 caracteres")
    .default(""),
});
