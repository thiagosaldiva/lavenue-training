import { createContext, useContext, useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import type { Dish } from "../../../drizzle/schema";

export type { Dish } from "../../../drizzle/schema";

interface MenuContextType {
  dishes: Dish[];
  isLoading: boolean;
  updateDish: (id: number, updates: Partial<Dish>) => void;
  addDish: (dish: Omit<Dish, "id" | "createdAt" | "updatedAt">) => void;
  removeDish: (id: number) => void;
  uploadImage: (dishId: number, file: File) => Promise<string>;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  filteredDishes: Dish[];
  activeCategory: string;
  setActiveCategory: (cat: string) => void;
}

const MenuContext = createContext<MenuContextType | null>(null);

export function useMenu() {
  const ctx = useContext(MenuContext);
  if (!ctx) throw new Error("useMenu must be used within MenuProvider");
  return ctx;
}

const categoryLabels: Record<string, string> = {
  "all": "Todos",
  "entradas": "Entradas",
  "massas": "Massas",
  "pratos-principais": "Pratos Principais",
  "sobremesas": "Sobremesas"
};

export { categoryLabels };

export function MenuProvider({ children }: { children: React.ReactNode }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const utils = trpc.useUtils();

  // Fetch dishes from database
  const { data: dishes = [], isLoading } = trpc.dishes.list.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  // Mutations
  const createMutation = trpc.dishes.create.useMutation({
    onSuccess: () => utils.dishes.list.invalidate(),
  });

  const updateMutation = trpc.dishes.update.useMutation({
    onSuccess: () => utils.dishes.list.invalidate(),
  });

  const deleteMutation = trpc.dishes.delete.useMutation({
    onSuccess: () => utils.dishes.list.invalidate(),
  });

  const uploadImageMutation = trpc.dishes.uploadImage.useMutation({
    onSuccess: () => utils.dishes.list.invalidate(),
  });

  const updateDish = (id: number, updates: Partial<Dish>) => {
    updateMutation.mutate({ id, data: updates as any });
  };

  const addDish = (dish: Omit<Dish, "id" | "createdAt" | "updatedAt">) => {
    createMutation.mutate(dish as any);
  };

  const removeDish = (id: number) => {
    deleteMutation.mutate({ id });
  };

  const uploadImage = async (dishId: number, file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64 = (reader.result as string).split(",")[1];
          const result = await uploadImageMutation.mutateAsync({
            dishId,
            imageBase64: base64,
            fileName: file.name,
            contentType: file.type || "image/jpeg",
          });
          resolve(result.url);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const filteredDishes = useMemo(() => {
    return dishes.filter((d: Dish) => {
      const matchesCategory = activeCategory === "all" || d.category === activeCategory;
      const q = searchQuery.toLowerCase();
      const ingredients = (d.ingredients as string[]) || [];
      const matchesSearch = !q ||
        d.name.toLowerCase().includes(q) ||
        (d.nameFr || "").toLowerCase().includes(q) ||
        (d.description || "").toLowerCase().includes(q) ||
        ingredients.some((i: string) => i.toLowerCase().includes(q)) ||
        (d.curiosity || "").toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [dishes, activeCategory, searchQuery]);

  return (
    <MenuContext.Provider value={{
      dishes,
      isLoading,
      updateDish,
      addDish,
      removeDish,
      uploadImage,
      searchQuery,
      setSearchQuery,
      filteredDishes,
      activeCategory,
      setActiveCategory
    }}>
      {children}
    </MenuContext.Provider>
  );
}
