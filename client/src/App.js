import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ToastProvider } from "./contexts/ToastContext";
import { LayoutProvider } from "./contexts/LayoutContext";
import ErrorBoundary from "./components/common/ErrorBoundary";
import ThemeWrapper from "./components/common/ThemeWrapper";
import { AuthGuard } from "./components/common/AuthGuard";

// Главная
import LandingPage from "./pages/landing/Landing";

// Дашборд
import DashboardPage from "./pages/dashboard/DashboardPage";

// Наборы
import CardSetsListPage from "./pages/card-sets/CardSetsListPage";
import CardSetDetailPage from "./pages/card-sets/CardSetDetail";

// Тренировки
import TrainingModeSelectPage from "./pages/training/TrainingModeSelectPage";
import TrainingModeSelectWithSetPage from "./pages/training/TrainingModeSelectWithSetPage";
import PracticePage from "./pages/training/Practice";
import QuizPage from "./pages/training/QuizPage";
import MarathonPage from "./pages/training/MarathonPage";
import DictationPage from "./pages/training/DictationPage";
import MatchingPage from "./pages/training/MatchingPage";

// Профиль
import ProfilePage from "./pages/profile/ProfilePage";
import PublicProfilePage from "./pages/profile/PublicProfilePage";

// Настройки
import ThemeSettingsPage from "./pages/settings/ThemeSettingsPage";

// Лидерборд
import LeaderboardPage from "./pages/leaderboard/LeaderboardPage";

// Чат
import ChatPage from "./pages/chat/ChatPage";

// Избранное
import FavoritesPage from "./pages/favorites/FavoritesPage";

// Языки
import LanguagesPage from "./pages/languages/LanguagesPage";

// Гостевой режим
import GuestPage from "./pages/guest/GuestPage";

const queryClient = new QueryClient();

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <AuthProvider>
              <ToastProvider>
                <ThemeWrapper>
                  <LayoutProvider>
                    <Routes>
                      {/* Главная — лендинг */}
                      <Route path="/" element={<LandingPage />} />

                      {/* Гостевой режим - доступен без авторизации */}
                      <Route path="/guest" element={<GuestPage />} />
                      <Route
                        path="/guest/training/:setId"
                        element={<GuestPage />}
                      />

                      {/* Дашборд */}
                      <Route
                        path="/dashboard"
                        element={
                          <AuthGuard>
                            <DashboardPage />
                          </AuthGuard>
                        }
                      />

                      {/* Все остальные — только авторизованным */}
                      <Route
                        path="/card-sets"
                        element={
                          <AuthGuard>
                            <CardSetsListPage />
                          </AuthGuard>
                        }
                      />
                      <Route
                        path="/card-sets/:id"
                        element={
                          <AuthGuard>
                            <CardSetDetailPage />
                          </AuthGuard>
                        }
                      />

                      {/* Тренировки */}
                      <Route
                        path="/training/select"
                        element={
                          <AuthGuard>
                            <TrainingModeSelectPage />
                          </AuthGuard>
                        }
                      />
                      <Route
                        path="/training/mode-select/:setId"
                        element={
                          <AuthGuard>
                            <TrainingModeSelectWithSetPage />
                          </AuthGuard>
                        }
                      />
                      <Route
                        path="/training/practice/:setId"
                        element={
                          <AuthGuard>
                            <PracticePage />
                          </AuthGuard>
                        }
                      />
                      <Route
                        path="/training/quiz/:setId"
                        element={
                          <AuthGuard>
                            <QuizPage />
                          </AuthGuard>
                        }
                      />
                      <Route
                        path="/training/marathon/:setId"
                        element={
                          <AuthGuard>
                            <MarathonPage />
                          </AuthGuard>
                        }
                      />
                      <Route
                        path="/training/dictation/:setId"
                        element={
                          <AuthGuard>
                            <DictationPage />
                          </AuthGuard>
                        }
                      />
                      <Route
                        path="/training/matching/:setId"
                        element={
                          <AuthGuard>
                            <MatchingPage />
                          </AuthGuard>
                        }
                      />

                      {/* Профиль */}
                      <Route
                        path="/profile"
                        element={
                          <AuthGuard>
                            <ProfilePage />
                          </AuthGuard>
                        }
                      />
                      <Route
                        path="/profile/:userId"
                        element={
                          <AuthGuard>
                            <PublicProfilePage />
                          </AuthGuard>
                        }
                      />

                      {/* Настройки */}
                      <Route
                        path="/settings/theme"
                        element={
                          <AuthGuard>
                            <ThemeSettingsPage />
                          </AuthGuard>
                        }
                      />

                      {/* Избранное */}
                      <Route
                        path="/favorites"
                        element={
                          <AuthGuard>
                            <FavoritesPage />
                          </AuthGuard>
                        }
                      />

                      {/* Языки */}
                      <Route
                        path="/languages"
                        element={
                          <AuthGuard>
                            <LanguagesPage />
                          </AuthGuard>
                        }
                      />

                      {/* Друзья - интегрировано в ChatPage */}

                      {/* Лидерборд */}
                      <Route
                        path="/leaderboard"
                        element={
                          <AuthGuard>
                            <LeaderboardPage />
                          </AuthGuard>
                        }
                      />

                      {/* Чат */}
                      <Route
                        path="/chat"
                        element={
                          <AuthGuard>
                            <ChatPage />
                          </AuthGuard>
                        }
                      />
                      <Route
                        path="/chat/:friendId"
                        element={
                          <AuthGuard>
                            <ChatPage />
                          </AuthGuard>
                        }
                      />

                      {/* Гостевой режим */}
                      <Route path="/guest" element={<GuestPage />} />

                      {/* 404 */}
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </LayoutProvider>
                </ThemeWrapper>
              </ToastProvider>
            </AuthProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
