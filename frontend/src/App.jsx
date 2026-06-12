import { Route, Routes } from "react-router-dom";
import { AnalyzerApp } from "@/components/AnalyzerApp";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<AnalyzerApp />} />
    </Routes>
  );
}
