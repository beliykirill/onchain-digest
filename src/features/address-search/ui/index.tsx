import { type FC, type FormEvent, useId, useState } from 'react';
import { AnimatePresence, useReducedMotion } from 'framer-motion';
import { useWalletParams } from 'shared/lib/hooks';
import { cdnify } from 'shared/lib/themes';
import { getAddressError } from '../lib';
import { EXAMPLE_WALLETS } from './constants';
import {
  ButtonIcon,
  ErrorText,
  ExampleButton,
  ExamplesContainer,
  ExamplesText,
  LabelText,
  InputWrapper,
  Layout,
  PasteButton,
  SubmitButton,
  TextInput,
} from './styled';
import type { AddressSearchType } from './types';

interface IAddressSearchProps {
  type: AddressSearchType;
}

export const AddressSearch: FC<IAddressSearchProps> = ({ type }) => {
  const inputId = useId();
  const shouldReduceMotion = useReducedMotion();
  const { rawAddress, address, setAddress } = useWalletParams();
  const [value, setValue] = useState(rawAddress);
  const [isValidationVisible, setIsValidationVisible] = useState(Boolean(rawAddress && !address));
  const error = isValidationVisible ? getAddressError(value) : null;

  const submit = (next: string) => {
    const nextError = getAddressError(next);

    setIsValidationVisible(true);

    if (nextError) return;

    setAddress(next.trim());
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submit(value);
  };

  const handlePaste = async () => {
    try {
      const text = (await navigator.clipboard.readText()).trim();

      if (!text) return;

      setValue(text);
      submit(text);
    } catch {
      document.getElementById(inputId)?.focus();
    }
  };

  return (
    <Layout $type={type} noValidate onSubmit={handleSubmit}>
      <InputWrapper $type={type} $hasError={Boolean(error)}>
        <LabelText htmlFor={inputId}>Wallet address</LabelText>
        <TextInput
          id={inputId}
          value={value}
          placeholder="Paste an EVM or Solana address"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          enterKeyHint="go"
          onChange={(event) => setValue(event.target.value)}
          onBlur={() => setIsValidationVisible(Boolean(value.trim()))}
        />
        <PasteButton type="button" $type="ghost" onClick={handlePaste}>
          <ButtonIcon $icon={cdnify('/static/images/common/paste.svg')} />
          Paste
        </PasteButton>
      </InputWrapper>
      {type === 'hero' && (
        <SubmitButton type="submit" $type="primary">
          Show digest
          <ButtonIcon $icon={cdnify('/static/images/common/arrow-right.svg')} />
        </SubmitButton>
      )}
      <AnimatePresence initial={false}>
        {error && (
          <ErrorText
            key="error"
            initial={shouldReduceMotion ? false : { opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={
              shouldReduceMotion
                ? { opacity: 0, transition: { duration: 0 } }
                : { opacity: 0, y: -4 }
            }
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            {error}
          </ErrorText>
        )}
      </AnimatePresence>
      {type === 'hero' && (
        <ExamplesContainer>
          <ExamplesText>Try:</ExamplesText>
          {EXAMPLE_WALLETS.map((example) => (
            <ExampleButton
              key={example.address}
              type="button"
              $type="secondary"
              onClick={() => {
                setValue(example.address);
                submit(example.address);
              }}
            >
              {example.label}
            </ExampleButton>
          ))}
        </ExamplesContainer>
      )}
    </Layout>
  );
};
