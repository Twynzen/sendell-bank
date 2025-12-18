import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';

// Import login component
import '../components/features/auth/bank-login';

/**
 * SendellBank Login Page
 * @element page-login
 */
@customElement('page-login')
export class PageLogin extends LitElement {
  static styles = css`
    :host {
      display: block;
    }
  `;

  render() {
    return html`<bank-login></bank-login>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'page-login': PageLogin;
  }
}
