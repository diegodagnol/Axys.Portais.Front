declare namespace App {
  interface Locals {
    /** Site resolvido pelo host, com as configurações efetivas (preenchido pelo middleware do portal). */
    site: import('./portal/api/client').Site;
    /** Host enviado à API em cada chamada. */
    host: string;
  }
}
