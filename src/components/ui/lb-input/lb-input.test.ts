import { fixture, html, expect, oneEvent } from '@open-wc/testing';
import { LbInput } from './lb-input';
import './lb-input';

describe('LbInput', () => {
  it('should render with default props', async () => {
    const el = await fixture<LbInput>(html`<lb-input></lb-input>`);

    expect(el).to.exist;
    expect(el.type).to.equal('text');
    expect(el.disabled).to.be.false;
    expect(el.readonly).to.be.false;
  });

  it('should render with label', async () => {
    const el = await fixture<LbInput>(
      html`<lb-input label="Email"></lb-input>`
    );

    const label = el.shadowRoot?.querySelector('label');
    expect(label).to.exist;
    expect(label?.textContent).to.include('Email');
  });

  it('should show required indicator when required', async () => {
    const el = await fixture<LbInput>(
      html`<lb-input label="Email" required></lb-input>`
    );

    const label = el.shadowRoot?.querySelector('label');
    expect(label?.textContent).to.include('*');
  });

  it('should render with placeholder', async () => {
    const el = await fixture<LbInput>(
      html`<lb-input placeholder="Enter email"></lb-input>`
    );

    const input = el.shadowRoot?.querySelector('input');
    expect(input?.placeholder).to.equal('Enter email');
  });

  it('should handle value changes', async () => {
    const el = await fixture<LbInput>(html`<lb-input></lb-input>`);
    el.value = 'test@email.com';

    await el.updateComplete;

    const input = el.shadowRoot?.querySelector('input');
    expect(input?.value).to.equal('test@email.com');
  });

  it('should dispatch lb-input event on input', async () => {
    const el = await fixture<LbInput>(html`<lb-input></lb-input>`);
    const input = el.shadowRoot?.querySelector('input');

    setTimeout(() => {
      input!.value = 'test';
      input!.dispatchEvent(new Event('input'));
    });

    const { detail } = await oneEvent(el, 'lb-input');
    expect(detail.value).to.equal('test');
  });

  it('should show error message when invalid', async () => {
    const el = await fixture<LbInput>(
      html`<lb-input error errorMessage="Invalid email"></lb-input>`
    );

    const errorEl = el.shadowRoot?.querySelector('.error-message');
    expect(errorEl).to.exist;
    expect(errorEl?.textContent).to.equal('Invalid email');
  });

  it('should show helper text', async () => {
    const el = await fixture<LbInput>(
      html`<lb-input helperText="Enter your email address"></lb-input>`
    );

    const helper = el.shadowRoot?.querySelector('.helper-text');
    expect(helper).to.exist;
    expect(helper?.textContent).to.equal('Enter your email address');
  });

  it('should toggle password visibility', async () => {
    const el = await fixture<LbInput>(
      html`<lb-input type="password"></lb-input>`
    );

    const input = el.shadowRoot?.querySelector('input');
    expect(input?.type).to.equal('password');

    const toggleBtn = el.shadowRoot?.querySelector('.toggle-password');
    toggleBtn?.dispatchEvent(new Event('click'));

    await el.updateComplete;
    expect(input?.type).to.equal('text');
  });

  it('should clear value when clearable and clear button clicked', async () => {
    const el = await fixture<LbInput>(
      html`<lb-input value="test" clearable></lb-input>`
    );

    const clearBtn = el.shadowRoot?.querySelector('.clear-button');
    clearBtn?.dispatchEvent(new Event('click'));

    await el.updateComplete;
    expect(el.value).to.equal('');
  });
});
