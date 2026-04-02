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

          <div className="space-y-6 text-lg text-muted-foreground leading-relaxed text-justify">
            <img src="/hero.webp" alt="Ambiente L'Avenue" className="w-full h-80 object-cover object-center rounded-sm mb-8" />
            
            <h3 className="text-foreground font-serif text-2xl mb-4 text-left">História e Localização do L’Avenue</h3>
            <p>
              O L’Avenue é reconhecido como um dos maiores espaços “gastro-sociais” do mundo. Localizado na famosa esquina da Avenida Montaigne com a Rue François 1er — no coração do “Triângulo de Ouro” de Paris, onde estão as principais grifes de luxo —, o restaurante se consolidou como referência para a elite parisiense e visitantes internacionais.
            </p>
            <p>
              À frente do L’Avenue está o francês Alex Denis, sócio do empresário Jean-Louis Costes, proprietário do lendário Hotel Costes e de uma rede de restaurantes ultratrendy na cidade. O grupo é conhecido por oferecer uma experiência sofisticada e por manter a essência do cardápio em todos os seus endereços.
            </p>
            <p>
              Desde a inauguração, o L’Avenue se tornou ponto de encontro de celebridades do cinema, da música, da moda e das artes. Nomes como Brad Pitt, Marion Cotillard, Tom Hanks e Sting já passaram por aqui, além de grandes nomes do universo fashion. Ser visto no L’Avenue é fazer parte do cenário social mais exclusivo de Paris.
            </p>
            <p>
              A história do restaurante envolve encontros marcantes e um toque de ousadia. Antes do L’Avenue, Alex Denis foi atleta profissional de squash, graduado em comunicação e administração esportiva, e atuou como diretor do spa do Hotel Ritz, onde se conectou ao jet-set internacional. A oportunidade de assumir o L’Avenue surgiu quando Yves Carcelle, ex-presidente da Louis Vuitton, sugeriu a Alex e Jean-Louis Costes que revitalizassem o antigo Brasserie Elysée, parte do grupo LVMH.
            </p>
            <p>
              A dupla manteve detalhes clássicos na decoração, como as boiseries e a escada assinada por Jacques Grange, mas trouxe um ar de sofisticação descontraída, com poltronas escuras, franjas e mesinhas próximas, criando uma atmosfera intimista. Em poucos dias, o restaurante já era palco de eventos badalados, como a festa de aniversário da mãe de Leonardo DiCaprio, logo após o sucesso de Titanic. Com isso, o L’Avenue ganhou destaque imediato nas principais revistas e se tornou endereço obrigatório do universo fashion, com eventos da Vogue, almoços de grandes estilistas e presença constante de celebridades.
            </p>
            <p>
              Desde então, já foram servidas mais de 4,6 milhões de refeições no L’Avenue, e o sucesso levou à criação de outros restaurantes no grupo, como o elegante La Société na Rive Gauche, os tradicionais bistrôs Le Petit Lutétia e Square Rousseau, além do novo La Compagnie, prestes a inaugurar na Avenida Wagram.
            </p>
            <p>
              Em 2018, o L’Avenue expandiu para Nova York, abrindo uma filial no nono andar da Saks Fifth Avenue, com projeto assinado por Philippe Starck e acesso exclusivo de frente para a Catedral de St. Patrick. Em 2024, foi anunciada a abertura de uma nova unidade no Bal Harbour Shops, em Miami, marcando a entrada do grupo no mercado americano fora de Nova York. Em fevereiro de 2026, houve a mais recente abertura do grupo, com o L’Avenue em Dubai.
            </p>
            <p>
              A ideia de expansão para o Brasil surgiu anos antes, mas foi recentemente que se concretizou o primeiro L’Avenue da América do Sul.
            </p>
            <p>
              No Brasil, a operação é conduzida por um grupo que já possui outros restaurantes de destaque, como o Makoto e o Kotchi. Isso significa que as oportunidades dentro do grupo são reais e constantes — tanto para crescimento profissional quanto para quem deseja trilhar uma carreira sólida no setor de gastronomia de alto padrão.
            </p>

            <div className="my-10 h-[1px] bg-gradient-to-r from-transparent via-gold/50 to-transparent w-full" />

            <h3 className="text-foreground font-serif text-2xl mb-8 text-center px-4">Por que isso é importante para você que trabalha no L’Avenue?</h3>
            
            <ul className="space-y-8 list-none p-0 text-left">
              <li className="flex gap-4 items-start bg-secondary/20 p-5 rounded-sm border border-border/50 hover:border-gold/30 transition-colors">
                <span className="text-gold font-serif text-2xl mt-1">✦</span>
                <p className="m-0 text-base"><strong className="text-foreground font-serif text-xl font-normal block mb-1">Tradição, excelência e hospitalidade</strong> Você fará parte de uma equipe que representa o melhor da tradição parisiense em hospitalidade, serviço e gastronomia.</p>
              </li>
              <li className="flex gap-4 items-start bg-secondary/20 p-5 rounded-sm border border-border/50 hover:border-gold/30 transition-colors">
                <span className="text-gold font-serif text-2xl mt-1">✦</span>
                <p className="m-0 text-base"><strong className="text-foreground font-serif text-xl font-normal block mb-1">Ambiente inspirador</strong> Cada detalhe do restaurante foi pensado para oferecer uma experiência única, tanto para os clientes quanto para quem faz parte da equipe.</p>
              </li>
              <li className="flex gap-4 items-start bg-secondary/20 p-5 rounded-sm border border-border/50 hover:border-gold/30 transition-colors">
                <span className="text-gold font-serif text-2xl mt-1">✦</span>
                <p className="m-0 text-base"><strong className="text-foreground font-serif text-xl font-normal block mb-1">Reconhecimento internacional</strong> Trabalhar no L’Avenue é integrar um time de alto padrão em um restaurante aclamado mundialmente.</p>
              </li>
              <li className="flex gap-4 items-start bg-secondary/20 p-5 rounded-sm border border-border/50 hover:border-gold/30 transition-colors">
                <span className="text-gold font-serif text-2xl mt-1">✦</span>
                <p className="m-0 text-base"><strong className="text-foreground font-serif text-xl font-normal block mb-1">Oportunidades de carreira</strong> O grupo responsável pela operação no Brasil investe em diferentes conceitos gastronômicos e está em plena expansão, abrindo portas para o crescimento interno e movimentações entre as casas, como Makoto e Kotchi.</p>
              </li>
            </ul>

            <div className="bg-gold/5 border border-gold/20 p-8 rounded-sm mt-10">
              <p className="text-center font-serif text-xl text-gold-dark m-0 leading-relaxed">
                "Seja qual for seu setor, sua atuação contribui diretamente para manter o padrão de excelência e a reputação que o L’Avenue construiu ao longo das últimas décadas."
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
