import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import {
  Box,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Alert,
  Stack,
  Typography,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

type Inputs = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export default function RegisterForm() {
  const [submitted, setSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<Inputs>();

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    console.log("submitting", data);
    setSubmitted(false);
    try {
      // Simula chamada API
      await new Promise((r) => setTimeout(r, 700));
      setSubmitted(true);
      reset();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      sx={{ maxWidth: 480 }}
    >
      <Stack spacing={2}>
        <Typography variant="h6">Criar conta</Typography>

        <TextField
          label="Nome completo"
          placeholder="Seu nome"
          error={!!errors.name}
          helperText={errors.name ? String(errors.name.message) : ""}
          {...register("name", { required: "Nome completo é obrigatório" })}
          fullWidth
        />

        <TextField
          label="Email"
          placeholder="seu@email.com"
          error={!!errors.email}
          helperText={errors.email ? String(errors.email.message) : ""}
          {...register("email", {
            required: "Email é obrigatório",
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "Digite um email válido",
            },
          })}
          fullWidth
        />

        <TextField
          label="Senha"
          type={showPassword ? "text" : "password"}
          placeholder="Mínimo 6 caracteres"
          error={!!errors.password}
          helperText={errors.password ? String(errors.password.message) : ""}
          {...register("password", {
            required: "Senha é obrigatória",
            minLength: {
              value: 6,
              message: "Senha precisa ter ao menos 6 caracteres",
            },
          })}
          fullWidth
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label={
                      showPassword ? "Ocultar senha" : "Mostrar senha"
                    }
                    onClick={() => setShowPassword((s) => !s)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />

        <TextField
          label="Confirmar senha"
          type={showPassword ? "text" : "password"}
          placeholder="Digite novamente a senha"
          error={!!errors.confirmPassword}
          helperText={
            errors.confirmPassword ? String(errors.confirmPassword.message) : ""
          }
          {...register("confirmPassword", {
            required: "Confirme sua senha",
            validate: (value) =>
              value === watch("password") || "As senhas não conferem",
          })}
          fullWidth
        />

        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? "Enviando..." : "Cadastrar"}
          </Button>
        </Box>

        {submitted && (
          <Alert severity="success">Cadastro realizado com sucesso.</Alert>
        )}
      </Stack>
    </Box>
  );
}
