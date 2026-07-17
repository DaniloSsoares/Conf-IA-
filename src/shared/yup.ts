import * as yup from 'yup';

export const loginSchema = yup.object({
  email: yup.string().email("Email inválido").required("Informe seu email"),
  password: yup.string().min(6, "Senha deve ter pelo menos 6 caracteres").required("Informe sua senha"),
});


export const registerSchema = yup.object({
  email: yup.string().email("Email inválido").required("Informe seu email"),
  password: yup.string().min(6, "Senha deve ter pelo menos 6 caracteres").required("Informe sua senha"),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password')], 'As senhas não coincidem') // Valida se é igual ao password
    .required("Confirme sua senha"),
});
