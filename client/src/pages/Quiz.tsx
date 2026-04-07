/*
 * Design: L'Avenue de Paris — Elegant Light Theme
 * Modo treinamento com flashcards e quiz interativo
 */
import { useState, useCallback } from "react";
import { Link } from "wouter";
import { useMenu, categoryLabels, type Dish } from "@/contexts/MenuContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { 
  ArrowLeft, RotateCcw, ChefHat, BookOpen, Shield, 
  CheckCircle2, XCircle, Trophy, Shuffle, ArrowRight,
  Eye, EyeOff, Lightbulb, Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type QuizMode = "flashcards" | "quiz" | "ingredients";

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function getIngredients(dish: Dish): string[] {
  return (dish.ingredients as string[]) || [];
}

function getAllergens(dish: Dish): string[] {
  return (dish.allergens as string[]) || [];
}

export default function Quiz() {
  const { dishes, isLoading } = useMenu();
  const { isAuthenticated } = useAuth();
  const [mode, setMode] = useState<QuizMode | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [shuffledDishes, setShuffledDishes] = useState<Dish[]>([]);
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);

  const generateQuizQuestions = useCallback(() => {
    const questions: any[] = [];
    const shuffled = shuffleArray(dishes);
    
    shuffled.forEach(dish => {
      const dishAllergens = getAllergens(dish);
      const questionTypes = [
        {
          question: `Qual prato corresponde à seguinte descrição?\n\n"${dish.description}"`,
          correct: dish.name,
          wrong: shuffleArray(dishes.filter(d => d.id !== dish.id)).slice(0, 3).map(d => d.name)
        },
        {
          question: `A qual categoria pertence o prato "${dish.name}"?`,
          correct: categoryLabels[dish.category],
          wrong: Object.entries(categoryLabels).filter(([k]) => k !== dish.category && k !== "all").map(([, v]) => v)
        },
        ...(dishAllergens.length > 0 ? [{
          question: `Qual dos alergênicos abaixo está presente no prato "${dish.name}"?`,
          correct: dishAllergens[0],
          wrong: ["Nenhum alergênico", "Frutos do mar", "Amendoim", "Soja", "Glúten", "Laticínios"].filter(a => !dishAllergens.includes(a)).slice(0, 3)
        }] : []),
        ...(dish.curiosity ? [{
          question: `Qual prato possui a seguinte curiosidade:\n\n"${dish.curiosity}"?`,
          correct: dish.name,
          wrong: shuffleArray(dishes.filter(d => d.id !== dish.id && d.curiosity)).slice(0, 3).map(d => d.name)
        }] : [])
      ];
      
      const picked = questionTypes[Math.floor(Math.random() * questionTypes.length)];
      if (picked && picked.wrong.length >= 3) {
        const options = shuffleArray([picked.correct, ...picked.wrong.slice(0, 3)]);
        questions.push({
          dish,
          question: picked.question,
          options,
          correctIndex: options.indexOf(picked.correct)
        });
      }
    });
    
    return shuffleArray(questions).slice(0, 15);
  }, [dishes]);

  const startMode = (m: QuizMode) => {
    setMode(m);
    setCurrentIndex(0);
    setShowAnswer(false);
    setScore(0);
    setAnswered(0);
    setSelectedAnswer(null);
    setShuffledDishes(shuffleArray(dishes));
    if (m === "quiz") {
      setQuizQuestions(generateQuizQuestions());
    }
  };

  const currentDish = shuffledDishes[currentIndex];
  const currentQuestion = quizQuestions[currentIndex];

  const nextCard = () => {
    setShowAnswer(false);
    setSelectedAnswer(null);
    if (mode === "quiz") {
      setCurrentIndex(i => Math.min(i + 1, quizQuestions.length - 1));
    } else {
      setCurrentIndex(i => Math.min(i + 1, shuffledDishes.length - 1));
    }
  };

  const handleQuizAnswer = (idx: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(idx);
    setAnswered(a => a + 1);
    if (idx === currentQuestion.correctIndex) {
      setScore(s => s + 1);
    }
  };

  const total = mode === "quiz" ? quizQuestions.length : shuffledDishes.length;
  const isFinished = mode === "quiz" ? currentIndex >= quizQuestions.length - 1 && selectedAnswer !== null : false;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="animate-spin text-gold" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-border">
        <div className="container flex items-center justify-between h-24">
          <Link href="/">
            <div className="flex items-center gap-3">
              <img src="/logo.webp" alt="L'Avenue de Paris" className="w-56 sm:w-64 md:w-72 h-auto object-contain" />
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm text-muted-foreground hover:text-gold transition-colors duration-300 flex items-center gap-2">
              <ArrowLeft size={16} />
              <span className="hidden sm:inline">Menu</span>
            </Link>
            {isAuthenticated && (
              <Link href="/admin" className="text-sm text-muted-foreground hover:text-gold transition-colors duration-300 flex items-center gap-2">
                <Shield size={16} />
                <span className="hidden sm:inline">Admin</span>
              </Link>
            )}
          </div>
        </div>
      </nav>

      <div className="pt-20 pb-12">
        <div className="container max-w-3xl mx-auto">
          {/* Mode Selection */}
          {!mode && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div className="text-center">
                <BookOpen className="mx-auto text-gold mb-4" size={40} />
                <h2 className="font-serif text-3xl text-foreground mb-2">Modo Treinamento</h2>
                <p className="text-muted-foreground">Escolha um modo para testar seus conhecimentos sobre o cardápio</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button
                  onClick={() => startMode("flashcards")}
                  className="group border border-border p-6 text-left hover:border-gold/30 transition-all duration-300 hover:shadow-[0_0_30px_rgba(201,169,110,0.08)]"
                >
                  <Eye className="text-gold mb-4" size={28} />
                  <h3 className="font-serif text-lg text-foreground group-hover:text-gold transition-colors mb-2">Flashcards</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">Veja a foto do prato e tente lembrar o nome, ingredientes e curiosidades.</p>
                </button>

                <button
                  onClick={() => startMode("quiz")}
                  className="group border border-border p-6 text-left hover:border-gold/30 transition-all duration-300 hover:shadow-[0_0_30px_rgba(201,169,110,0.08)]"
                >
                  <Trophy className="text-gold mb-4" size={28} />
                  <h3 className="font-serif text-lg text-foreground group-hover:text-gold transition-colors mb-2">Quiz</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">15 perguntas aleatórias sobre pratos, ingredientes e curiosidades.</p>
                </button>

                <button
                  onClick={() => startMode("ingredients")}
                  className="group border border-border p-6 text-left hover:border-gold/30 transition-all duration-300 hover:shadow-[0_0_30px_rgba(201,169,110,0.08)]"
                >
                  <Lightbulb className="text-gold mb-4" size={28} />
                  <h3 className="font-serif text-lg text-foreground group-hover:text-gold transition-colors mb-2">Ingredientes</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">Pratique identificar os ingredientes e alergênicos de cada prato.</p>
                </button>
              </div>
            </motion.div>
          )}

          {/* Flashcards Mode */}
          {mode === "flashcards" && currentDish && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <button onClick={() => setMode(null)} className="text-sm text-muted-foreground hover:text-gold flex items-center gap-2">
                  <ArrowLeft size={16} /> Voltar
                </button>
                <span className="text-xs text-muted-foreground">{currentIndex + 1} / {total}</span>
                <button onClick={() => startMode("flashcards")} className="text-sm text-muted-foreground hover:text-gold flex items-center gap-2">
                  <Shuffle size={16} /> Embaralhar
                </button>
              </div>

              <div className="h-1 bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-gold transition-all duration-300" style={{ width: `${((currentIndex + 1) / total) * 100}%` }} />
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className="border border-border overflow-hidden"
                >
                  <div className="aspect-video relative overflow-hidden">
                    <img src={currentDish.imageUrl || ""} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-card/90 via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4">
                      <span className="text-xs text-gold/80 tracking-wider uppercase">{categoryLabels[currentDish.category]}</span>
                    </div>
                  </div>

                  <div className="p-6">
                    {!showAnswer ? (
                      <div className="text-center py-8">
                        <EyeOff className="mx-auto text-muted-foreground mb-4" size={32} />
                        <p className="text-muted-foreground mb-6">Consegue identificar este prato?</p>
                        <button
                          onClick={() => setShowAnswer(true)}
                          className="px-6 py-3 bg-gold text-primary-foreground text-sm hover:bg-gold-dark transition-colors"
                        >
                          Revelar Resposta
                        </button>
                      </div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                      >
                        <h3 className="font-serif text-2xl text-foreground">{currentDish.name}</h3>
                        {currentDish.nameFr !== currentDish.name && (
                          <p className="font-serif text-sm text-gold/60 italic">{currentDish.nameFr}</p>
                        )}
                        <p className="text-sm text-foreground/80">{currentDish.description}</p>
                        
                        <div className="border-t border-border pt-4">
                          <p className="text-xs text-gold tracking-wider uppercase mb-2">Ingredientes Principais</p>
                          <div className="flex flex-wrap gap-1">
                            {getIngredients(currentDish).map((ing, i) => (
                              <span key={i} className="text-xs px-2 py-1 bg-secondary/50 text-foreground/80">{ing}</span>
                            ))}
                          </div>
                        </div>

                        {getAllergens(currentDish).length > 0 && (
                          <div>
                            <p className="text-xs text-destructive tracking-wider uppercase mb-2">Alergênicos</p>
                            <div className="flex flex-wrap gap-1">
                              {getAllergens(currentDish).map((a, i) => (
                                <span key={i} className="text-xs px-2 py-1 bg-destructive/10 text-destructive">{a}</span>
                              ))}
                            </div>
                          </div>
                        )}

                        {currentDish.curiosity && (
                          <div className="bg-gold/5 border border-gold/20 p-4">
                            <p className="text-xs text-gold tracking-wider uppercase mb-2">Curiosidade</p>
                            <p className="text-sm text-foreground/80">{currentDish.curiosity}</p>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>

              {showAnswer && currentIndex < total - 1 && (
                <div className="flex justify-center">
                  <button
                    onClick={nextCard}
                    className="px-6 py-3 bg-gold text-primary-foreground text-sm hover:bg-gold-dark transition-colors flex items-center gap-2"
                  >
                    Próximo <ArrowRight size={16} />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Quiz Mode */}
          {mode === "quiz" && currentQuestion && !isFinished && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <button onClick={() => setMode(null)} className="text-sm text-muted-foreground hover:text-gold flex items-center gap-2">
                  <ArrowLeft size={16} /> Voltar
                </button>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-muted-foreground">{currentIndex + 1} / {quizQuestions.length}</span>
                  <span className="text-xs text-gold">{score} acertos</span>
                </div>
              </div>

              <div className="h-1 bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-gold transition-all duration-300" style={{ width: `${((currentIndex + 1) / quizQuestions.length) * 100}%` }} />
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className="border border-border p-6 space-y-6"
                >
                  {currentQuestion.dish.imageUrl && (
                    <div className="aspect-video overflow-hidden border border-border">
                      <img src={currentQuestion.dish.imageUrl} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}

                  <h3 className="font-serif text-xl text-foreground whitespace-pre-wrap leading-relaxed">{currentQuestion.question}</h3>

                  <div className="space-y-3">
                    {currentQuestion.options.map((opt: string, idx: number) => {
                      let borderClass = "border-border hover:border-gold/30";
                      let bgClass = "";
                      if (selectedAnswer !== null) {
                        if (idx === currentQuestion.correctIndex) {
                          borderClass = "border-green-500/50";
                          bgClass = "bg-green-500/10";
                        } else if (idx === selectedAnswer) {
                          borderClass = "border-destructive/50";
                          bgClass = "bg-destructive/10";
                        }
                      }
                      return (
                        <button
                          key={idx}
                          onClick={() => handleQuizAnswer(idx)}
                          disabled={selectedAnswer !== null}
                          className={`w-full text-left p-4 border ${borderClass} ${bgClass} transition-all text-sm text-foreground/90 flex items-center gap-3`}
                        >
                          <span className="w-6 h-6 border border-border flex items-center justify-center text-xs text-muted-foreground shrink-0">
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <span className="flex-1 leading-relaxed">{opt}</span>
                          {selectedAnswer !== null && idx === currentQuestion.correctIndex && (
                            <CheckCircle2 className="text-green-500 ml-auto shrink-0" size={18} />
                          )}
                          {selectedAnswer === idx && idx !== currentQuestion.correctIndex && (
                            <XCircle className="text-destructive ml-auto shrink-0" size={18} />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {selectedAnswer !== null && currentIndex < quizQuestions.length - 1 && (
                    <div className="flex justify-center pt-2">
                      <button
                        onClick={nextCard}
                        className="px-6 py-3 bg-gold text-primary-foreground text-sm hover:bg-gold-dark transition-colors flex items-center gap-2"
                      >
                        Próxima Pergunta <ArrowRight size={16} />
                      </button>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          )}

          {/* Quiz Results */}
          {mode === "quiz" && isFinished && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="border border-border p-8 text-center space-y-6"
            >
              <Trophy className="mx-auto text-gold" size={48} />
              <h3 className="font-serif text-3xl text-foreground">Quiz Finalizado!</h3>
              <div className="space-y-2">
                <p className="text-4xl font-serif text-gold">{score} / {quizQuestions.length}</p>
                <p className="text-sm text-muted-foreground">
                  {score === quizQuestions.length ? "Perfeito! Você domina o cardápio!" :
                   score >= quizQuestions.length * 0.7 ? "Muito bem! Continue praticando!" :
                   "Continue estudando o cardápio para melhorar!"}
                </p>
              </div>
              <div className="flex justify-center gap-4">
                <button onClick={() => startMode("quiz")} className="px-6 py-3 bg-gold text-primary-foreground text-sm hover:bg-gold-dark transition-colors flex items-center gap-2">
                  <RotateCcw size={16} /> Tentar Novamente
                </button>
                <button onClick={() => setMode(null)} className="px-6 py-3 border border-border text-muted-foreground hover:text-foreground text-sm transition-colors">
                  Voltar ao Menu
                </button>
              </div>
            </motion.div>
          )}

          {/* Ingredients Mode */}
          {mode === "ingredients" && currentDish && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <button onClick={() => setMode(null)} className="text-sm text-muted-foreground hover:text-gold flex items-center gap-2">
                  <ArrowLeft size={16} /> Voltar
                </button>
                <span className="text-xs text-muted-foreground">{currentIndex + 1} / {total}</span>
                <button onClick={() => startMode("ingredients")} className="text-sm text-muted-foreground hover:text-gold flex items-center gap-2">
                  <Shuffle size={16} /> Embaralhar
                </button>
              </div>

              <div className="h-1 bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-gold transition-all duration-300" style={{ width: `${((currentIndex + 1) / total) * 100}%` }} />
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className="border border-border overflow-hidden"
                >
                  <div className="p-6">
                    <h3 className="font-serif text-2xl text-foreground mb-2">{currentDish.name}</h3>
                    <p className="text-sm text-muted-foreground mb-6">{currentDish.description}</p>

                    {!showAnswer ? (
                      <div className="text-center py-8">
                        <ChefHat className="mx-auto text-muted-foreground mb-4" size={32} />
                        <p className="text-muted-foreground mb-2">Quais são os ingredientes principais?</p>
                        <p className="text-xs text-muted-foreground/60 mb-6">E quais são os alergênicos?</p>
                        <button
                          onClick={() => setShowAnswer(true)}
                          className="px-6 py-3 bg-gold text-primary-foreground text-sm hover:bg-gold-dark transition-colors"
                        >
                          Revelar Ingredientes
                        </button>
                      </div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                      >
                        <div>
                          <p className="text-xs text-gold tracking-wider uppercase mb-3">Ingredientes Principais</p>
                          <ul className="space-y-2">
                            {getIngredients(currentDish).map((ing, i) => (
                              <li key={i} className="flex items-start gap-3 text-sm text-foreground/90">
                                <span className="w-1.5 h-1.5 rounded-full bg-gold mt-1.5 shrink-0" />
                                {ing}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="border-t border-border pt-4">
                          <p className="text-xs text-destructive tracking-wider uppercase mb-3">Alergênicos</p>
                          {getAllergens(currentDish).length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {getAllergens(currentDish).map((a, i) => (
                                <span key={i} className="text-xs px-3 py-1.5 bg-destructive/10 text-destructive border border-destructive/20">{a}</span>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">Nenhum alergênico relevante identificado.</p>
                          )}
                        </div>

                        <div className="border-t border-border pt-4">
                          <p className="text-xs text-gold tracking-wider uppercase mb-3">Modo de Finalização</p>
                          <p className="text-sm text-foreground/80 whitespace-pre-line">{currentDish.preparation}</p>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>

              {showAnswer && currentIndex < total - 1 && (
                <div className="flex justify-center">
                  <button
                    onClick={nextCard}
                    className="px-6 py-3 bg-gold text-primary-foreground text-sm hover:bg-gold-dark transition-colors flex items-center gap-2"
                  >
                    Próximo <ArrowRight size={16} />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border py-8 mt-8">
        <div className="container text-center">
          <div className="gold-line mb-6" />
          <div className="flex justify-center w-full">
            <img src="/logo.webp" alt="L'Avenue de Paris" className="w-56 sm:w-64 h-auto object-contain mb-6 opacity-80" />
          </div>
          <p className="text-[11px] text-muted-foreground mt-2">Material de treinamento interno — Uso exclusivo da equipe</p>
        </div>
      </footer>
    </div>
  );
}
