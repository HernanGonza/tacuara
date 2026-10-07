declare module "scrollreveal" {
  const ScrollReveal: (options?: Record<string, unknown>) => {
    reveal: (target: string | Element | Element[], options?: Record<string, unknown>) => unknown;
    clean: (target: string | Element) => unknown;
    destroy: () => void;
  };
  export default ScrollReveal;
}
