/*
 * Design: L'Avenue de Paris — Elegant Light Theme
 * Paleta: Branco, dourado (#c9a96e), creme, bordô (#722f37)
 * Tipografia: Cormorant Garamond (títulos) + DM Sans (corpo)
 */
import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { useMenu, categoryLabels, type Dish } from "@/contexts/MenuContext";
import { Search, ChefHat, BookOpen, Shield, Sparkles, Tag, LogIn, LogOut, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getLoginUrl } from "@/const";

const HERO_IMG = "/hero.webp";

const categories = [
  { key: "all", label: "Todos" },
  { key: "entradas", label: "Entradas" },
  { key: "massas", label: "Massas" },
  { key: "pratos-principais", label: "Pratos Principais" },
  { key: "sobremesas", label: "Sobremesas" },
];

export default function Home() {
  const { user, loading: authLoading, isAuthenticated, logout } = useAuth();
  const { filteredDishes, isLoading, searchQuery, setSearchQuery, activeCategory, setActiveCategory } = useMenu();
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-border">
        <div className="container flex items-center justify-between h-24">
          <Link href="/" className="flex items-center gap-3">
            <img src="/logo.webp" alt="L'Avenue de Paris" className="w-56 sm:w-64 md:w-72 h-auto object-contain" />
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/quiz" className="text-sm text-muted-foreground hover:text-gold transition-colors duration-300 flex items-center gap-2">
              <BookOpen size={16} />
              <span className="hidden sm:inline">Quiz</span>
            </Link>
            {isAuthenticated && (
              <Link href="/admin" className="text-sm text-muted-foreground hover:text-gold transition-colors duration-300 flex items-center gap-2">
                <Shield size={16} />
                <span className="hidden sm:inline">Admin</span>
              </Link>
            )}
            {isAuthenticated ? (
              <button onClick={() => logout()} className="text-sm text-muted-foreground hover:text-gold transition-colors duration-300 flex items-center gap-2">
                <LogOut size={16} />
                <span className="hidden sm:inline">Sair</span>
              </button>
            ) : (
              <a href={getLoginUrl()} className="text-sm text-muted-foreground hover:text-gold transition-colors duration-300 flex items-center gap-2">
                <LogIn size={16} />
                <span className="hidden sm:inline">Entrar</span>
              </a>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-[60vh] min-h-[400px] flex items-end overflow-hidden">
        <div className="absolute inset-0">
          <img src={HERO_IMG} alt="L'Avenue Interior" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/50 to-transparent" />
        </div>
        <div className="relative container pb-12 pt-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <p className="text-gold text-xs tracking-[0.3em] uppercase mb-3 font-medium">Manual de Treinamento</p>
            <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl text-foreground leading-[1.1] mb-4">
              Conheça Cada<br />
              <span className="text-gold italic">Detalhe</span> do Menu
            </h2>
            <p className="text-foreground/70 max-w-lg text-sm sm:text-base leading-relaxed">
              Guia completo dos pratos do L'Avenue. Explore ingredientes, modos de preparo, curiosidades e tudo que você precisa saber para oferecer uma experiência excepcional.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Search & Filters */}
      <section className="sticky top-16 z-40 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="container py-4">
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input
              type="text"
              placeholder="Buscar por nome, ingrediente ou curiosidade..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-secondary/50 border border-border rounded-sm pl-12 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs"
              >
                Limpar
              </button>
            )}
          </div>
          <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
            {categories.map(cat => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`px-4 py-2 text-xs tracking-wider uppercase whitespace-nowrap transition-all duration-300 border ${
                  activeCategory === cat.key
                    ? "border-gold/50 bg-gold/10 text-gold"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary/30"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Results Count */}
      <div className="container pt-6 pb-2">
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground tracking-wider uppercase">
            {filteredDishes.length} {filteredDishes.length === 1 ? "prato encontrado" : "pratos encontrados"}
          </p>
          {activeCategory !== "all" && (
            <p className="text-xs text-gold tracking-wider uppercase font-serif italic">
              {categoryLabels[activeCategory]}
            </p>
          )}
        </div>
        <div className="gold-line mt-3" />
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-gold" size={32} />
        </div>
      )}

      {/* Dishes Grid */}
      {!isLoading && (
        <section className="container py-6 pb-20">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory + searchQuery}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
            >
              {filteredDishes.map((dish: Dish, i: number) => {
                const allergens = (dish.allergens as string[]) || [];
                return (
                  <motion.div
                    key={dish.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.05 }}
                  >
                    <Link href={`/prato/${dish.id}`}>
                      <div className="group relative bg-card border border-border hover:border-gold/30 transition-all duration-500 hover:shadow-[0_0_30px_rgba(201,169,110,0.08)] overflow-hidden">
                        <div className="relative aspect-[4/3] overflow-hidden">
                          {!imageErrors[dish.id] ? (
                            <img
                              src={dish.imageUrl || ""}
                              alt={dish.name}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                              onError={() => setImageErrors(prev => ({ ...prev, [dish.id]: true }))}
                            />
                          ) : (
                            <div className="w-full h-full bg-secondary flex items-center justify-center">
                              <ChefHat className="text-muted-foreground" size={40} />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-card/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                          <div className="absolute top-3 left-3 flex gap-2">
                            {dish.isNew && (
                              <span className="flex items-center gap-1 px-2 py-1 bg-gold/90 text-white text-[10px] tracking-wider uppercase font-medium">
                                <Sparkles size={10} />
                                Novo
                              </span>
                            )}
                            {dish.isPromo && (
                              <span className="flex items-center gap-1 px-2 py-1 bg-burgundy text-white text-[10px] tracking-wider uppercase font-medium">
                                <Tag size={10} />
                                Promo
                              </span>
                            )}
                          </div>
                          <div className="absolute top-3 right-3">
                            <span className="px-2 py-1 bg-background/80 backdrop-blur-sm text-[10px] tracking-wider uppercase text-muted-foreground border border-border/50">
                              {categoryLabels[dish.category]}
                            </span>
                          </div>
                        </div>
                        <div className="p-5">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h3 className="font-serif text-lg text-foreground group-hover:text-gold transition-colors duration-300 leading-tight">
                              {dish.name}
                            </h3>
                            {dish.price && (
                              <span className="text-gold font-serif text-lg whitespace-nowrap">{dish.price}</span>
                            )}
                          </div>
                          {dish.nameFr !== dish.name && (
                            <p className="text-[11px] text-gold/60 font-serif italic mb-2">{dish.nameFr}</p>
                          )}
                          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{dish.description}</p>
                          {allergens.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-1">
                              {allergens.slice(0, 3).map((a: string, idx: number) => (
                                <span key={idx} className="text-[10px] px-2 py-0.5 bg-destructive/10 text-destructive border border-destructive/20 tracking-wide">
                                  {a}
                                </span>
                              ))}
                              {allergens.length > 3 && (
                                <span className="text-[10px] px-2 py-0.5 text-muted-foreground">+{allergens.length - 3}</span>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="h-[1px] bg-gradient-to-r from-transparent via-gold/30 to-transparent mx-5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>

          {filteredDishes.length === 0 && !isLoading && (
            <div className="text-center py-20">
              <ChefHat className="mx-auto text-muted-foreground mb-4" size={48} />
              <p className="font-serif text-xl text-muted-foreground">Nenhum prato encontrado</p>
              <p className="text-sm text-muted-foreground/60 mt-2">Tente ajustar sua busca ou filtro</p>
            </div>
          )}
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-border py-8">
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
