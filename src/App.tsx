import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { About } from "./pages/About";
import { Courses } from "./pages/Courses";
import { CourseDetail } from "./pages/CourseDetail";
import { News } from "./pages/News";
import { NewsDetail } from "./pages/NewsDetail";
import { University } from "./pages/University";
import { UniversityDetail } from "./pages/UniversityDetail";
import { Travel } from "./pages/Travel";
import { TravelDetail } from "./pages/TravelDetail";
import { Enroll } from "./pages/Enroll";
import { Shop } from "./pages/Shop";
import { ProductDetail } from "./pages/ProductDetail";
import { Contact } from "./pages/Contact";
import { Profile } from "./pages/Profile";
import { Auth } from "./pages/Auth";
import { Quiz } from "./pages/Quiz";
import { NotFound } from "./pages/NotFound";
import { AdminLayout } from "./pages/admin/AdminLayout";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { AdminLeads } from "./pages/admin/AdminLeads";
import { AdminPages } from "./pages/admin/AdminPages";
import { AdminPageSection } from "./pages/admin/AdminPageSection";
import { AdminSettings } from "./pages/admin/AdminSettings";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="leads" element={<AdminLeads />} />
          <Route path="pages" element={<AdminPages />} />
          <Route path="pages/:section" element={<AdminPageSection />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="courses" element={<Courses />} />
          <Route path="courses/:id" element={<CourseDetail />} />
          <Route path="enroll" element={<Enroll />} />
          <Route path="medee" element={<News />} />
          <Route path="medee/:id" element={<NewsDetail />} />
          <Route path="news" element={<Navigate to="/medee" replace />} />
          <Route path="news/:id" element={<NewsDetail />} />
          <Route path="university" element={<University />} />
          <Route path="university/:id" element={<UniversityDetail />} />
          <Route path="travel" element={<Travel />} />
          <Route path="travel/:id" element={<TravelDetail />} />
          <Route path="shop" element={<Shop />} />
          <Route path="shop/:id" element={<ProductDetail />} />
          <Route path="contact" element={<Contact />} />
          <Route path="profile" element={<Profile />} />
          <Route path="auth" element={<Auth />} />
          <Route path="login" element={<Navigate to="/auth?mode=login" replace />} />
          <Route path="signup" element={<Navigate to="/auth?mode=signup" replace />} />
          <Route path="quiz" element={<Quiz />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
