import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type AvatarShape = 'circle' | 'square';

/**
 * SendellBank Avatar Component
 * @element lb-avatar
 */
@customElement('lb-avatar')
export class LbAvatar extends LitElement {
  static styles = css`
    :host {
      display: inline-flex;
    }

    .avatar {
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      background: var(--lb-color-primary-100);
      color: var(--lb-color-primary-700);
      font-weight: var(--lb-font-weight-medium);
      text-transform: uppercase;
      user-select: none;
    }

    .circle {
      border-radius: var(--lb-radius-full);
    }

    .square {
      border-radius: var(--lb-radius-md);
    }

    /* Sizes */
    .size-xs {
      width: 24px;
      height: 24px;
      font-size: var(--lb-font-size-xs);
    }

    .size-sm {
      width: 32px;
      height: 32px;
      font-size: var(--lb-font-size-sm);
    }

    .size-md {
      width: 40px;
      height: 40px;
      font-size: var(--lb-font-size-md);
    }

    .size-lg {
      width: 56px;
      height: 56px;
      font-size: var(--lb-font-size-xl);
    }

    .size-xl {
      width: 80px;
      height: 80px;
      font-size: var(--lb-font-size-3xl);
    }

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    /* Status indicator */
    .avatar-wrapper {
      position: relative;
      display: inline-flex;
    }

    .status {
      position: absolute;
      bottom: 0;
      right: 0;
      width: 25%;
      height: 25%;
      min-width: 8px;
      min-height: 8px;
      border-radius: var(--lb-radius-full);
      border: 2px solid var(--lb-color-surface);
    }

    .status-online {
      background: var(--lb-color-success);
    }

    .status-offline {
      background: var(--lb-color-neutral-400);
    }

    .status-busy {
      background: var(--lb-color-error);
    }

    .status-away {
      background: var(--lb-color-warning);
    }
  `;

  @property({ type: String }) src = '';
  @property({ type: String }) alt = '';
  @property({ type: String }) name = '';
  @property({ type: String }) size: AvatarSize = 'md';
  @property({ type: String }) shape: AvatarShape = 'circle';
  @property({ type: String }) status?: 'online' | 'offline' | 'busy' | 'away';

  @state() private _imageError = false;

  private _getInitials(): string {
    if (!this.name) return '?';
    const parts = this.name.trim().split(/\s+/);
    if (parts.length === 1) {
      return parts[0].charAt(0);
    }
    return parts[0].charAt(0) + parts[parts.length - 1].charAt(0);
  }

  render() {
    const classes = {
      avatar: true,
      [`size-${this.size}`]: true,
      [this.shape]: true,
    };

    const hasImage = this.src && !this._imageError;

    return html`
      <div class="avatar-wrapper">
        <div class=${classMap(classes)}>
          ${hasImage
            ? html`
                <img
                  src=${this.src}
                  alt=${this.alt || this.name}
                  @error=${() => (this._imageError = true)}
                />
              `
            : html`${this._getInitials()}`}
        </div>
        ${this.status
          ? html`<span class="status status-${this.status}"></span>`
          : ''}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'lb-avatar': LbAvatar;
  }
}
