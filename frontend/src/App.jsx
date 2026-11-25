import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { Navbar } from "./components/layout/Navbar";
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { DashboardPage } from "./pages/DashboardPage";
import { LibraryPage } from "./pages/LibraryPage";
import { ReaderPage } from "./pages/ReaderPage";
import { RevisionPage } from "./pages/RevisionPage";
import { InterviewHubPage } from "./pages/InterviewHubPage";
import { InterviewRoomPage } from "./pages/InterviewRoomPage";
import { ChallengeHubPage } from "./pages/ChallengeHubPage";
import { ChallengeViewPage } from "./pages/ChallengeViewPage";
import { DocumentScannerLoader } from "./components/common/DocumentScannerLoader";

// Protected Route Guard
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <DocumentScannerLoader message="Loading StudyFlow Workspace..." fullScreen={true} />
    );
  }

  return user ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-[#08090C] bg-luxury-mesh text-zinc-100 flex flex-col font-sans antialiased selection:bg-indigo-500/25 selection:text-white">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                
                {/* Authenticated Workspace Routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/library"
                  element={
                    <ProtectedRoute>
                      <LibraryPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/document/:id"
                  element={
                    <ProtectedRoute>
                      <ReaderPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/revision"
                  element={
                    <ProtectedRoute>
                      <RevisionPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/interview"
                  element={
                    <ProtectedRoute>
                      <InterviewHubPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/interview/:id"
                  element={
                    <ProtectedRoute>
                      <InterviewRoomPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/challenge"
                  element={
                    <ProtectedRoute>
                      <ChallengeHubPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/challenge/:id"
                  element={
                    <ProtectedRoute>
                      <ChallengeViewPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/roadmap"
                  element={<Navigate to="/challenge" replace />}
                />

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
