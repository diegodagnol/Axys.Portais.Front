/**
 * <axys-carousel>: melhora progressiva sobre um trilho com scroll-snap. Sem JavaScript, o trilho continua rolável
 * (e arrastável no celular); com ele, ganha setas, indicadores, troca automática e pausa.
 *
 * Marcação esperada (ver Hero.astro):
 *   [data-carousel-track] > slides (cada um com data-interval em segundos)
 *   [data-carousel-prev], [data-carousel-next], [data-carousel-toggle], [data-carousel-dots]
 *
 * Acessibilidade (padrão de carrossel do WAI-ARIA APG): pausa ao passar o mouse ou focar, botão de pausar/retomar,
 * sem troca automática com prefers-reduced-motion, slides fora da tela ficam `inert`, anúncio só quando pausado.
 */
const DEFAULT_INTERVAL_S = 6;

class AxysCarousel extends HTMLElement {
  #track!: HTMLElement;
  #slides: HTMLElement[] = [];
  #dots: HTMLButtonElement[] = [];
  #toggle: HTMLButtonElement | null = null;
  #index = 0;
  #timer: number | undefined;
  #playing = true;
  #held = false;
  #reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  #observer: IntersectionObserver | undefined;
  #abort = new AbortController();
  /** Destino de uma navegação pelos controles: slides intermediários que passam na rolagem são ignorados. */
  #pendingTarget: number | undefined;
  #pendingTimeout: number | undefined;

  connectedCallback() {
    const track = this.querySelector<HTMLElement>('[data-carousel-track]');
    if (!track) return;
    this.#track = track;
    this.#slides = [...track.children] as HTMLElement[];
    if (this.#slides.length < 2) return;

    const signal = this.#abort.signal;
    this.#playing = !this.#reducedMotion;

    this.querySelector('[data-carousel-prev]')?.addEventListener('click', () => this.goTo(this.#index - 1), { signal });
    this.querySelector('[data-carousel-next]')?.addEventListener('click', () => this.goTo(this.#index + 1), { signal });

    this.#toggle = this.querySelector<HTMLButtonElement>('[data-carousel-toggle]');
    this.#toggle?.addEventListener('click', () => this.#setPlaying(!this.#playing), { signal });

    const dotsContainer = this.querySelector('[data-carousel-dots]');
    this.#dots = this.#slides.map((_, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'carousel__dot';
      dot.setAttribute('aria-label', `Ir para o destaque ${i + 1} de ${this.#slides.length}`);
      dot.addEventListener('click', () => this.goTo(i), { signal });
      dotsContainer?.append(dot);
      return dot;
    });

    // Pausa enquanto o visitante interage; retoma ao sair (se não foi pausado pelo botão).
    this.addEventListener('mouseenter', () => this.#hold(true), { signal });
    this.addEventListener('mouseleave', () => this.#hold(false), { signal });
    this.addEventListener('focusin', () => this.#hold(true), { signal });
    this.addEventListener('focusout', (e) => {
      if (!this.contains(e.relatedTarget as Node | null)) this.#hold(false);
    }, { signal });
    this.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') this.goTo(this.#index - 1);
      if (e.key === 'ArrowRight') this.goTo(this.#index + 1);
    }, { signal });
    document.addEventListener('visibilitychange', () => (document.hidden ? this.#stop() : this.#schedule()), { signal });

    // O slide visível define o índice: cobre setas, indicadores e também o arrastar do dedo.
    this.#observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const index = this.#slides.indexOf(entry.target as HTMLElement);
          if (this.#pendingTarget !== undefined) {
            if (index !== this.#pendingTarget) continue;
            this.#pendingTarget = undefined;
          }
          this.#setIndex(index);
        }
      },
      { root: this.#track, threshold: 0.6 },
    );
    this.#slides.forEach((slide) => this.#observer!.observe(slide));

    this.setAttribute('data-ready', '');
    this.#setIndex(0);
    this.#setPlaying(this.#playing);
  }

  disconnectedCallback() {
    this.#stop();
    window.clearTimeout(this.#pendingTimeout);
    this.#observer?.disconnect();
    this.#abort.abort();
  }

  goTo(index: number) {
    const total = this.#slides.length;
    const target = (index + total) % total;
    this.#pendingTarget = target;
    // Rede de segurança: se a rolagem não chegar ao destino (ex.: interrompida pelo visitante), volta a seguir o observer.
    window.clearTimeout(this.#pendingTimeout);
    this.#pendingTimeout = window.setTimeout(() => (this.#pendingTarget = undefined), 1_500);
    this.#track.scrollTo({
      left: this.#slides[target]!.offsetLeft,
      behavior: this.#reducedMotion ? 'auto' : 'smooth',
    });
    this.#setIndex(target);
  }

  #setIndex(index: number) {
    if (index < 0) return;
    this.#index = index;
    this.#slides.forEach((slide, i) => {
      slide.inert = i !== index;
    });
    this.#dots.forEach((dot, i) => dot.setAttribute('aria-current', String(i === index)));
    this.#schedule();
  }

  #setPlaying(playing: boolean) {
    this.#playing = playing;
    if (this.#toggle) {
      this.#toggle.setAttribute('aria-pressed', String(!playing));
      this.#toggle.textContent = playing ? 'Pausar' : 'Retomar';
    }
    // Trocando sozinho, não anuncia cada slide; parado, o leitor de tela anuncia a troca feita pelo visitante.
    this.#track.setAttribute('aria-live', playing ? 'off' : 'polite');
    this.#schedule();
  }

  #hold(held: boolean) {
    this.#held = held;
    this.#schedule();
  }

  #stop() {
    window.clearTimeout(this.#timer);
    this.#timer = undefined;
  }

  #schedule() {
    this.#stop();
    if (!this.#playing || this.#held || document.hidden) return;
    const seconds = Number(this.#slides[this.#index]?.dataset.interval) || DEFAULT_INTERVAL_S;
    this.#timer = window.setTimeout(() => this.goTo(this.#index + 1), seconds * 1_000);
  }
}

if (!customElements.get('axys-carousel')) {
  customElements.define('axys-carousel', AxysCarousel);
}
