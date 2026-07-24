import { useCallback, useMemo, useState } from 'react';
import { useAddressStore } from '../stores/addressStore';
import {
  INITIAL_ADDRESS_FORM,
  addressErrors,
  addressToForm,
  canSubmitAddress,
  toCreateAddressPayload,
  type AddressForm,
} from '../utils/addressValidation';
import type { Address } from '../types';

/**
 * Adres ekleme/düzenleme formu. State ekrana değil buraya ait (ekran saf).
 * `initial` verilirse düzenleme modu: form ön-dolar, submit `update` çağırır,
 * ayrıca `remove` ile silme sağlanır. Hatalar ilk kaydet denemesinden sonra
 * gösterilir — kullanıcıya daha yazmadan kırmızı gösterme.
 */
export function useAddressForm(initial?: Address) {
  const [form, setForm] = useState<AddressForm>(
    initial ? addressToForm(initial) : INITIAL_ADDRESS_FORM,
  );
  const [submitted, setSubmitted] = useState(false);
  const add = useAddressStore((s) => s.add);
  const updateAddress = useAddressStore((s) => s.update);
  const removeAddress = useAddressStore((s) => s.remove);
  const saving = useAddressStore((s) => s.saving);
  const removing = useAddressStore((s) => s.removing);
  const error = useAddressStore((s) => s.error);

  const isEditing = initial != null;

  const update = useCallback(
    (patch: Partial<AddressForm>) => setForm((f) => ({ ...f, ...patch })),
    [],
  );

  const errors = useMemo(() => (submitted ? addressErrors(form) : {}), [form, submitted]);
  const canSubmit = useMemo(() => canSubmitAddress(form), [form]);

  const submit = useCallback(async (): Promise<Address | null> => {
    setSubmitted(true);
    if (!canSubmitAddress(form)) return null;
    const payload = toCreateAddressPayload(form);
    return initial ? updateAddress(initial.id, payload) : add(payload);
  }, [form, initial, add, updateAddress]);

  const remove = useCallback(
    (): Promise<boolean> => (initial ? removeAddress(initial.id) : Promise.resolve(false)),
    [initial, removeAddress],
  );

  return { form, update, errors, canSubmit, saving, removing, error, isEditing, submit, remove };
}
