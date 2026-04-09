/*
 * Design: L'Avenue de Paris — Elegant Light Theme
 * Paleta: Branco, dourado (#c9a96e), creme, bordô (#722f37)
 * Tipografia: Cormorant Garamond (títulos) + DM Sans (corpo)
 */
import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { useMenu, categoryLabels, type Dish } from "@/contexts/MenuContext";
import { Search, ChefHat, BookOpen, Shield, Sparkles, Tag, LogIn, LogOut, Loader2, Info, Ban } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getLoginUrl } from "@/const";

const HERO_IMG = "/hero.webp";

const categories = [
  { key: "entradas", label: "Entradas" },
  { key: "massas", label: "Massas" },
  { key: "pratos-principais", label: "Pratos Principais" },
  { key: "sobremesas", label: "Sobremesas" },
];

const allergenConfigs = [
  { id: "gluten", label: "Sem Glúten", keywords: ["glúten", "gluten", "trigo", "farinha"] },
  { id: "lactose", label: "Sem Lactose", keywords: ["lactose", "leite", "queijo", "creme", "manteiga", "nata", "laticínio", "requeijão"] },
  { id: "seafood", label: "Sem Frutos do Mar", keywords: ["camarão", "camarao", "ostra", "mar", "peixe", "lula", "polvo", "ovas", "vieira", "crustáceo", "atum", "salmão", "sea bass", "lagosta", "crab", "gambas"] },
  { id: "nuts", label: "Sem Oleaginosas", keywords: ["amêndoa", "amendoa", "noz", "castanha", "amendoim", "pistache", "macadâmia", "caju"] }
];

export default function Home() {
  const { user, loading: authLoading, isAuthenticated, logout } = useAuth();
  const { dishes, isLoading, searchQuery, setSearchQuery } = useMenu();
  const [activeCategory, setActiveCategory] = useState(categories[0].key);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (isLoading || searchQuery) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          visible.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
          setActiveCategory(visible[0].target.id.replace("section-", ""));
        }
      },
      {
        rootMargin: "-160px 0px -60% 0px",
        threshold: 0
      }
    );

    categories.forEach((cat) => {
      const el = document.getElementById(`section-${cat.key}`);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [isLoading, searchQuery, dishes]);

  const activeDishes = dishes.filter(d => {
    if (d.isActive === false) return false;
    
    // Allergen rejection filter
    if (activeFilters.length > 0) {
      // Create a single lowercase string of all allergens for easy searching
      const dishAllergens = ((d.allergens as string[]) || []).join(" ").toLowerCase();
      
      for (const filterId of activeFilters) {
        const config = allergenConfigs.find(c => c.id === filterId);
        if (!config) continue;
        
        // If the dish contains ANY keyword of this restricted category, hide the dish completely
        if (config.keywords.some(kw => dishAllergens.includes(kw))) {
          return false;
        }
      }
    }
    
    return true;
  });

  const searchedDishes = activeDishes.filter(d => 
    !searchQuery || 
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (d.description || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    ((d.ingredients as string[]) || []).some(i => i.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (d.curiosity || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (d.nameFr || "").toLowerCase().includes(searchQuery.toLowerCase())
  ).sort((a, b) => a.sortOrder - b.sortOrder);

  const getDishesByCategory = (catKey: string) => {
    return searchedDishes.filter(d => d.category === catKey);
  };

  const DishCard = ({ dish, idx }: { dish: Dish; idx: number }) => {
    const allergens = (dish.allergens as string[]) || [];
    return (
      <motion.div
        key={dish.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: idx * 0.05 }}
        className="h-full"
      >
        <Link href={`/prato/${dish.id}`} className="block h-full">
          <div className="group relative bg-card border border-border hover:border-gold/30 transition-all duration-500 hover:shadow-[0_0_30px_rgba(201,169,110,0.08)] overflow-hidden h-full flex flex-col">
            <div className="relative aspect-[4/3] shrink-0 overflow-hidden">
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
            <div className="p-5 flex-1 flex flex-col">
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
                <div className="mt-auto pt-4 flex flex-wrap gap-1">
                  {allergens.slice(0, 3).map((a: string, idx2: number) => (
                    <span key={idx2} className="text-[10px] px-2 py-0.5 bg-destructive/10 text-destructive border border-destructive/20 tracking-wide">
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
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-border">
        <div className="container flex items-center justify-between h-24">
          <Link href="/" className="flex items-center gap-3">
            <img src="/logo.webp" alt="L'Avenue de Paris" className="w-56 sm:w-64 md:w-72 h-auto object-contain" />
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/sobre" className="text-sm text-muted-foreground hover:text-gold transition-colors duration-300 flex items-center gap-2">
              <Info size={16} />
              <span className="hidden sm:inline">História</span>
            </Link>
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

      {/* Search & Filters (Sticky Bar) */}
      <section className="sticky top-16 z-40 bg-background/95 backdrop-blur-md border-b border-border shadow-sm">
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
          
          <div className="flex flex-wrap gap-2 mb-4 pb-2">
            {allergenConfigs.map(filter => {
              const isActive = activeFilters.includes(filter.id);
              return (
                <button
                  key={filter.id}
                  onClick={() => {
                    setActiveFilters(prev => 
                      isActive ? prev.filter(f => f !== filter.id) : [...prev, filter.id]
                    );
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] sm:text-xs tracking-wide uppercase whitespace-nowrap transition-all duration-300 border rounded-sm ${
                    isActive
                      ? "border-destructive/80 bg-destructive/10 text-destructive font-medium"
                      : "border-border/50 text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                  }`}
                >
                  <Ban size={12} className={isActive ? "opacity-100" : "opacity-60"} /> 
                  {filter.label}
                </button>
              );
            })}
          </div>

          <div className="flex gap-1 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {categories.map(cat => (
              <button
                key={cat.key}
                onClick={() => {
                  setSearchQuery(""); // Clear search to show sections if they click a category
                  setTimeout(() => {
                    document.getElementById(`section-${cat.key}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }, 50);
                }}
                className={`px-4 py-2 text-xs tracking-wider uppercase whitespace-nowrap transition-all duration-300 border ${
                  activeCategory === cat.key && !searchQuery
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

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-gold" size={32} />
        </div>
      )}

      {/* Menu Content */}
      {!isLoading && (
        <div className="container pt-6 pb-20">
          
          {searchQuery ? (
            // Flat List for Search Results
            <section className="py-6">
              <p className="text-xs text-muted-foreground tracking-wider uppercase mb-6 pb-3 border-b border-border">
                {searchedDishes.length} {searchedDishes.length === 1 ? "resultado encontrado" : "resultados encontrados"} na busca
              </p>
              
              {searchedDishes.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {searchedDishes.map((dish, i) => (
                    <DishCard key={dish.id} dish={dish} idx={i} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <ChefHat className="mx-auto text-muted-foreground mb-4" size={48} />
                  <p className="font-serif text-xl text-muted-foreground">Nenhum prato encontrado</p>
                  <p className="text-sm text-muted-foreground/60 mt-2">Tente ajustar sua busca ou filtro</p>
                </div>
              )}
            </section>
          ) : (
            // Scrollspy Grouped Sections
            <div className="space-y-12">
              {categories.map((cat) => {
                const groupDishes = getDishesByCategory(cat.key);
                if (groupDishes.length === 0) return null;
                
                // Add scroll-mt-[200px] so the sticky nav doesn't cover the title when scrolling
                return (
                  <section key={cat.key} id={`section-${cat.key}`} className="scroll-mt-[200px] pt-4">
                    <div className="flex items-center gap-4 mb-8">
                      <h2 className="font-serif text-3xl text-foreground capitalize-first">{cat.label}</h2>
                      <div className="h-[1px] bg-border flex-1" />
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                      {groupDishes.map((dish, i) => (
                        <DishCard key={dish.id} dish={dish} idx={i} />
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-border py-8 mt-12 bg-secondary/20">
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
