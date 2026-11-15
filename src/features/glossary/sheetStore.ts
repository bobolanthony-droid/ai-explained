/**
 * Which term (if any) the bottom sheet is showing.
 * Not saved anywhere: it only lives while the app is open.
 */
import { create } from 'zustand';

export const useTermSheet = create<{ termId: string | null }>()(() => ({ termId: null }));

export const openTerm = (termId: string) => useTermSheet.setState({ termId });
export const closeTerm = () => useTermSheet.setState({ termId: null });
