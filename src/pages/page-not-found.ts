import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { Router } from '@vaadin/router';

// Import components
import '../components/ui/lb-button/lb-button';

/**
 * SendellBank 404 Page
 * @element page-not-found
 */
@customElement('page-not-found')
export class PageNotFound extends LitElement {
  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: var(--lb-space-6);
      background: var(--lb-color-background);
    }

    .container {
      text-align: center;
      max-width: 500px;
    }

    .error-code {
      font-size: 8rem;
      font-weight: var(--lb-font-weight-bold);
      background: var(--lb-gradient-primary);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      line-height: 1;
      margin-bottom: var(--lb-space-4);
    }

    .error-title {
      font-size: var(--lb-font-size-2xl);
      font-weight: var(--lb-font-weight-semibold);
      color: var(--lb-color-text-primary);
      margin-bottom: var(--lb-space-3);
    }

    .error-message {
      font-size: var(--lb-font-size-md);
      color: var(--lb-color-text-secondary);
      margin-bottom: var(--lb-space-8);
      line-height: 1.6;
    }

    .actions {
      display: flex;
      flex-direction: column;
      gap: var(--lb-space-3);
      align-items: center;
    }

    .home-link {
      color: var(--lb-color-primary-500);
      text-decoration: none;
      font-size: var(--lb-font-size-sm);
    }

    .home-link:hover {
      text-decoration: underline;
    }

    .illustration {
      margin-bottom: var(--lb-space-6);
      font-size: 4rem;
    }

    @media (max-width: 480px) {
      .error-code {
        font-size: 5rem;
      }
    }
  `;

  render() {
    return html`
      <div class="container">
        <div class="illustration">🏦</div>
        <div class="error-code">404</div>
        <h1 class="error-title">Página no encontrada</h1>
        <p class="error-message">
          Lo sentimos, la página que buscas no existe o ha sido movida.
          Verifica la URL o regresa al inicio.
        </p>
        <div class="actions">
          <lb-button @click=${this._goHome}>
            Ir al Inicio
          </lb-button>
          <a class="home-link" @click=${this._goBack}>
            ← Volver a la página anterior
          </a>
        </div>
      </div>
    `;
  }

  private _goHome() {
    Router.go('/');
  }

  private _goBack() {
    window.history.back();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'page-not-found': PageNotFound;
  }
}
