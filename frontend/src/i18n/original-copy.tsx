'use client';
import { useLanguage } from './provider';
import { originalCopy } from './original-catalog';
export function useOriginalCopy() { const {locale}=useLanguage(); return (text:string)=>originalCopy(locale,text); }
