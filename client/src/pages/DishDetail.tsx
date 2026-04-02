/*
 * Design: L'Avenue de Paris — Elegant Light Theme
 * Página de detalhe do prato com todas as informações do manual
 */
import { useParams, Link } from "wouter";
import { useMenu, categoryLabels, type Dish } from "@/contexts/MenuContext";
import { ArrowLeft, AlertTriangle, ChefHat, BookOpen, Lightbulb, Shield, Sparkles, Tag, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";

export default function DishDetail() {
  const { id } = useParams<{ id: string }>();
  const { dishes, isLoading } = useMenu();
  const { isAuthenticated } = useAuth();
  const dish = dishes.find(d => d.id === Number(id));
  const [imgError, setImgError] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="animate-spin text-gold" size={32} />
      </div>
    );
  }

  if (!dish) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <ChefHat className="mx-auto text-muted-foreground mb-4" size={48} />
          <p className="font-serif text-xl text-muted-foreground">Prato não encontrado</p>
          <Link href="/" className="text-gold text-sm mt-4 inline-block hover:underline">Voltar ao menu</Link>
        </div>
      </div>
    );
  }

  const ingredients = (dish.ingredients as string[]) || [];
  const allergens = (dish.allergens as string[]) || [];

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
          </div>
        </div>
      </nav>

      <div className="pt-16">
        {/* Back Button */}
        <div className="container py-4">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-gold transition-colors">
            <ArrowLeft size={16} />
            Voltar ao menu
          </Link>
        </div>

        {/* Hero Image */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="container"
        >
          <div className="relative aspect-[21/9] sm:aspect-[3/1] overflow-hidden border border-border">
            {!imgError ? (
              <img
                src={dish.imageUrl || ""}
                alt={dish.name}
                className="w-full h-full object-cover"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="w-full h-full bg-secondary flex items-center justify-center">
                <ChefHat className="text-muted-foreground" size={64} />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-transparent to-transparent" />
            
            {/* Badges */}
            <div className="absolute top-4 left-4 flex gap-2">
              {dish.isNew && (
                <span className="flex items-center gap-1 px-3 py-1.5 bg-gold/90 text-white text-xs tracking-wider uppercase font-medium">
                  <Sparkles size={12} />
                  Novo
                </span>
              )}
              {dish.isPromo && (
                <span className="flex items-center gap-1 px-3 py-1.5 bg-burgundy text-white text-xs tracking-wider uppercase font-medium">
                  <Tag size={12} />
                  Promoção
                </span>
              )}
            </div>
          </div>
        </motion.div>

        {/* Content */}
        <div className="container py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                {/* Title */}
                <div className="mb-6">
                  <span className="text-xs text-gold tracking-[0.3em] uppercase">{categoryLabels[dish.category]}</span>
                  <h1 className="font-serif text-3xl sm:text-4xl text-foreground mt-2 leading-tight">{dish.name}</h1>
                  {dish.nameFr !== dish.name && (
                    <p className="font-serif text-lg text-gold/60 italic mt-1">{dish.nameFr}</p>
                  )}
                  {dish.price && (
                    <p className="font-serif text-2xl text-gold mt-3">{dish.price}</p>
                  )}
                </div>

                {/* Description */}
                <div className="border border-border p-6">
                  <h3 className="font-serif text-lg text-gold mb-3 flex items-center gap-2">
                    <ChefHat size={18} />
                    Descrição
                  </h3>
                  <p className="text-foreground leading-relaxed">{dish.description}</p>
                </div>
              </motion.div>

              {/* Preparation */}
              {dish.preparation && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="border border-border p-6"
                >
                  <h3 className="font-serif text-lg text-gold mb-4 flex items-center gap-2">
                    <BookOpen size={18} />
                    Modo de Finalização
                  </h3>
                  <div className="text-foreground/90 leading-relaxed whitespace-pre-line">{dish.preparation}</div>
                </motion.div>
              )}

              {/* Curiosity */}
              {dish.curiosity && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="border border-gold/20 bg-gold/5 p-6"
                >
                  <h3 className="font-serif text-lg text-gold mb-4 flex items-center gap-2">
                    <Lightbulb size={18} />
                    Curiosidades — Para Treinamento
                  </h3>
                  <p className="text-foreground/90 leading-relaxed">{dish.curiosity}</p>
                </motion.div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Ingredients */}
              {ingredients.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="border border-border p-6"
                >
                  <h3 className="font-serif text-lg text-gold mb-4">Ingredientes Principais</h3>
                  <ul className="space-y-2">
                    {ingredients.map((ing: string, i: number) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-foreground/90">
                        <span className="w-1 h-1 rounded-full bg-gold mt-2 shrink-0" />
                        {ing}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}

              {/* Allergens */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="border border-destructive/20 bg-destructive/5 p-6"
              >
                <h3 className="font-serif text-lg text-destructive mb-4 flex items-center gap-2">
                  <AlertTriangle size={18} />
                  Alergênicos
                </h3>
                {allergens.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {allergens.map((a: string, i: number) => (
                      <span key={i} className="text-xs px-3 py-1.5 bg-destructive/10 text-destructive border border-destructive/20 tracking-wide">
                        {a}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Nenhum alergênico relevante identificado.</p>
                )}
              </motion.div>

              {/* Last Updated */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="text-xs text-muted-foreground/60 text-center"
              >
                Última atualização: {new Date(dish.updatedAt).toLocaleDateString("pt-BR")}
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border py-8 mt-8">
        <div className="container text-center">
          <img src="/logo.webp" alt="L'Avenue de Paris" className="w-56 sm:w-64 h-auto object-contain mx-auto mb-6 opacity-80" />
          <p className="text-[11px] text-muted-foreground mt-2">Material de treinamento interno — Uso exclusivo da equipe</p>
        </div>
      </footer>
    </div>
  );
}
