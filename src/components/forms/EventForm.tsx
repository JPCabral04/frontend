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
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  googleEventId: string;
};

export default function EventForm() {
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<Inputs>();

  const startDate = watch("startDate");

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    console.log("submitting", data);
    setSubmitted(false);
    try {
      await new Promise((resolve) => setTimeout(resolve, 700));
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
        <Typography variant="h6">Criar evento</Typography>

        <TextField
          label="Título"
          placeholder="Ex.: Reunião com o grupo"
          error={!!errors.title}
          helperText={errors.title ? String(errors.title.message) : ""}
          {...register("title", { required: "Título é obrigatório" })}
          fullWidth
        />

        <TextField
          label="Descrição"
          placeholder="Detalhes do evento"
          error={!!errors.description}
          helperText={
            errors.description ? String(errors.description.message) : ""
          }
          {...register("description")}
          fullWidth
          multiline
          minRows={3}
        />

        <TextField
          label="Início"
          type="date"
          error={!!errors.startDate}
          helperText={errors.startDate ? String(errors.startDate.message) : ""}
          {...register("startDate", {
            required: "Data de início é obrigatória",
          })}
          fullWidth
          slotProps={{ inputLabel: { shrink: true } }}
        />

        <TextField
          label="Fim"
          type="date"
          error={!!errors.endDate}
          helperText={errors.endDate ? String(errors.endDate.message) : ""}
          {...register("endDate", {
            required: "Data de término é obrigatória",
            validate: (value) =>
              !startDate ||
              value >= startDate ||
              "A data final deve ser igual ou posterior ao início",
          })}
          fullWidth
          slotProps={{ inputLabel: { shrink: true } }}
        />

        <TextField
          label="ID do evento Google"
          placeholder="Ex.: 1a2b3c4d"
          error={!!errors.googleEventId}
          helperText={
            errors.googleEventId ? String(errors.googleEventId.message) : ""
          }
          {...register("googleEventId")}
          fullWidth
        />

        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? "Enviando..." : "Cadastrar"}
          </Button>
        </Box>

        {submitted && (
          <Alert severity="success">Evento cadastrado com sucesso.</Alert>
        )}
      </Stack>
    </Box>
  );
}
