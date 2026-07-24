import { useCallback, useMemo, useState } from 'react';
import { usePaymentStore } from '../stores/paymentStore';
import {
  INITIAL_CARD_FORM,
  canSubmitCard,
  cardErrors,
  detectBrand,
  digitsOnly,
  parseExpiry,
  type CardForm,
} from '../utils/cardValidation';
import type { PaymentCard } from '../types';

/**
 * Kart ekleme formu. State ekrana değil buraya ait (ekran saf). Tam kart
 * numarası yalnızca formda tutulur; kaydederken son 4 hane + marka çıkarılır.
 * Hatalar ilk kaydet denemesinden sonra gösterilir.
 */
export function useCardForm() {
  const [form, setForm] = useState<CardForm>(INITIAL_CARD_FORM);
  const [makeDefault, setMakeDefault] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const addCard = usePaymentStore((s) => s.addCard);
  const saving = usePaymentStore((s) => s.saving);
  const error = usePaymentStore((s) => s.error);

  const update = useCallback(
    (patch: Partial<CardForm>) => setForm((f) => ({ ...f, ...patch })),
    [],
  );

  const errors = useMemo(() => (submitted ? cardErrors(form) : {}), [form, submitted]);
  const canSubmit = useMemo(() => canSubmitCard(form), [form]);
  const brand = detectBrand(form.number);

  const submit = useCallback(async (): Promise<PaymentCard | null> => {
    setSubmitted(true);
    if (!canSubmitCard(form)) return null;
    const digits = digitsOnly(form.number);
    const expiry = parseExpiry(form.expiry);
    if (!expiry) return null;
    return addCard({
      brand: detectBrand(digits),
      last4: digits.slice(-4),
      expiryMonth: expiry.month,
      expiryYear: expiry.year,
      holderName: form.holder.trim(),
      makeDefault,
    });
  }, [form, makeDefault, addCard]);

  return { form, update, errors, canSubmit, brand, makeDefault, setMakeDefault, saving, error, submit };
}
