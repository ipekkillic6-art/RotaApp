import { useCallback, useMemo, useState } from 'react';
import { useAddressStore } from '../stores/addressStore';
import {
  INITIAL_ADDRESS_FORM,
  addressErrors,
  canSubmitAddress,
  toCreateAddressPayload,
  type AddressForm,
} from '../utils/addressValidation';
import type { Address } from '../types';

/**
 * Adres ekleme formu. State ekrana değil buraya ait (ekran saf/kontrollü).
 * Hatalar yalnızca ilk kaydet denemesinden sonra gösterilir — kullanıcıya
 * daha yazmadan kırmızı gösterme.
 */
export function useAddressForm() {
  const [form, setForm] = useState<AddressForm>(INITIAL_ADDRESS_FORM);
  const [submitted, setSubmitted] = useState(false);
  const add = useAddressStore((s) => s.add);
  const saving = useAddressStore((s) => s.saving);
  const error = useAddressStore((s) => s.error);

  const update = useCallback(
    (patch: Partial<AddressForm>) => setForm((f) => ({ ...f, ...patch })),
    [],
  );

  const errors = useMemo(() => (submitted ? addressErrors(form) : {}), [form, submitted]);
  const canSubmit = useMemo(() => canSubmitAddress(form), [form]);

  const submit = useCallback(async (): Promise<Address | null> => {
    setSubmitted(true);
    if (!canSubmitAddress(form)) return null;
    return add(toCreateAddressPayload(form));
  }, [form, add]);

  return { form, update, errors, canSubmit, saving, error, submit };
}
