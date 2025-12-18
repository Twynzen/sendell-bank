import { fixture, html, expect } from '@open-wc/testing';
import { LbButton } from './lb-button';
import './lb-button';

describe('LbButton', () => {
  it('should render with default props', async () => {
    const el = await fixture<LbButton>(html`<lb-button>Click me</lb-button>`);

    expect(el).to.exist;
    expect(el.variant).to.equal('primary');
    expect(el.size).to.equal('md');
    expect(el.disabled).to.be.false;
  });

  it('should render different variants', async () => {
    const variants = ['primary', 'secondary', 'outline', 'ghost', 'danger'] as const;

    for (const variant of variants) {
      const el = await fixture<LbButton>(
        html`<lb-button variant="${variant}">Button</lb-button>`
      );
      expect(el.variant).to.equal(variant);
    }
  });

  it('should render different sizes', async () => {
    const sizes = ['sm', 'md', 'lg'] as const;

    for (const size of sizes) {
      const el = await fixture<LbButton>(
        html`<lb-button size="${size}">Button</lb-button>`
      );
      expect(el.size).to.equal(size);
    }
  });

  it('should show loading spinner when loading', async () => {
    const el = await fixture<LbButton>(
      html`<lb-button loading>Loading</lb-button>`
    );

    expect(el.loading).to.be.true;
    const spinner = el.shadowRoot?.querySelector('lb-spinner');
    expect(spinner).to.exist;
  });

  it('should be disabled when disabled prop is true', async () => {
    const el = await fixture<LbButton>(
      html`<lb-button disabled>Disabled</lb-button>`
    );

    expect(el.disabled).to.be.true;
    const button = el.shadowRoot?.querySelector('button');
    expect(button?.disabled).to.be.true;
  });

  it('should dispatch click event when clicked', async () => {
    const el = await fixture<LbButton>(html`<lb-button>Click</lb-button>`);
    let clicked = false;

    el.addEventListener('click', () => {
      clicked = true;
    });

    const button = el.shadowRoot?.querySelector('button');
    button?.click();

    expect(clicked).to.be.true;
  });

  it('should not dispatch click when disabled', async () => {
    const el = await fixture<LbButton>(
      html`<lb-button disabled>Disabled</lb-button>`
    );
    let clicked = false;

    el.addEventListener('click', () => {
      clicked = true;
    });

    const button = el.shadowRoot?.querySelector('button');
    button?.click();

    expect(clicked).to.be.false;
  });

  it('should render as full width when fullWidth is true', async () => {
    const el = await fixture<LbButton>(
      html`<lb-button fullWidth>Full Width</lb-button>`
    );

    expect(el.fullWidth).to.be.true;
    const button = el.shadowRoot?.querySelector('button');
    expect(button?.classList.contains('full-width')).to.be.true;
  });
});
