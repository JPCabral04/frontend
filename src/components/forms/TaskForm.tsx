import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  MenuItem,
  Stack,
  TextField,
  Typography,
  Alert,
} from "@mui/material";

type Inputs = {
  title: string;
  description: string;
  dueDate: string;
  priority: string;
  isCompleted: boolean;
};

export default function TaskForm() {
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<Inputs>({
    defaultValues: {
      isCompleted: false,
      priority: "Média",
    },
  });

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    console.log("submitting", data);
    setSubmitted(false);
    try {
      await new Promise((resolve) => setTimeout(resolve, 700));
      setSubmitted(true);
      reset({ isCompleted: false, priority: "Média" });
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
        <Typography variant="h6">Criar tarefa</Typography>

        <TextField
          label="Título"
          placeholder="Ex.: Estudar para a prova"
          error={!!errors.title}
          helperText={errors.title ? String(errors.title.message) : ""}
          {...register("title", { required: "Título é obrigatório" })}
          fullWidth
        />

        <TextField
          label="Descrição"
          placeholder="Detalhe o que precisa ser feito"
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
          label="Prazo"
          type="date"
          error={!!errors.dueDate}
          helperText={errors.dueDate ? String(errors.dueDate.message) : ""}
          {...register("dueDate", {
            required: "Data de vencimento é obrigatória",
          })}
          fullWidth
          slotProps={{ inputLabel: { shrink: true } }}
        />

        <TextField
          select
          label="Prioridade"
          error={!!errors.priority}
          helperText={errors.priority ? String(errors.priority.message) : ""}
          {...register("priority", { required: "Prioridade é obrigatória" })}
          fullWidth
        >
          <MenuItem value="Baixa">Baixa</MenuItem>
          <MenuItem value="Média">Média</MenuItem>
          <MenuItem value="Alta">Alta</MenuItem>
        </TextField>

        <FormControlLabel
          control={<Checkbox {...register("isCompleted")} />}
          label="Tarefa concluída"
        />

        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? "Enviando..." : "Cadastrar"}
          </Button>
        </Box>

        {submitted && (
          <Alert severity="success">Tarefa cadastrada com sucesso.</Alert>
        )}
      </Stack>
    </Box>
  );
}
