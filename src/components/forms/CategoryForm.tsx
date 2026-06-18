import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import {
  Box,
  TextField,
  Button,
  Alert,
  Stack,
  Typography,
} from "@mui/material";

type Inputs = {
  name: string;
  hexColor: string;
  moduleType: string;
};

export default function CategoryForm() {
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<Inputs>({
    defaultValues: {
      hexColor: "#4f46e5",
    },
  });

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    console.log("submitting", data);
    setSubmitted(false);
    try {
      await new Promise((resolve) => setTimeout(resolve, 700));
      setSubmitted(true);
      reset({ hexColor: "#4f46e5" });
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
        <Typography variant="h6">Criar categoria</Typography>

        <TextField
          label="Nome da categoria"
          placeholder="Ex.: Trabalho"
          error={!!errors.name}
          helperText={errors.name ? String(errors.name.message) : ""}
          {...register("name", { required: "Nome da categoria é obrigatório" })}
          fullWidth
        />

        <TextField
          label="Cor hexadecimal"
          placeholder="#4f46e5"
          error={!!errors.hexColor}
          helperText={errors.hexColor ? String(errors.hexColor.message) : ""}
          {...register("hexColor", {
            required: "Cor hexadecimal é obrigatória",
            pattern: {
              value: /^#(?:[0-9a-fA-F]{3}){1,2}$/,
              message: "Digite uma cor válida no formato hexadecimal",
            },
          })}
          fullWidth
        />

        <TextField
          label="Tipo de módulo"
          placeholder="Ex.: agenda, finanças ou hábitos"
          error={!!errors.moduleType}
          helperText={
            errors.moduleType ? String(errors.moduleType.message) : ""
          }
          {...register("moduleType", {
            required: "Tipo de módulo é obrigatório",
          })}
          fullWidth
        />

        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? "Enviando..." : "Cadastrar"}
          </Button>
        </Box>

        {submitted && (
          <Alert severity="success">Categoria cadastrada com sucesso.</Alert>
        )}
      </Stack>
    </Box>
  );
}
