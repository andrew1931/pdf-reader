import { Input } from '../Form';
import { HashIcon } from '../icons/hash';
import { MailIcon } from '../icons/mail';
import { PassIcon } from '../icons/pass';

export const emailInput = () =>
   Input({
      label: 'Email',
      name: 'host',
      placeholder: 'Enter email address',
      icon: MailIcon,
   });

export const passInput = (label: string = 'Password') =>
   Input({
      label,
      name: 'password',
      placeholder: 'Enter password',
      icon: PassIcon,
   });

export const codeInput = () =>
   Input({
      label: 'Code',
      name: 'code',
      placeholder: 'Enter code from mail',
      icon: HashIcon,
   });
