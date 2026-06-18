import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import {
  Alert,
  Box,
  Button,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

type Inputs = {
  amount: number;
  transactionType: string;
  date: string;
  description: string;
  category: string;
};

export default function TransactionForm() {
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<Inputs>();

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
        <Typography variant="h6">Criar transação</Typography>

        <TextField
          label="Valor"
          type="number"
          placeholder="0,00"
          error={!!errors.amount}
          helperText={errors.amount ? String(errors.amount.message) : ""}
          {...register("amount", {
            required: "Valor é obrigatório",
            valueAsNumber: true,
            min: {
              value: 0.01,
              message: "Informe um valor maior que zero",
            },
          })}
          fullWidth
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">R$</InputAdornment>
              ),
            },
          }}
        />

        <TextField
          select
          label="Tipo da transação"
          error={!!errors.transactionType}
          helperText={
            errors.transactionType ? String(errors.transactionType.message) : ""
          }
          {...register("transactionType", {
            required: "Tipo da transação é obrigatório",
          })}
          fullWidth
        >
          <MenuItem value="Entrada">Entrada</MenuItem>
          <MenuItem value="Saída">Saída</MenuItem>
        </TextField>

        <TextField
          label="Data"
          type="date"
          error={!!errors.date}
          helperText={errors.date ? String(errors.date.message) : ""}
          {...register("date", { required: "Data é obrigatória" })}
          fullWidth
          slotProps={{ inputLabel: { shrink: true } }}
        />

        <TextField
          label="Descrição"
          placeholder="Detalhe a transação"
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
          label="Categoria"
          placeholder="Ex.: Alimentação"
          error={!!errors.category}
          helperText={errors.category ? String(errors.category.message) : ""}
          {...register("category")}
          fullWidth
        />

        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? "Enviando..." : "Cadastrar"}
          </Button>
        </Box>

        {submitted && (
          <Alert severity="success">Transação cadastrada com sucesso.</Alert>
        )}
      </Stack>
    </Box>
  );
}
