import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen bg-background text-foreground">
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
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-20 container max-w-3xl">
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <section className="text-center space-y-4">
            <h1 className="font-serif text-4xl md:text-5xl text-gold">L'Avenue de Paris</h1>
            <h2 className="text-xl md:text-2xl text-muted-foreground uppercase tracking-widest">A Nossa História</h2>
          </section>

          <div className="space-y-8 text-lg text-muted-foreground leading-relaxed">
            <img src="/hero.webp" alt="Ambiente L'Avenue" className="w-full h-64 object-cover object-center rounded-sm" />
            
            <h3 className="text-foreground font-serif text-2xl">Nossa Origem</h3>
            <p>
              O L'Avenue nasceu da paixão pela autêntica culinária combinada com a sofisticação da alta gastronomia contemporânea. Nossas raízes valorizam o ambiente clássico e o paladar exigente.
            </p>

            <h3 className="text-foreground font-serif text-2xl">O Nosso Conceito</h3>
            <p>
              Buscamos oferecer muito mais do que apenas uma refeição. Proporcionamos uma verdadeira experiência. Cada detalhe, do serviço impecável à seleção criteriosa dos ingredientes, reflete nosso compromisso com a excelência.
            </p>

            <h3 className="text-foreground font-serif text-2xl">Para os Novos Colaboradores</h3>
            <p>
              Seja bem-vindo à família L'Avenue! Seu papel é fundamental para garantirmos o padrão que nossos clientes esperam e merecem. Utilize este painel diariamente para conhecer os detalhes de cada prato, tirar dúvidas sobre o menu e entender perfeitamente como nossas criações devem ser finalizadas, explicadas e apresentadas à mesa.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
