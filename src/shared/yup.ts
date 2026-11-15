import * as yup from 'yup';

export const loginSchema = yup.object({
  email: yup.string().email("Invalid email").required("Enter your email"),
  password: yup.string().min(6, "Password must be at least 6 characters").required("Enter your password"),
});


export const registerSchema = yup.object({
  email: yup.string().email("Invalid email").required("Enter your email"),
  password: yup.string().min(6, "Password must be at least 6 characters").required("Enter your password"),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password')], 'Passwords do not match') // Valida se é igual ao password
    .required("Confirm your password"),
});

export const profileSchema = yup.object({
  name: yup.string().required("Enter your name"),
  cellphone: yup.string().required("Enter your phone"),
  city: yup.string().required("Enter your city"),
  state: yup.string().required("Enter your state"),
});

export const changePassSchema = yup.object({
  password: yup.string().min(6, "Password must be at least 6 characters").required("Enter your password"),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password')], 'Passwords do not match') 
    .required("Confirm your password"),
});

export const validateComent = yup.object({
  comentario: yup.string().trim().max(500, "Comments can have at most 500 characters").default(''),
});