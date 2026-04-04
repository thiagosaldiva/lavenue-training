/*
 * Design: L'Avenue de Paris — Elegant Light Theme
 * Painel administrativo para edição de pratos, preços e imagens
 * Protegido por autenticação — apenas admins podem editar
 */
import { useState, useRef, useCallback } from "react";
import Cropper from "react-easy-crop";
import { getCroppedImg } from "@/utils/cropImage";
import { Link } from "wouter";
import { useMenu, categoryLabels, type Dish } from "@/contexts/MenuContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { getLoginUrl } from "@/const";
import { 
  ArrowLeft, Save, Trash2, Plus, Image, Edit3, X, Check, 
  ChefHat, Shield, BookOpen, Search, Sparkles, Tag,
  Crop, RotateCw, ZoomIn, ZoomOut, Upload, LogIn, Loader2, Play, Pause, GripVertical
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const categoryOptions = [
  { value: "entradas", label: "Entradas" },
  { value: "massas", label: "Massas" },
  { value: "pratos-principais", label: "Pratos Principais" },
  { value: "sobremesas", label: "Sobremesas" },
];

function ImageEditor({ src, dishId, onSave, onClose }: { src: string; dishId: number; onSave: (url: string) => void; onClose: () => void }) {
  const { uploadImage } = useMenu();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [imageUrl, setImageUrl] = useState(src);
  const [newUrl, setNewUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  // Cropper state
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropComplete = useCallback((_croppedArea: any, croppedAreaPixelsVal: any) => {
    setCroppedAreaPixels(croppedAreaPixelsVal);
  }, []);

  const handleApplyCropAndUpload = async () => {
    if (!croppedAreaPixels || !imageUrl) return;
    
    setUploading(true);
    try {
      const file = await getCroppedImg(imageUrl, croppedAreaPixels, rotation);
      if (!file) throw new Error("Failed to crop");
      
      const url = await uploadImage(dishId, file);
      setImageUrl(url);
      setRotation(0);
      setZoom(1);
      onSave(url);
      toast.success("Imagem cortada com perfeição e enviada!");
    } catch (err) {
      toast.error("Erro ao salvar imagem cortada");
    } finally {
      setUploading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith("image/")) {
      toast.error("Apenas imagens"); return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Máximo 10MB"); return;
    }
    setUploading(true);
    try {
      const url = await uploadImage(dishId, file);
      setImageUrl(url);
      setZoom(1);
      setRotation(0);
      onSave(url);
      toast.success("Imagem enviada! Você pode alinhar e cortar agora.");
    } catch (err) {
      toast.error("Erro ao enviar imagem");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = () => {
    if (newUrl) {
      onSave(newUrl); toast.success("URL atualizada");
    } else {
      onSave(imageUrl); toast.success("Imagem salva");
    }
    onClose();
  };

  return (
    <div className="space-y-4">
      {imageUrl ? (
        <div className="relative h-[400px] w-full bg-secondary/30 border border-border">
          <Cropper
            image={imageUrl}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={600 / 400}
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
            onRotationChange={setRotation}
          />
        </div>
      ) : (
        <div className="relative h-[400px] w-full bg-secondary/30 border border-border flex items-center justify-center">
          <span className="text-muted-foreground text-sm">Nenhuma imagem selecionada</span>
        </div>
      )}
      
      <div className="flex flex-col gap-1 mt-2 mb-4 bg-secondary/10 p-3 border border-border">
        <label className="text-xs text-muted-foreground flex justify-between font-medium">
          <span>Zoom (Barra de Rolagem / Lupa)</span>
          <span>{Math.round(zoom * 100)}%</span>
        </label>
        <input 
          type="range" 
          min={1} 
          max={3} 
          step={0.05} 
          value={zoom} 
          onChange={(e) => setZoom(Number(e.target.value))} 
          className="w-full accent-gold cursor-pointer" 
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <input ref={fileInputRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp" onChange={handleFileUpload} className="hidden" />
          <button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="flex items-center gap-2 px-4 py-2.5 bg-secondary text-foreground text-sm hover:bg-secondary/80 border border-border transition-colors disabled:opacity-50">
            {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />} {uploading ? "Enviando..." : "Substituir Foto"}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button onClick={handleApplyCropAndUpload} disabled={uploading || !imageUrl} className="flex items-center gap-1.5 px-3 py-2 text-xs border border-gold text-gold bg-gold/10 hover:bg-gold/20 disabled:opacity-50 transition-colors">
          <Crop size={14} /> Aplicar Corte e Salvar Na Galeria
        </button>
        <button onClick={() => setRotation(r => (r + 90) % 360)} className="flex items-center gap-1.5 px-3 py-2 text-xs border border-border text-muted-foreground hover:text-foreground">
          <RotateCw size={14} /> Girar 90º
        </button>
      </div>

      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Ou link direto de imagem externa</label>
        <input type="text" value={newUrl} onChange={(e) => setNewUrl(e.target.value)} placeholder="Cole uma URL..." className="w-full bg-secondary/50 border border-border px-3 py-2 text-sm focus:outline-none focus:border-gold/50" />
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t border-border">
        <button onClick={onClose} className="px-4 py-2 text-sm border border-border text-muted-foreground hover:text-foreground">Cancelar</button>
        <button onClick={handleSave} className="px-4 py-2 text-sm bg-gold text-primary-foreground hover:bg-gold-dark flex items-center gap-2"><Save size={14} /> Concluir e Fechar</button>
      </div>
    </div>
  );
}

function DishEditor({ dish, onClose }: { dish: Dish; onClose: () => void }) {
  const { updateDish, uploadImage } = useMenu();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    name: dish.name,
    nameFr: dish.nameFr || "",
    category: dish.category,
    description: dish.description || "",
    ingredients: (dish.ingredients as string[]) || [],
    allergens: (dish.allergens as string[]) || [],
    preparation: dish.preparation || "",
    curiosity: dish.curiosity || "",
    imageUrl: dish.imageUrl || "",
    price: dish.price || "",
    isNew: dish.isNew ?? false,
    isPromo: dish.isPromo ?? false,
  });
  const [showImageEditor, setShowImageEditor] = useState(false);

  const handleSave = () => {
    updateDish(dish.id, {
      name: form.name,
      nameFr: form.nameFr,
      category: form.category,
      description: form.description,
      ingredients: form.ingredients,
      allergens: form.allergens,
      preparation: form.preparation,
      curiosity: form.curiosity,
      imageUrl: form.imageUrl,
      price: form.price,
      isNew: form.isNew,
      isPromo: form.isPromo,
    });
    toast.success(`"${form.name}" atualizado com sucesso`);
    onClose();
  };

  const handleQuickUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Apenas arquivos de imagem são aceitos");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Imagem deve ter no máximo 10MB");
      return;
    }
    setUploading(true);
    try {
      const url = await uploadImage(dish.id, file);
      setForm(f => ({ ...f, imageUrl: url }));
      toast.success("Imagem enviada!");
    } catch {
      toast.error("Erro ao enviar imagem");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-5 max-h-[70vh] overflow-y-auto pr-2">
      {/* Image Preview & Editor */}
      <div className="relative aspect-video overflow-hidden border border-border group">
        {form.imageUrl ? (
          <img src={form.imageUrl} alt={form.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-secondary flex items-center justify-center">
            <ChefHat className="text-muted-foreground" size={48} />
          </div>
        )}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
          <button
            onClick={() => setShowImageEditor(true)}
            className="px-3 py-2 bg-white/20 backdrop-blur text-white text-sm flex items-center gap-2 hover:bg-white/30 transition-colors"
          >
            <Image size={16} /> Editar
          </button>
          <input ref={fileInputRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp" onChange={handleQuickUpload} className="hidden" />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="px-3 py-2 bg-white/20 backdrop-blur text-white text-sm flex items-center gap-2 hover:bg-white/30 transition-colors disabled:opacity-50"
          >
            {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
            {uploading ? "Enviando..." : "Enviar JPG"}
          </button>
        </div>
      </div>

      {showImageEditor && (
        <ImageEditor
          src={form.imageUrl}
          dishId={dish.id}
          onSave={(url) => setForm(f => ({ ...f, imageUrl: url }))}
          onClose={() => setShowImageEditor(false)}
        />
      )}

      {/* Form Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Nome</label>
          <input
            value={form.name}
            onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
            className="w-full bg-secondary/50 border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-gold/50"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Nome em Francês</label>
          <input
            value={form.nameFr}
            onChange={(e) => setForm(f => ({ ...f, nameFr: e.target.value }))}
            className="w-full bg-secondary/50 border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-gold/50"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Preço</label>
          <input
            value={form.price}
            onChange={(e) => setForm(f => ({ ...f, price: e.target.value }))}
            placeholder="R$ 0,00"
            className="w-full bg-secondary/50 border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold/50"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Categoria</label>
          <select
            value={form.category}
            onChange={(e) => setForm(f => ({ ...f, category: e.target.value as Dish["category"] }))}
            className="w-full bg-secondary/50 border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-gold/50"
          >
            {categoryOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Descrição</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
          rows={2}
          className="w-full bg-secondary/50 border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-gold/50 resize-y min-h-[80px]"
        />
      </div>

      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Ingredientes (um por linha)</label>
        <textarea
          value={form.ingredients.join("\n")}
          onChange={(e) => setForm(f => ({ ...f, ingredients: e.target.value.split("\n").filter(Boolean) }))}
          rows={4}
          className="w-full bg-secondary/50 border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-gold/50 resize-y min-h-[80px]"
        />
      </div>

      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Alergênicos (um por linha)</label>
        <textarea
          value={form.allergens.join("\n")}
          onChange={(e) => setForm(f => ({ ...f, allergens: e.target.value.split("\n").filter(Boolean) }))}
          rows={2}
          className="w-full bg-secondary/50 border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-gold/50 resize-y min-h-[80px]"
        />
      </div>

      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Modo de Finalização</label>
        <textarea
          value={form.preparation}
          onChange={(e) => setForm(f => ({ ...f, preparation: e.target.value }))}
          rows={4}
          className="w-full bg-secondary/50 border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-gold/50 resize-y min-h-[80px]"
        />
      </div>

      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Curiosidades</label>
        <textarea
          value={form.curiosity}
          onChange={(e) => setForm(f => ({ ...f, curiosity: e.target.value }))}
          rows={3}
          className="w-full bg-secondary/50 border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-gold/50 resize-y min-h-[80px]"
        />
      </div>

      <div>
        <label className="text-xs text-muted-foreground mb-1 block">URL da Imagem</label>
        <input
          value={form.imageUrl}
          onChange={(e) => setForm(f => ({ ...f, imageUrl: e.target.value }))}
          className="w-full bg-secondary/50 border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-gold/50"
        />
      </div>

      <div className="flex gap-4">
        <label className="flex items-center gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            checked={form.isNew}
            onChange={(e) => setForm(f => ({ ...f, isNew: e.target.checked }))}
            className="accent-gold"
          />
          <Sparkles size={14} className="text-gold" /> Novo
        </label>
        <label className="flex items-center gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            checked={form.isPromo}
            onChange={(e) => setForm(f => ({ ...f, isPromo: e.target.checked }))}
            className="accent-gold"
          />
          <Tag size={14} className="text-gold" /> Promoção
        </label>
      </div>

      <div className="flex justify-end gap-2 pt-2 border-t border-border">
        <button onClick={onClose} className="px-4 py-2 text-sm border border-border text-muted-foreground hover:text-foreground transition-colors">
          Cancelar
        </button>
        <button onClick={handleSave} className="px-4 py-2 text-sm bg-gold text-primary-foreground hover:bg-gold-dark transition-colors flex items-center gap-2">
          <Save size={14} /> Salvar Alterações
        </button>
      </div>
    </div>
  );
}

function NewDishForm({ defaultCategory, onClose }: { defaultCategory: string, onClose: () => void }) {
  const { addDish, uploadImage } = useMenu();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [tempImageUrl, setTempImageUrl] = useState("");
  const [form, setForm] = useState({
    name: "",
    nameFr: "",
    category: (defaultCategory !== "all" ? defaultCategory : "entradas") as Dish["category"],
    description: "",
    ingredients: [] as string[],
    allergens: [] as string[],
    preparation: "",
    curiosity: "",
    imageUrl: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=400&fit=crop",
    imageKey: "",
    price: "",
    isNew: true,
    isPromo: false,
  });

  const handleSave = () => {
    if (!form.name) {
      toast.error("Nome é obrigatório");
      return;
    }
    addDish(form as any);
    toast.success(`"${form.name}" adicionado com sucesso`);
    onClose();
  };

  return (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Nome *</label>
          <input value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} className="w-full bg-secondary/50 border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-gold/50" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Nome em Francês</label>
          <input value={form.nameFr} onChange={(e) => setForm(f => ({ ...f, nameFr: e.target.value }))} className="w-full bg-secondary/50 border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-gold/50" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Preço</label>
          <input value={form.price} onChange={(e) => setForm(f => ({ ...f, price: e.target.value }))} placeholder="R$ 0,00" className="w-full bg-secondary/50 border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold/50" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Categoria</label>
          <select value={form.category} onChange={(e) => setForm(f => ({ ...f, category: e.target.value as Dish["category"] }))} className="w-full bg-secondary/50 border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-gold/50">
            {categoryOptions.map(opt => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
          </select>
        </div>
      </div>
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Descrição</label>
        <textarea value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} rows={2} className="w-full bg-secondary/50 border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-gold/50 resize-y min-h-[80px]" />
      </div>
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Ingredientes (um por linha)</label>
        <textarea value={form.ingredients.join("\n")} onChange={(e) => setForm(f => ({ ...f, ingredients: e.target.value.split("\n").filter(Boolean) }))} rows={3} className="w-full bg-secondary/50 border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-gold/50 resize-y min-h-[80px]" />
      </div>
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Alergênicos (um por linha)</label>
        <textarea value={form.allergens.join("\n")} onChange={(e) => setForm(f => ({ ...f, allergens: e.target.value.split("\n").filter(Boolean) }))} rows={2} className="w-full bg-secondary/50 border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-gold/50 resize-y min-h-[80px]" />
      </div>
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Modo de Finalização</label>
        <textarea value={form.preparation} onChange={(e) => setForm(f => ({ ...f, preparation: e.target.value }))} rows={3} className="w-full bg-secondary/50 border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-gold/50 resize-y min-h-[80px]" />
      </div>
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Curiosidades</label>
        <textarea value={form.curiosity} onChange={(e) => setForm(f => ({ ...f, curiosity: e.target.value }))} rows={2} className="w-full bg-secondary/50 border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-gold/50 resize-y min-h-[80px]" />
      </div>
      <div>
        <label className="text-xs text-muted-foreground mb-2 block">Foto do Prato</label>
        <div className="flex gap-3 mb-2">
          <button 
            type="button"
            onClick={() => fileInputRef.current?.click()} 
            className="px-4 py-2 bg-secondary border border-border text-sm flex items-center gap-2 hover:bg-secondary/80 transition-colors"
            disabled={uploading}
          >
            {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />} 
            {uploading ? "Enviando..." : "Fazer Upload (JPEG/PNG/WEBP)"}
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            setUploading(true);
            try {
              const url = await uploadImage(0, file);
              setForm(f => ({ ...f, imageUrl: url }));
              toast.success("Foto enviada com sucesso! Você já pode salvar o prato.");
            } catch (err) {
              toast.error("Erro no upload");
            } finally {
              setUploading(false);
            }
          }} />
          {form.imageUrl && form.imageUrl.startsWith('http') && (
            <img src={form.imageUrl} alt="preview" className="h-[42px] w-[60px] object-cover border border-border" />
          )}
        </div>
        <p className="text-xs text-muted-foreground mb-1 mt-3">Ou cole uma URL externa:</p>
        <input value={form.imageUrl} onChange={(e) => setForm(f => ({ ...f, imageUrl: e.target.value }))} className="w-full bg-secondary/50 border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-gold/50" />
      </div>
      <div className="flex justify-end gap-2 pt-2 border-t border-border">
        <button onClick={onClose} className="px-4 py-2 text-sm border border-border text-muted-foreground hover:text-foreground transition-colors">Cancelar</button>
        <button onClick={handleSave} className="px-4 py-2 text-sm bg-gold text-primary-foreground hover:bg-gold-dark transition-colors flex items-center gap-2">
          <Plus size={14} /> Adicionar Prato
        </button>
      </div>
    </div>
  );
}

export default function Admin() {
  const { dishes, removeDish, isLoading, updateDish } = useMenu();
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const reorderMutation = trpc.dishes.reorder.useMutation({
    onSuccess: () => {
      utils.dishes.list.invalidate();
      toast.success("Cardápio reordenado com sucesso!");
    }
  });
  const [editingDish, setEditingDish] = useState<Dish | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [filterCat, setFilterCat] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  const [passwordInput, setPasswordInput] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);

  const isDev = import.meta.env.DEV;

  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-sm mx-auto px-6 w-full">
          <Shield className="mx-auto text-gold mb-6" size={48} />
          <h2 className="font-serif text-2xl text-foreground mb-3">Acesso Restrito</h2>
          <p className="text-muted-foreground mb-8 text-sm">
            Área exclusiva da administração. Digite a senha para continuar.
          </p>
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              const validPass = import.meta.env.VITE_ADMIN_PASSWORD || "lavenue2026";
              if (passwordInput === validPass) {
                setIsUnlocked(true);
              } else {
                toast.error("Senha incorreta");
              }
            }}
            className="flex flex-col gap-3"
          >
            <input 
              type="password"
              placeholder="Sua senha secreta..."
              value={passwordInput}
              onChange={e => setPasswordInput(e.target.value)}
              className="w-full bg-secondary/50 border border-border px-4 py-3 text-center text-foreground focus:outline-none focus:border-gold/50"
              autoFocus
            />
            <button 
              type="submit"
              className="w-full bg-gold text-white py-3 mt-1 hover:bg-gold-dark transition-colors font-medium tracking-wide"
            >
              ENTRAR
            </button>
            <Link href="/" className="text-center text-sm text-muted-foreground hover:text-gold transition-colors mt-6 block">
              Voltar ao Cardápio
            </Link>
          </form>
        </div>
      </div>
    );
  }

  const isAdmin = user?.role === "admin";

  if (!isDev && !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <Shield className="mx-auto text-destructive mb-6" size={48} />
          <h2 className="font-serif text-2xl text-foreground mb-3">Sem Permissão</h2>
          <p className="text-muted-foreground mb-8">
            Sua conta não possui permissão de administrador. Contate o responsável para obter acesso.
          </p>
          <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-gold text-primary-foreground text-sm hover:bg-gold-dark transition-colors">
            <ArrowLeft size={16} /> Voltar ao Menu
          </Link>
        </div>
      </div>
    );
  }

  const filtered = dishes.filter(d => {
    const matchesCat = filterCat === "all" || d.category === filterCat;
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || d.name.toLowerCase().includes(q) || (d.nameFr || "").toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  });

  const handleDelete = (id: number) => {
    const dish = dishes.find(d => d.id === id);
    removeDish(id);
    toast.success(`"${dish?.name}" removido`);
    setDeleteConfirm(null);
  };



  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    
    const oldIndex = filtered.findIndex(d => d.id === active.id);
    const newIndex = filtered.findIndex(d => d.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    
    // Sort logic respecting current boundaries
    const occupiedSorts = filtered.map(d => d.sortOrder).sort((a, b) => a - b);
    
    const newFiltered = [...filtered];
    const [moved] = newFiltered.splice(oldIndex, 1);
    newFiltered.splice(newIndex, 0, moved);
    
    const updates = newFiltered.map((d, idx) => ({ id: d.id, sortOrder: occupiedSorts[idx] }));
    reorderMutation.mutate(updates);
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
            <Link href="/" className="text-sm text-muted-foreground hover:text-gold transition-colors duration-300 flex items-center gap-2">
              <ArrowLeft size={16} />
              <span className="hidden sm:inline">Menu</span>
            </Link>
            <span className="text-xs text-muted-foreground hidden sm:inline">
              {user?.name || "Admin"}
            </span>
          </div>
        </div>
      </nav>

      <div className="pt-20 pb-12">
        <div className="container">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Shield className="text-gold" size={24} />
                <h2 className="font-serif text-2xl sm:text-3xl text-foreground">Painel Administrativo</h2>
              </div>
              <p className="text-sm text-muted-foreground">Gerencie pratos, preços, imagens e informações do cardápio</p>
            </div>
            <button
              onClick={() => setShowNewForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gold text-primary-foreground text-sm hover:bg-gold-dark transition-colors"
            >
              <Plus size={16} /> Novo Prato
            </button>
          </div>

          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <input
                type="text"
                placeholder="Buscar pratos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-secondary/50 border border-border pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold/50"
              />
            </div>
            <select
              value={filterCat}
              onChange={(e) => setFilterCat(e.target.value)}
              className="bg-secondary/50 border border-border px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-gold/50"
            >
              <option value="all">Todas as categorias</option>
              {categoryOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Loading */}
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin text-gold" size={32} />
            </div>
          ) : (
            <>
              {/* Dishes Table */}
              <div className="border border-border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-secondary/30 border-b border-border">
                        <th className="text-left px-4 py-3 text-xs text-muted-foreground tracking-wider uppercase font-medium">Prato</th>
                        <th className="text-left px-4 py-3 text-xs text-muted-foreground tracking-wider uppercase font-medium hidden md:table-cell">Categoria</th>
                        <th className="text-left px-4 py-3 text-xs text-muted-foreground tracking-wider uppercase font-medium hidden sm:table-cell">Preço</th>
                        <th className="text-left px-4 py-3 text-xs text-muted-foreground tracking-wider uppercase font-medium hidden lg:table-cell">Status</th>
                        <th className="text-right px-4 py-3 text-xs text-muted-foreground tracking-wider uppercase font-medium">Ações</th>
                      </tr>
                    </thead>
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                      <SortableContext items={filtered.map(d => d.id)} strategy={verticalListSortingStrategy}>
                        <tbody>
                          {filtered.map((dish) => (
                            <SortableRow key={dish.id} dish={dish} updateDish={updateDish} setEditingDish={setEditingDish} setDeleteConfirm={setDeleteConfirm} categoryLabels={categoryLabels} />
                          ))}
                        </tbody>
                      </SortableContext>
                    </DndContext>
                  </table>
                </div>
              </div>

              <p className="text-xs text-muted-foreground mt-4">{filtered.length} pratos listados</p>
            </>
          )}
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingDish} onOpenChange={() => setEditingDish(null)}>
        <DialogContent className="max-w-2xl bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl text-foreground">Editar Prato</DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm">
              Altere as informações do prato. As mudanças são refletidas imediatamente.
            </DialogDescription>
          </DialogHeader>
          {editingDish && <DishEditor dish={editingDish} onClose={() => setEditingDish(null)} />}
        </DialogContent>
      </Dialog>

      {/* New Dish Dialog */}
      <Dialog open={showNewForm} onOpenChange={setShowNewForm}>
        <DialogContent className="max-w-2xl bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl text-foreground">Novo Prato</DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm">
              Adicione um novo prato ao cardápio de treinamento.
            </DialogDescription>
          </DialogHeader>
          <NewDishForm defaultCategory={filterCat} onClose={() => setShowNewForm(false)} />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="max-w-sm bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl text-foreground">Confirmar Remoção</DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm">
              Tem certeza que deseja remover este prato? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 text-sm border border-border text-muted-foreground hover:text-foreground transition-colors">
              Cancelar
            </button>
            <button onClick={() => deleteConfirm && handleDelete(deleteConfirm)} className="px-4 py-2 text-sm bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors flex items-center gap-2">
              <Trash2 size={14} /> Remover
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
