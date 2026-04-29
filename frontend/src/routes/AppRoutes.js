import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "../components/Layout";
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import CourseDetailsPage from "../pages/CourseDetailsPage";
import QuizPage from "../pages/QuizPage";
import ResultPage from "../pages/ResultPage";
import CertificatePage from "../pages/CertificatePage";
import DashboardPage from "../pages/DashboardPage";
import AdminDashboardPage from "../pages/AdminDashboardPage";
import CourseFormPage from "../pages/CourseFormPage";
import NotFoundPage from "../pages/NotFoundPage";
import ProtectedRoute from "./ProtectedRoute";
import AdminRoute from "./AdminRoute";
import PublicOnlyRoute from "./PublicOnlyRoute";

function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="courses/:courseId" element={<CourseDetailsPage />} />

        <Route element={<PublicOnlyRoute />}>
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="quiz/:courseId" element={<QuizPage />} />
          <Route path="result/:courseId" element={<ResultPage />} />
          <Route path="certificate/:courseId" element={<CertificatePage />} />
          <Route path="dashboard" element={<DashboardPage />} />
        </Route>

        <Route element={<AdminRoute />}>
          <Route path="admin" element={<AdminDashboardPage />} />
          <Route path="admin/courses/new" element={<CourseFormPage />} />
          <Route path="admin/courses/:courseId/edit" element={<CourseFormPage />} />
        </Route>

        <Route path="home" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;
