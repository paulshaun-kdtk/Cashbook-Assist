import { RootState } from '@/redux/store';
import { useSelector } from 'react-redux';

export function useAuthUser() {
    const {user, loading, error} = useSelector((state: RootState) => state.auth);
    return {user, loading, error}
}
