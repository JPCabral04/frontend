import { Navigate, Route, Routes } from "react-router-dom";
import RegisterForm from "./components/forms/RegisterForm";
import CategoryForm from "./components/forms/CategoryForm";
import TaskForm from "./components/forms/TaskForm";
import EventForm from "./components/forms/EventForm";
import TransactionForm from "./components/forms/TransactionForm";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/register" replace />} />
      <Route path="/register" element={<RegisterForm />} />
      <Route path="/categorias" element={<CategoryForm />} />
      <Route path="/tarefas" element={<TaskForm />} />
      <Route path="/eventos" element={<EventForm />} />
      <Route path="/transacoes" element={<TransactionForm />} />
    </Routes>
  );
}

export default App;
