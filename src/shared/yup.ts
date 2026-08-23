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

export const profileSchema = yup.object({
  name: yup.string().required("Informe seu nome"),
  cellphone: yup.string().required("Informe seu telefone"),
  city: yup.string().required("Informe sua cidade"),
  state: yup.string().required("Informe seu estado"),
});

export const changePassSchema = yup.object({
  password: yup.string().min(6, "Senha deve ter pelo menos 6 caracteres").required("Informe sua senha"),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password')], 'As senhas não coincidem') 
    .required("Confirme sua senha"),
});